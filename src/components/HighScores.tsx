"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import type { GameMode } from "@/game/GameConfig";
import { getLocalScores, type LocalScore } from "@/lib/storage";

type Props = {
  playerName: string;
  onBack: () => void;
};

export function HighScores({ playerName, onBack }: Props) {
  const [mode, setMode] = useState<GameMode>("A");
  const [scores, setScores] = useState<LocalScore[]>([]);

  useEffect(() => {
    const local = getLocalScores(mode);
    setScores(local.length ? local : seeded(mode));
  }, [mode]);

  return (
    <div className="panel">
      <div className="scores-head">
        <PixelIcon name="trophy" className="btn-icon" />
        <h2>HIGH SCORES</h2>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={mode === "A" ? "tab active" : "tab"}
          onClick={() => setMode("A")}
        >
          GAME A
        </button>
        <button
          type="button"
          className={mode === "B" ? "tab active" : "tab"}
          onClick={() => setMode("B")}
        >
          GAME B
        </button>
      </div>

      <ol className="score-table">
        {scores.slice(0, 8).map((s, i) => (
          <li key={`${s.player_name}-${i}`} className={s.player_name === playerName ? "you" : ""}>
            <span className="rank">{String(i + 1).padStart(2, "0")}</span>
            <span className="who">{s.player_name}</span>
            <span className="pts">{s.score}</span>
          </li>
        ))}
      </ol>

      <button type="button" className="btn btn-brown wide" onClick={onBack}>
        CLOSE
      </button>
    </div>
  );
}

function seeded(mode: GameMode): LocalScore[] {
  const base = [
    ["ACE", 428],
    ["JIMMY", 391],
    ["MARCO", 365],
    ["KEN", 342],
    ["TOM", 301],
    ["NICK", 288],
    ["SAM", 271],
    ["LEO", 244],
  ] as const;
  return base.map(([name, score]) => ({
    player_name: name,
    score: mode === "B" ? Math.round(score * 0.82) : score,
    game_mode: mode,
    created_at: new Date(0).toISOString(),
  }));
}
