import { LANES, type Lane } from "../game/GameConfig";
import type { SpriteManager } from "../game/SpriteManager";

const LCD_W = 22;

/** Top / bottom water rows under the boat (LCD mockup.jpg). */
const TOP_Y = 67;
const BOTTOM_Y = 74;

const LANE_X = LANES.centers.map((cx) => cx - LCD_W / 2) as [
  number,
  number,
  number,
];

/**
 * Two-lane miss path (LCD mockup), played right→left on top then left→right on bottom:
 *   Top:    splash 3 right · splash 2 center · splash 1 left
 *   Bottom: splash 6 left · splash 5 center · splash 4 right
 */
const FRAMES = [
  { sprite: 2, w: LCD_W, h: 22, x: LANE_X[2], y: TOP_Y },
  { sprite: 1, w: LCD_W, h: 23, x: LANE_X[1], y: TOP_Y },
  { sprite: 0, w: LCD_W, h: 27, x: LANE_X[0], y: TOP_Y },
  { sprite: 5, w: LCD_W, h: 19, x: LANE_X[0], y: BOTTOM_Y },
  { sprite: 4, w: LCD_W, h: 24, x: LANE_X[1], y: BOTTOM_Y },
  { sprite: 3, w: LCD_W, h: 22, x: LANE_X[2], y: BOTTOM_Y },
] as const;

export const MISS_SPLASH_FRAME_MS = 150;
export const MISS_SPLASH_MS = MISS_SPLASH_FRAME_MS * FRAMES.length;

export class MissSplash {
  readonly lane: Lane;
  remove = false;
  registered = false;
  private timer = 0;

  constructor(lane: Lane) {
    this.lane = lane;
  }

  update(dt: number): void {
    this.timer += dt;
    if (this.timer >= MISS_SPLASH_MS) this.remove = true;
  }

  isComplete(): boolean {
    return this.timer >= MISS_SPLASH_MS;
  }

  render(ctx: CanvasRenderingContext2D, sprites: SpriteManager): void {
    const i = Math.min(
      FRAMES.length - 1,
      Math.floor(this.timer / MISS_SPLASH_FRAME_MS),
    );
    const frame = FRAMES[i];
    sprites.drawMissSplash(
      ctx,
      frame.sprite,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
    );
  }
}
