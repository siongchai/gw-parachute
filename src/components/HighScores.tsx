"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import type { GameMode } from "@/game/GameConfig";
import { fetchHighScores, type HighScore } from "@/lib/scores";
import { getLocalScores } from "@/lib/storage";

type Props = {
  playerName: string;
  onBack: () => void;
};

type Status = "loading" | "ready" | "local";

export function HighScores({ playerName, onBack }: Props) {
  const [mode, setMode] = useState<GameMode>("A");
  const [scores, setScores] = useState<HighScore[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchHighScores(mode)
      .then((list) => {
        if (cancelled) return;
        setScores(list.slice(0, 8));
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        const local = getLocalScores(mode);
        setScores((local.length ? local : seeded(mode)).slice(0, 8));
        setStatus("local");
      });

    return () => {
      cancelled = true;
    };
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

      {status === "loading" ? (
        <p className="scores-note">LOADING…</p>
      ) : scores.length === 0 ? (
        <p className="scores-note">NO SCORES YET</p>
      ) : (
        <ol className="score-table">
          {scores.map((s, i) => (
            <li
              key={`${s.player_name}-${s.created_at}-${i}`}
              className={s.player_name === playerName ? "you" : ""}
            >
              <span className="rank">{String(i + 1).padStart(2, "0")}</span>
              <span className="who">{s.player_name}</span>
              <span className="pts">{s.score}</span>
            </li>
          ))}
        </ol>
      )}

      {status === "local" && (
        <p className="scores-note dim">SAVED ON THIS DEVICE</p>
      )}

      <button type="button" className="btn btn-brown wide" onClick={onBack}>
        CLOSE
      </button>
    </div>
  );
}

function seeded(mode: GameMode): HighScore[] {
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
