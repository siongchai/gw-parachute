import { Boat } from "../entities/Boat";
import { Helicopter } from "../entities/Helicopter";
import { PalmTree } from "../entities/PalmTree";
import { Parachutist } from "../entities/Parachutist";
import { Shark } from "../entities/Shark";
import { CollisionManager } from "./CollisionManager";
import { DifficultyManager } from "./DifficultyManager";
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HUD,
  laneCenterX,
  MAX_MISSES,
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
  onGameOver?: (score: number) => void;
  onNewHighScore?: () => void;
  onChange?: (snap: EngineSnapshot) => void;
};

const WAVE_ROWS = [
  { id: "wave_0" as SpriteId, y: WATER_Y, speed: 6 },
  { id: "wave_1" as SpriteId, y: WATER_Y + 9, speed: -4 },
  { id: "wave_2" as SpriteId, y: WATER_Y + 19, speed: 3 },
];

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private sprites = new SpriteManager();
  private difficulty = new DifficultyManager();

  private boat = new Boat();
  private heli = new Helicopter();
  private palms = [new PalmTree("left"), new PalmTree("right")];
  private parachutists: Parachutist[] = [];
  private sharks: Shark[] = [];

  private mode: GameMode = "A";
  private score = 0;
  private misses = 0;
  private playing = false;
  private paused = false;
  private gameOver = false;
  private newHighScore = false;
  private bestScore = 0;

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
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
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
    this.spawnTimer = 700;
    this.missFlashTimer = 0;
    this.parachutists = [];
    this.sharks = [];
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
    this.sharks = [];
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
          this.emit();
          continue;
        }
      }

      if (wasLive && p.hasReachedWater()) {
        p.splash();
        this.registerMiss(p.lane);
      }
    }

    this.parachutists = this.parachutists.filter((p) => !p.remove);

    for (const s of this.sharks) s.update(dt);
    this.sharks = this.sharks.filter((s) => !s.remove);
  }

  private tryPalmSnag(p: Parachutist, settings: DifficultySettings): void {
    if (p.lane !== 0 || p.dropY > PALM.y + 28) return;
    const palm = this.palms[0];
    if (!CollisionManager.overlaps(p.getPalmBounds(), palm.getFrondZone())) return;
    if (Math.random() >= settings.palmSnagChance) return;
    const delay =
      settings.palmDropMinMs +
      Math.random() * (settings.palmDropMaxMs - settings.palmDropMinMs);
    const hang = palm.getHangPoint();
    p.stickOnPalm(delay, hang.x, hang.y);
  }

  private registerMiss(lane: Lane): void {
    const x = laneCenterX(lane);
    this.misses += 1;
    this.missFlashTimer = 900;
    this.sharks.push(new Shark(x - 4, "attack", 4));
    this.sharks.push(new Shark(x - 34, "fin", 12));
    this.sharks.push(new Shark(x + 26, "fin", 16));
    this.callbacks.onMiss?.();

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
    for (const s of this.sharks) s.render(ctx, this.sprites);

    this.sprites.drawScore(ctx, this.score, HUD.scoreX, HUD.scoreY, HUD.digitAdvance);

    if (this.playing || this.gameOver) {
      const modeId = this.mode === "A" ? "label_game_a" : "label_game_b";
      this.sprites.draw(ctx, modeId, HUD.modeLabelX, HUD.modeLabelY);
    }

    if (this.misses > 0) {
      const label = this.sprites.size("label_miss");
      this.sprites.draw(
        ctx,
        "label_miss",
        GAME_WIDTH - label.w - 6,
        HUD.missLabelY,
      );
      for (let i = 0; i < this.misses; i++) {
        const iconId = `miss_icon_${i}` as SpriteId;
        const icon = this.sprites.size(iconId);
        this.sprites.draw(
          ctx,
          iconId,
          GAME_WIDTH - 6 - icon.w - (this.misses - 1 - i) * HUD.missIconAdvance,
          HUD.missIconY,
        );
      }
    }

    if (this.missFlashTimer > 0 && Math.floor(this.missFlashTimer / 120) % 2 === 0) {
      const label = this.sprites.size("label_miss");
      this.sprites.draw(
        ctx,
        "label_miss",
        Math.round((GAME_WIDTH - label.w) / 2),
        58,
      );
    }
  }
}
