import type { Rect } from "../game/CollisionManager";
import { BOAT, boatXForLane, LANES, type Lane } from "../game/GameConfig";
import type { SpriteId, SpriteManager } from "../game/SpriteManager";

const ROW_FRAMES: SpriteId[] = ["boat_0", "boat_1", "boat_2", "boat_3"];

export class Boat {
  lane: Lane = LANES.start;
  x = boatXForLane(LANES.start);

  private rowAnimLeft = 0;
  private frame = 0;
  private frameTimer = 0;

  reset(): void {
    this.lane = LANES.start;
    this.x = boatXForLane(this.lane);
    this.rowAnimLeft = 0;
    this.frame = 0;
    this.frameTimer = 0;
  }

  /** Step one LCD column left or right — same facing at every position. */
  step(dir: "left" | "right"): void {
    const next =
      dir === "left"
        ? (Math.max(0, this.lane - 1) as Lane)
        : (Math.min(2, this.lane + 1) as Lane);
    if (next === this.lane) return;

    this.lane = next;
    this.x = boatXForLane(next);
    this.rowAnimLeft = BOAT.rowAnimMs;
    this.frame = 1;
    this.frameTimer = 0;
  }

  update(dt: number): void {
    if (this.rowAnimLeft <= 0) {
      this.frame = 0;
      this.frameTimer = 0;
      return;
    }

    this.rowAnimLeft = Math.max(0, this.rowAnimLeft - dt);
    this.frameTimer += dt;
    if (this.frameTimer >= BOAT.rowFrameMs) {
      this.frameTimer = 0;
      this.frame = (this.frame + 1) % ROW_FRAMES.length;
    }
  }

  getCatchZone(): Rect {
    return {
      x: this.x + BOAT.catchInsetX,
      y: BOAT.y + BOAT.catchTop,
      w: BOAT.width - BOAT.catchInsetX * 2,
      h: BOAT.catchHeight,
    };
  }

  centerX(): number {
    return this.x + BOAT.width / 2;
  }

  render(ctx: CanvasRenderingContext2D, sprites: SpriteManager): void {
    const id = ROW_FRAMES[this.frame];
    const { h } = sprites.size(id);
    const bottom = BOAT.y + BOAT.height;
    // LCD segments keep the same orientation in every column — never flip.
    sprites.draw(ctx, id, Math.round(this.x), bottom - h);
  }
}
