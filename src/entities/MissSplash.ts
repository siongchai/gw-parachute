import { LANES, WATER_Y, type Lane } from "../game/GameConfig";
import type { SpriteManager } from "../game/SpriteManager";

/** Scale factor over the 22 px LCD column width from the mockup overlays. */
const SCALE = 1.5;
const LCD_W = Math.round(22 * SCALE);

/** How far each row sinks below the waterline (bottom anchor). */
const TOP_ROW_SINK = 12;
const BOTTOM_ROW_SINK = 26;

const LANE_X = LANES.centers.map((cx) => Math.round(cx - LCD_W / 2)) as [
  number,
  number,
  number,
];

/** Native aspect (h/w) from root overlay crops — see splash_meta.json. */
const ASPECT = [167 / 413, 179 / 607, 209 / 556, 151 / 597, 167 / 531, 297 / 778];

function frameHeight(index: number): number {
  return Math.max(1, Math.round(LCD_W * ASPECT[index]));
}

/**
 * Two-lane miss path (LCD mockup), played right→left on top then left→right on bottom:
 *   Top:    splash 1 right · splash 2 center · splash 3 left
 *   Bottom: splash 4 left · splash 5 center · splash 6 right
 */
const FRAMES = [
  { sprite: 0, lane: 2 as Lane, row: 0 },
  { sprite: 1, lane: 1 as Lane, row: 0 },
  { sprite: 2, lane: 0 as Lane, row: 0 },
  { sprite: 3, lane: 0 as Lane, row: 1 },
  { sprite: 4, lane: 1 as Lane, row: 1 },
  { sprite: 5, lane: 2 as Lane, row: 1 },
].map(({ sprite, lane, row }) => {
  const w = LCD_W;
  const h = frameHeight(sprite);
  const sink = row === 0 ? TOP_ROW_SINK : BOTTOM_ROW_SINK;
  return {
    sprite,
    w,
    h,
    x: LANE_X[lane],
    y: WATER_Y + sink - h,
  };
});

export const MISS_SPLASH_FRAME_MS = 180;
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
