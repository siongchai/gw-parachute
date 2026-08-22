import type { Rect } from "../game/CollisionManager";
import { DROP_PATHS, pathStepMs } from "../game/DropPaths";
import {
  parachutistXForLane,
  WATER_Y,
  type Lane,
  type ParachutistState,
} from "../game/GameConfig";
import type { SpriteId, SpriteManager } from "../game/SpriteManager";

const HANG_FRAMES: SpriteId[] = [
  "hang_0",
  "hang_1",
  "hang_2",
  "hang_3",
  "hang_4",
  "hang_5",
];

let nextId = 1;

export class Parachutist {
  id = nextId++;
  readonly lane: Lane;
  state: ParachutistState = "FALLING";
  remove = false;

  private cx: number;
  private y: number;
  private sprite: SpriteId;
  private pathStep = 0;
  private stepTimer = 0;
  private stepDuration: number;
  private vy: number;
  private atCatch = false;
  private catchHoldMs = 0;

  private stuckTimer = 0;
  private hangFrame = 0;

  constructor(lane: Lane, fallSpeed: number) {
    this.lane = lane;
    this.stepDuration = pathStepMs(fallSpeed);
    this.vy = fallSpeed;
    this.hangFrame = Math.floor(Math.random() * HANG_FRAMES.length);

    const first = DROP_PATHS[lane][0];
    this.cx = first.cx;
    this.y = first.y;
    this.sprite = first.sprite;
    this.stepTimer = this.stepDuration;
  }

  getCatchBounds(): Rect {
    const w = 18;
    const h = 12;
    return {
      x: this.cx - w / 2 + 3,
      y: this.y + 14,
      w: w - 6,
      h,
    };
  }

  getPalmBounds(): Rect {
    const w = 18;
    const h = 22;
    return { x: this.cx - w / 2, y: this.y, w, h };
  }

  isLive(): boolean {
    return this.state === "FALLING";
  }

  /** True while stepping through the fixed LCD path (before catch / miss). */
  isOnPath(): boolean {
    return this.isLive() && !this.atCatch;
  }

  get dropY(): number {
    return this.y;
  }

  update(dt: number): void {
    if (this.state === "CAUGHT") {
      this.remove = true;
      return;
    }

    if (this.state === "STUCK_ON_PALM") {
      this.stuckTimer -= dt;
      if (this.stuckTimer <= 0) {
        this.state = "FALLING";
        this.atCatch = true;
        this.catchHoldMs = 500;
        this.sprite = "fall_5";
        this.cx = parachutistXForLane(this.lane) + 9;
        this.vy *= 1.35;
      }
      return;
    }

    const path = DROP_PATHS[this.lane];

    if (!this.atCatch && this.pathStep < path.length - 1) {
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.pathStep += 1;
        const step = path[this.pathStep];
        this.cx = step.cx;
        this.y = step.y;
        this.sprite = step.sprite;
        this.stepTimer += this.stepDuration;

        if (this.pathStep >= path.length - 1) {
          this.atCatch = true;
          this.catchHoldMs = 650;
        }
      }
      return;
    }

    if (this.atCatch) {
      this.catchHoldMs -= dt;
      if (this.catchHoldMs > 0) return;
    }

    // Missed the catch window — drop into the water.
    this.sprite = "fall_5";
    this.cx = parachutistXForLane(this.lane) + 9;
    this.y += this.vy * (dt / 1000);
  }

  hasReachedWater(): boolean {
    return this.isLive() && this.y + 22 >= WATER_Y + 4;
  }

  markMissed(): void {
    this.remove = true;
  }

  stickOnPalm(delayMs: number, x: number, y: number): void {
    this.state = "STUCK_ON_PALM";
    this.stuckTimer = delayMs;
    this.cx = x + 9;
    this.y = y;
    this.atCatch = false;
  }

  markCaught(): void {
    this.state = "CAUGHT";
  }

  render(ctx: CanvasRenderingContext2D, sprites: SpriteManager): void {
    if (this.state === "CAUGHT") return;

    if (this.state === "STUCK_ON_PALM") {
      const { w } = sprites.size(HANG_FRAMES[this.hangFrame]);
      sprites.draw(ctx, HANG_FRAMES[this.hangFrame], this.cx - w / 2, this.y);
      return;
    }

    const { w } = sprites.size(this.sprite);
    sprites.draw(ctx, this.sprite, Math.round(this.cx - w / 2), Math.round(this.y));
  }
}
