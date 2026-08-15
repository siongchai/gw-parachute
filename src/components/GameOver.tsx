"use client";

import { LcdDigits } from "@/components/LcdDigits";

type Props = {
  score: number;
  best: number;
  newHighScore: boolean;
  onAgain: () => void;
  onSave: () => void;
  onMenu: () => void;
};

export function GameOver({
  score,
  best,
  newHighScore,
  onAgain,
  onSave,
  onMenu,
}: Props) {
  return (
    <div className="panel">
      <div className="rule-heading">
        <span className="rule" />
        <h2>GAME OVER</h2>
        <span className="rule" />
      </div>

      {newHighScore && <p className="new-best">NEW HIGH SCORE</p>}

      <div className="result-block">
        <span className="result-label">SCORE</span>
        <LcdDigits value={score} tone="dark" size={30} />
        <span className="result-label">BEST</span>
        <LcdDigits value={best} tone="red" size={30} />
      </div>

      <div className="miss-row">
        <span>MISS</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="miss-sprite"
            style={{
              maskImage: `url(/sprites/ui/miss_icon_${i}.png)`,
              WebkitMaskImage: `url(/sprites/ui/miss_icon_${i}.png)`,
            }}
          />
        ))}
      </div>

      <div className="panel-buttons">
        <button type="button" className="btn btn-red" onClick={onAgain}>
          PLAY AGAIN
        </button>
        <button type="button" className="btn btn-brown" onClick={onSave}>
          SAVE SCORE
        </button>
        <button type="button" className="btn btn-tan" onClick={onMenu}>
          MAIN MENU
        </button>
      </div>
    </div>
  );
}
