/**
 * Logical canvas resolution.
 * Wide-screen LCD playfield (PR-21 aspect ratio 54∶33); size scales with viewport.
 */
export const GAME_WIDTH = 164;
export const GAME_HEIGHT = 108;

/** Palette taken from the supplied sprite asset sheet. */
export const COLORS = {
  black: "#000000",
  palmGreen: "#00b050",
  trunkOrange: "#e67e22",
  waterBlue: "#3da8ff",
  lcd: "#b2bea8",
} as const;

/** Waterline: wave rows start here and fill to the bottom of the screen. */
export const WATER_Y = 79;

/**
 * Three fixed LCD columns — left, centre, right — matching the reference mockup.
 * Boat and parachutists snap to these positions only.
 */
export type Lane = 0 | 1 | 2;

export const LANES = {
  /** Horizontal centre of each drop / catch column. */
  centers: [48, 82, 116] as const,
  /** Boat starts in the centre column. */
  start: 1 as Lane,
} as const;

export const BOAT = {
  width: 40,
  height: 25,
  /** Top of the boat sprite; hull rides just under the waterline. */
  y: 63,
  /** Rowing animation after each column step. */
  rowAnimMs: 240,
  rowFrameMs: 90,
  /** Catch window sits over the rescuer's arms. */
  catchInsetX: 4,
  catchTop: 6,
  catchHeight: 20,
} as const;

export const PARACHUTIST = {
  width: 18,
  height: 23,
  animFrameMs: 150,
} as const;

export function laneCenterX(lane: Lane): number {
  return LANES.centers[lane];
}

export function boatXForLane(lane: Lane): number {
  return LANES.centers[lane] - BOAT.width / 2;
}

export function parachutistXForLane(lane: Lane): number {
  return LANES.centers[lane] - PARACHUTIST.width / 2;
}

export const HELICOPTER = {
  width: 40,
  height: 26,
  /** Fixed top-right corner (LCD mockup). */
  x: GAME_WIDTH - 44,
  y: 4,
  rotorFrameMs: 90,
} as const;

export const PALM = {
  leftX: -2,
  rightX: GAME_WIDTH - 39,
  /** Fronds top; sprites are 58px tall and root below the waterline. */
  y: WATER_Y - 48,
} as const;

export const HUD = {
  scoreX: 6,
  scoreY: 5,
  digitAdvance: 12,
  /** Bottom-right corner (LCD mockup); label sits above the miss icons. */
  missLabelY: GAME_HEIGHT - 24,
  missIconY: GAME_HEIGHT - 14,
  missIconAdvance: 11,
  /** Bottom-left corner — GAME A / GAME B mode indicator. */
  modeLabelX: 4,
  modeLabelY: GAME_HEIGHT - 7,
} as const;

export const MAX_MISSES = 3;

export type GameMode = "A" | "B";

export type AppScreen =
  | "MENU"
  | "HOW_TO_PLAY"
  | "PLAYING"
  | "PAUSED"
  | "GAME_OVER"
  | "HIGH_SCORES";

export type ParachutistState =
  | "SPAWNING"
  | "FALLING"
  | "CAUGHT"
  | "SPLASHING"
  | "STUCK_ON_PALM";

export type DifficultyTier = "Easy" | "Normal" | "Fast" | "Hard" | "Extreme";

export type DifficultySettings = {
  tier: DifficultyTier;
  fallSpeed: number;
  spawnIntervalMs: number;
  maxSimultaneous: number;
  helicopterSpeed: number;
  driftAmplitude: number;
  palmDropMinMs: number;
  palmDropMaxMs: number;
  palmSnagChance: number;
};
