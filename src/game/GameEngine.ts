import { Boat } from "../entities/Boat";
import { Helicopter } from "../entities/Helicopter";
import { MissSplash } from "../entities/MissSplash";
import { PalmTree } from "../entities/PalmTree";
import { Parachutist } from "../entities/Parachutist";
import { CollisionManager } from "./CollisionManager";
import { DifficultyManager } from "./DifficultyManager";
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HUD,
  MAX_MISSES,
  MISS_CLEAR_SCORES,
  BOAT,
  WATER_Y,
  PALM,
  type DifficultySettings,
  type GameMode,
  type Lane,
} from "./GameConfig";
import { SpriteManager, type SpriteId } from "./SpriteManager";

export type EngineSnapshot = {
  score: number;
  misses: number;
  mode: GameMode;
  playing: boolean;
  paused: boolean;
  gameOver: boolean;
  newHighScore: boolean;
  tier: DifficultySettings["tier"];
};

export type EngineCallbacks = {
  onCatch?: () => void;
  onMiss?: () => void;
  onMissClear?: () => void;
  onGameOver?: (score: number) => void;
  onNewHighScore?: () => void;
  onChange?: (snap: EngineSnapshot) => void;
};

const WAVE_ROWS = [
  { id: "wave_0" as SpriteId, y: WATER_Y, speed: 6 },
  { id: "wave_1" as SpriteId, y: WATER_Y + 9, speed: -4 },
  { id: "wave_2" as SpriteId, y: WATER_Y + 19, speed: 3 },
];

const CANVAS_SCALE = 2;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private sprites = new SpriteManager();
  private difficulty = new DifficultyManager();

  private boat = new Boat();
  private heli = new Helicopter();
  private palms = [new PalmTree("left"), new PalmTree("right")];
  private parachutists: Parachutist[] = [];
  private missSplashes: MissSplash[] = [];

  private mode: GameMode = "A";
  private score = 0;
  private misses = 0;
  private playing = false;
  private paused = false;
  private gameOver = false;
  private newHighScore = false;
  private bestScore = 0;
  /** Score milestones already used to clear misses (200 / 500). */
  private clearedMissThresholds = new Set<number>();

  private spawnTimer = 0;
  private missFlashTimer = 0;
  private waveOffsets = [0, 0, 0];
  private lastTime = 0;
  private raf = 0;
  private ready = false;
  private callbacks: EngineCallbacks = {};

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    canvas.width = GAME_WIDTH * CANVAS_SCALE;
    canvas.height = GAME_HEIGHT * CANVAS_SCALE;
    ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
  }

  setCallbacks(cb: EngineCallbacks): void {
    this.callbacks = cb;
  }

  async init(): Promise<void> {
    await this.sprites.init();
    this.ready = true;
    this.renderAttract();
    this.startLoop();
  }

  start(mode: GameMode, bestScore: number): void {
    this.mode = mode;
    this.bestScore = bestScore;
    this.score = 0;
    this.misses = 0;
    this.playing = true;
    this.paused = false;
    this.gameOver = false;
    this.newHighScore = false;
    this.clearedMissThresholds.clear();
    this.spawnTimer = 700;
    this.missFlashTimer = 0;
    this.parachutists = [];
    this.missSplashes = [];
    this.boat.reset();
    this.heli.reset();
    this.emit();
  }

  pause(): void {
    if (!this.playing || this.gameOver) return;
    this.paused = true;
    this.emit();
  }

  resume(): void {
    if (!this.playing || this.gameOver) return;
    this.paused = false;
    this.emit();
  }

  stop(): void {
    this.playing = false;
    this.paused = false;
    this.parachutists = [];
    this.missSplashes = [];
    this.emit();
  }

  /** Move the boat one column left or right (three positions only). */
  stepBoat(dir: "left" | "right"): void {
    if (!this.playing || this.paused) return;
    this.boat.step(dir);
  }

  getSnapshot(): EngineSnapshot {
    return {
      score: this.score,
      misses: this.misses,
      mode: this.mode,
      playing: this.playing,
      paused: this.paused,
      gameOver: this.gameOver,
      newHighScore: this.newHighScore,
      tier: this.difficulty.getSettings(this.score, this.mode).tier,
    };
  }

  destroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private emit(): void {
    this.callbacks.onChange?.(this.getSnapshot());
  }

  private startLoop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.lastTime = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(t - this.lastTime, 50);
      this.lastTime = t;
      if (this.playing && !this.paused) this.update(dt);
      else this.updateAmbient(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Waves keep scrolling on menus so the LCD never looks frozen. */
  private updateAmbient(dt: number): void {
    this.heli.update(dt);
    this.scrollWaves(dt);
  }

  private scrollWaves(dt: number): void {
    for (let i = 0; i < WAVE_ROWS.length; i++) {
      const w = this.sprites.size(WAVE_ROWS[i].id).w || GAME_WIDTH;
      this.waveOffsets[i] =
        (this.waveOffsets[i] + (WAVE_ROWS[i].speed * dt) / 1000 + w) % w;
    }
  }

  private update(dt: number): void {
    const settings = this.difficulty.getSettings(this.score, this.mode);

    this.boat.update(dt);
    this.heli.update(dt);
    this.scrollWaves(dt);

    if (this.missFlashTimer > 0) this.missFlashTimer -= dt;

    this.spawnTimer -= dt;
    const liveCount = this.parachutists.filter((p) => p.isLive()).length;
    if (this.spawnTimer <= 0 && liveCount < settings.maxSimultaneous) {
      const lane = Math.floor(Math.random() * 3) as Lane;
      this.parachutists.push(new Parachutist(lane, settings.fallSpeed));
      this.spawnTimer = settings.spawnIntervalMs * (0.8 + Math.random() * 0.4);
    }

    for (const p of this.parachutists) {
      const wasLive = p.isLive();
      p.update(dt);

      if (this.mode === "B" && p.isOnPath()) {
        this.tryPalmSnag(p, settings);
      }

      if (p.isLive() && p.dropY + 18 >= BOAT.y + BOAT.catchTop) {
        if (p.lane === this.boat.lane) {
          p.markCaught();
          this.score += 1;
          this.callbacks.onCatch?.();
          this.maybeClearMisses();
          this.emit();
          continue;
        }
      }

      if (wasLive && p.hasReachedWater()) {
        p.markMissed();
        this.beginMissSequence(p.lane);
      }
    }

    this.parachutists = this.parachutists.filter((p) => !p.remove);

    for (const s of this.missSplashes) {
      s.update(dt);
      if (s.isComplete() && !s.registered) {
        s.registered = true;
        this.registerMiss();
      }
    }
    this.missSplashes = this.missSplashes.filter((s) => !s.remove);
  }

  /**
   * Classic rule: reaching 200 or 500 points clears all accumulated misses.
   * Each milestone only fires once per run.
   */
  private maybeClearMisses(): void {
    for (const threshold of MISS_CLEAR_SCORES) {
      if (this.score < threshold) continue;
      if (this.clearedMissThresholds.has(threshold)) continue;
      this.clearedMissThresholds.add(threshold);
      if (this.misses <= 0) continue;
      this.misses = 0;
      this.missFlashTimer = 0;
      this.callbacks.onMissClear?.();
    }
  }

  private tryPalmSnag(p: Parachutist, settings: DifficultySettings): void {
    // Outer lanes can snag on the matching palm (left = lane 0, right = lane 2).
    if (p.lane === 1 || p.dropY > PALM.y + 28) return;
    const palm = this.palms[p.lane === 0 ? 0 : 1];
    if (!CollisionManager.overlaps(p.getPalmBounds(), palm.getFrondZone())) return;
    if (Math.random() >= settings.palmSnagChance) return;
    const delay =
      settings.palmDropMinMs +
      Math.random() * (settings.palmDropMaxMs - settings.palmDropMinMs);
    const hang = palm.getHangPoint();
    p.stickOnPalm(delay, hang.x, hang.y);
  }

  private beginMissSequence(lane: Lane): void {
    this.missSplashes.push(new MissSplash(lane));
    this.callbacks.onMiss?.();
  }

  private registerMiss(): void {
    this.misses += 1;
    this.missFlashTimer = 900;

    if (this.misses >= MAX_MISSES) {
      this.playing = false;
      this.gameOver = true;
      if (this.score > this.bestScore) {
        this.newHighScore = true;
        this.callbacks.onNewHighScore?.();
      }
      this.callbacks.onGameOver?.(this.score);
    }
    this.emit();
  }

  private renderAttract(): void {
    this.render();
  }

  private render(): void {
    if (!this.ready) return;
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = COLORS.lcd;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (const palm of this.palms) palm.render(ctx, this.sprites);

    for (let i = 0; i < WAVE_ROWS.length; i++) {
      const row = WAVE_ROWS[i];
      const w = this.sprites.size(row.id).w || GAME_WIDTH;
      let x = -this.waveOffsets[i];
      while (x < GAME_WIDTH) {
        this.sprites.draw(ctx, row.id, x, row.y);
        x += w;
      }
    }

    this.heli.render(ctx, this.sprites);
    for (const p of this.parachutists) p.render(ctx, this.sprites);
    this.boat.render(ctx, this.sprites);
    for (const s of this.missSplashes) s.render(ctx, this.sprites);

    this.sprites.drawScore(ctx, this.score, HUD.scoreX, HUD.scoreY, HUD.digitAdvance);

    if (this.misses > 0) {
      this.sprites.drawMissLabel(
        ctx,
        GAME_WIDTH - HUD.missLabelRight - HUD.missLabelW,
        HUD.missLabelY,
        HUD.missLabelW,
        HUD.missLabelH,
      );
      for (let i = 0; i < this.misses; i++) {
        this.sprites.drawMissIcon(
          ctx,
          i,
          GAME_WIDTH - HUD.missIconRight - HUD.missIconW - (this.misses - 1 - i) * HUD.missIconAdvance,
          HUD.missIconY,
          HUD.missIconW,
          HUD.missIconH,
        );
      }
    }

    if (this.missFlashTimer > 0 && Math.floor(this.missFlashTimer / 120) % 2 === 0) {
      this.sprites.drawMissLabel(
        ctx,
        Math.round((GAME_WIDTH - HUD.missLabelW) / 2),
        58,
        HUD.missLabelW,
        HUD.missLabelH,
      );
    }

    // Mode label last so waves / palms never cover it.
    if (this.playing || this.gameOver) {
      this.sprites.drawGameLabel(
        ctx,
        this.mode,
        HUD.modeLabelX,
        HUD.modeLabelY,
        HUD.modeLabelW,
        HUD.modeLabelH,
      );
    }
  }
}
