import type { Rect } from "../game/CollisionManager";
import { BOAT, boatXForLane, LANES, type Lane } from "../game/GameConfig";
import type { SpriteManager } from "../game/SpriteManager";

export class Boat {
  lane: Lane = LANES.start;
  x = boatXForLane(LANES.start);

  reset(): void {
    this.lane = LANES.start;
    this.x = boatXForLane(this.lane);
  }

  /** Step one LCD column left or right. */
  step(dir: "left" | "right"): void {
    const next =
      dir === "left"
        ? (Math.max(0, this.lane - 1) as Lane)
        : (Math.min(2, this.lane + 1) as Lane);
    if (next === this.lane) return;

    this.lane = next;
    this.x = boatXForLane(next);
  }

  update(_dt: number): void {
    /* Lane pose is static per column — no frame animation. */
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
    sprites.drawBoat(
      ctx,
      this.lane,
      Math.round(this.x) + BOAT.laneXOffset[this.lane],
      BOAT.y + BOAT.laneYOffset[this.lane],
      BOAT.width,
      BOAT.height,
    );
  }
}
