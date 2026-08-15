import type { SpriteId } from "./SpriteManager";
import { HELICOPTER, laneCenterX, type Lane } from "./GameConfig";

/** One LCD segment along a parachute path (centre-x, y, sprite from spirite.png). */
export type DropStep = {
  cx: number;
  y: number;
  sprite: SpriteId;
};

/**
 * Fixed drop paths from LCD mockup.jpg (all segments lit at once).
 *
 * Sprite roles on spirite.png:
 *   spin_0 — jump out of helicopter door (no open canopy)
 *   spin_1 — free-fall tuck, canopy still closed          (long left path only)
 *   spin_2 — canopy begins to open (small semi-circle)
 *   fall_0…fall_5 — fully open canopy, swaying poses
 *
 * Step counts (jump → boat):
 *   Left   7  (jump · free-fall · deploy · 4 open · catch)
 *   Centre 6  (jump · deploy · 4 open · catch)
 *   Right  5  (jump · deploy · 3 open · catch)
 */
export const DROP_PATHS: Record<Lane, readonly DropStep[]> = {
  0: [
    { cx: 116, y: 22, sprite: "spin_0" },
    { cx: 112, y: 28, sprite: "spin_1" },
    { cx: 106, y: 32, sprite: "spin_2" },
    { cx: 92, y: 38, sprite: "fall_0" },
    { cx: 76, y: 46, sprite: "fall_1" },
    { cx: 62, y: 54, sprite: "fall_3" },
    { cx: laneCenterX(0), y: 78, sprite: "fall_5" },
  ],
  1: [
    { cx: 116, y: 22, sprite: "spin_0" },
    { cx: 112, y: 30, sprite: "spin_2" },
    { cx: 102, y: 36, sprite: "fall_0" },
    { cx: 94, y: 44, sprite: "fall_2" },
    { cx: 86, y: 54, sprite: "fall_4" },
    { cx: laneCenterX(1), y: 78, sprite: "fall_5" },
  ],
  2: [
    { cx: 116, y: 22, sprite: "spin_0" },
    { cx: 116, y: 32, sprite: "spin_2" },
    { cx: laneCenterX(2), y: 42, sprite: "fall_1" },
    { cx: laneCenterX(2), y: 56, sprite: "fall_3" },
    { cx: laneCenterX(2), y: 78, sprite: "fall_5" },
  ],
};

/** Helicopter door — every path begins here. */
export const DROP_ORIGIN = {
  cx: 116,
  y: HELICOPTER.y + HELICOPTER.height - 2,
} as const;

export const PATH_STEP_COUNT: Record<Lane, number> = {
  0: DROP_PATHS[0].length,
  1: DROP_PATHS[1].length,
  2: DROP_PATHS[2].length,
};

/** Milliseconds per LCD segment; higher fallSpeed = faster stepping. */
export function pathStepMs(fallSpeed: number): number {
  return Math.max(110, 5200 / fallSpeed);
}
