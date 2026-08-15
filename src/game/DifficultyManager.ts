import type { DifficultySettings, GameMode } from "./GameConfig";

type Tier = DifficultySettings["tier"];

type TierValues = Omit<DifficultySettings, "tier">;

const TIERS: Record<Tier, TierValues> = {
  Easy: {
    fallSpeed: 20,
    spawnIntervalMs: 2300,
    maxSimultaneous: 1,
    helicopterSpeed: 22,
    driftAmplitude: 5,
    palmDropMinMs: 500,
    palmDropMaxMs: 1800,
    palmSnagChance: 0.3,
  },
  Normal: {
    fallSpeed: 26,
    spawnIntervalMs: 1800,
    maxSimultaneous: 2,
    helicopterSpeed: 28,
    driftAmplitude: 8,
    palmDropMinMs: 450,
    palmDropMaxMs: 1600,
    palmSnagChance: 0.34,
  },
  Fast: {
    fallSpeed: 33,
    spawnIntervalMs: 1450,
    maxSimultaneous: 3,
    helicopterSpeed: 34,
    driftAmplitude: 11,
    palmDropMinMs: 400,
    palmDropMaxMs: 1400,
    palmSnagChance: 0.38,
  },
  Hard: {
    fallSpeed: 41,
    spawnIntervalMs: 1150,
    maxSimultaneous: 4,
    helicopterSpeed: 41,
    driftAmplitude: 14,
    palmDropMinMs: 350,
    palmDropMaxMs: 1200,
    palmSnagChance: 0.42,
  },
  Extreme: {
    fallSpeed: 50,
    spawnIntervalMs: 900,
    maxSimultaneous: 5,
    helicopterSpeed: 50,
    driftAmplitude: 18,
    palmDropMinMs: 300,
    palmDropMaxMs: 1000,
    palmSnagChance: 0.46,
  },
};

function tierForScore(score: number): Tier {
  if (score >= 100) return "Extreme";
  if (score >= 50) return "Hard";
  if (score >= 25) return "Fast";
  if (score >= 10) return "Normal";
  return "Easy";
}

export class DifficultyManager {
  getSettings(score: number, mode: GameMode): DifficultySettings {
    const tier = tierForScore(score);
    const base = TIERS[tier];
    if (mode === "A") return { tier, ...base };

    // Game B: faster falls, tighter spawns, more jumpers, busier palms.
    return {
      tier,
      fallSpeed: base.fallSpeed * 1.22,
      spawnIntervalMs: base.spawnIntervalMs * 0.78,
      maxSimultaneous: base.maxSimultaneous + 1,
      helicopterSpeed: base.helicopterSpeed * 1.2,
      driftAmplitude: base.driftAmplitude * 1.5,
      palmDropMinMs: base.palmDropMinMs,
      palmDropMaxMs: base.palmDropMaxMs,
      palmSnagChance: Math.min(0.75, base.palmSnagChance + 0.25),
    };
  }
}
