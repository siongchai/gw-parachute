import type { SpriteId } from "./SpriteManager";
import { HELICOPTER, laneCenterX, type Lane } from "./GameConfig";

/** One LCD segment along a parachute path (centre-x, y, sprite). */
export type DropStep = {
  cx: number;
  y: number;
  sprite: SpriteId;
};

/**
 * Drop paths from `parachute path asset.png` — one dedicated sprite per step
 * (left 7 · centre 6 · right 5), positioned along the LCD mockup arcs from
 * the helicopter door down to each boat lane.
 */
export const DROP_PATHS: Record<Lane, readonly DropStep[]> = {
  /** Left — 7 steps, longest arc from the helicopter across to lane 48. */
  0: [
    { cx: 116, y: 18, sprite: "pathL_0" },
    { cx: 99, y: 25, sprite: "pathL_1" },
    { cx: 78, y: 33, sprite: "pathL_2" },
    { cx: 60, y: 41, sprite: "pathL_3" },
    { cx: 48, y: 49, sprite: "pathL_4" },
    { cx: 46, y: 57, sprite: "pathL_5" },
    { cx: laneCenterX(0), y: 65, sprite: "pathL_6" },
  ],
  /** Centre — 6 steps to lane 82. */
  1: [
    { cx: 116, y: 18, sprite: "pathC_0" },
    { cx: 102, y: 27, sprite: "pathC_1" },
    { cx: 90, y: 37, sprite: "pathC_2" },
    { cx: 82, y: 46, sprite: "pathC_3" },
    { cx: 80, y: 56, sprite: "pathC_4" },
    { cx: laneCenterX(1), y: 65, sprite: "pathC_5" },
  ],
  /** Right — 5 steps, near-vertical drop under the helicopter to lane 116. */
  2: [
    { cx: 116, y: 18, sprite: "pathR_0" },
    { cx: 116, y: 29, sprite: "pathR_1" },
    { cx: 110, y: 41, sprite: "pathR_2" },
    { cx: 109, y: 53, sprite: "pathR_3" },
    { cx: laneCenterX(2), y: 65, sprite: "pathR_4" },
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

/** Milliseconds per LCD segment. */
export function pathStepMs(fallSpeed: number): number {
  return Math.max(340, 9000 / fallSpeed);
}

/** Total time to traverse a lane's full drop path. */
export function pathTotalMs(lane: Lane, fallSpeed: number): number {
  const steps = DROP_PATHS[lane].length;
  return Math.max(1, steps - 1) * pathStepMs(fallSpeed);
}

export type PathSample = {
  cx: number;
  y: number;
  sprite: SpriteId;
  stepIndex: number;
};

/**
 * Sample position + sprite along a path.
 * Discrete LCD steps — hold each segment position, then advance.
 * @param progress 0 at first step, 1 at catch step
 */
export function sampleDropPath(lane: Lane, progress: number): PathSample {
  const path = DROP_PATHS[lane];
  const last = path.length - 1;
  if (last <= 0) {
    return { ...path[0], stepIndex: 0 };
  }

  const p = Math.max(0, Math.min(1, progress));
  const stepIndex = Math.min(last, Math.floor(p * last + 1e-6));
  const step = path[stepIndex]!;

  return {
    cx: step.cx,
    y: step.y,
    sprite: step.sprite,
    stepIndex,
  };
}
