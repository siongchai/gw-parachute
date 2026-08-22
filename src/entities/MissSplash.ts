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
 * Two-lane miss path (LCD mockup):
 *   Top:    splash 1 left · splash 2 center · splash 3 right
 *   Bottom: splash 4 right · splash 5 center · splash 6 left
 */
const FRAMES = [
  { w: LCD_W, h: 27, x: LANE_X[0], y: TOP_Y },
  { w: LCD_W, h: 23, x: LANE_X[1], y: TOP_Y },
  { w: LCD_W, h: 22, x: LANE_X[2], y: TOP_Y },
  { w: LCD_W, h: 22, x: LANE_X[2], y: BOTTOM_Y },
  { w: LCD_W, h: 24, x: LANE_X[1], y: BOTTOM_Y },
  { w: LCD_W, h: 19, x: LANE_X[0], y: BOTTOM_Y },
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
    sprites.drawMissSplash(ctx, i, frame.x, frame.y, frame.w, frame.h);
  }
}
