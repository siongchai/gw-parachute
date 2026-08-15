import type { GameMode } from "@/game/GameConfig";

const KEYS = {
  bestA: "parachute-best-A",
  bestB: "parachute-best-B",
  playerName: "parachute-player-name",
  sound: "parachute-sound-enabled",
  localScoresA: "parachute-local-scores-A",
  localScoresB: "parachute-local-scores-B",
} as const;

export type LocalScore = {
  player_name: string;
  score: number;
  game_mode: GameMode;
  created_at: string;
};

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
}

export function getBestScore(mode: GameMode): number {
  const raw = safeGet(mode === "A" ? KEYS.bestA : KEYS.bestB);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function setBestScore(mode: GameMode, score: number): void {
  const key = mode === "A" ? KEYS.bestA : KEYS.bestB;
  const prev = getBestScore(mode);
  if (score > prev) safeSet(key, String(score));
}

export function getPlayerName(): string {
  return safeGet(KEYS.playerName) ?? "YOU";
}

export function setPlayerName(name: string): void {
  const cleaned = name.trim().slice(0, 12).toUpperCase() || "YOU";
  safeSet(KEYS.playerName, cleaned);
}

export function getSoundEnabled(): boolean {
  const v = safeGet(KEYS.sound);
  if (v === null) return true;
  return v !== "0";
}

export function setSoundEnabled(on: boolean): void {
  safeSet(KEYS.sound, on ? "1" : "0");
}

export function getLocalScores(mode: GameMode): LocalScore[] {
  const key = mode === "A" ? KEYS.localScoresA : KEYS.localScoresB;
  const raw = safeGet(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalScore[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalScore(entry: LocalScore): LocalScore[] {
  const key = entry.game_mode === "A" ? KEYS.localScoresA : KEYS.localScoresB;
  const list = getLocalScores(entry.game_mode);
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, 10);
  safeSet(key, JSON.stringify(top));
  setBestScore(entry.game_mode, entry.score);
  return top;
}
