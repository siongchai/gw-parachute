import type { GameMode } from "@/game/GameConfig";
import type { LocalScore } from "@/lib/storage";

export type HighScore = LocalScore;

export type ScorePayload = {
  player_name: string;
  score: number;
  game_mode: GameMode;
};

export function cleanPlayerName(raw: string): string {
  return raw.trim().slice(0, 12).toUpperCase() || "YOU";
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(999, Math.round(score)));
}

export async function fetchHighScores(mode: GameMode): Promise<HighScore[]> {
  const res = await fetch(`/api/scores?mode=${mode}`, { cache: "no-store" });
  if (res.status === 503) {
    throw new Error("not-configured");
  }
  if (!res.ok) {
    throw new Error("load-failed");
  }
  const data = (await res.json()) as { scores?: HighScore[] };
  return Array.isArray(data.scores) ? data.scores : [];
}

export async function submitHighScore(payload: ScorePayload): Promise<void> {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 503) {
    throw new Error("not-configured");
  }
  if (!res.ok) {
    throw new Error("save-failed");
  }
}
