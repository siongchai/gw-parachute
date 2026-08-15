"use client";

import { PixelIcon } from "@/components/PixelIcon";

type Props = {
  soundOn: boolean;
  onPlayA: () => void;
  onPlayB: () => void;
  onHighScores: () => void;
  onHowTo: () => void;
  onToggleSound: () => void;
};

export function MainMenu({
  soundOn,
  onPlayA,
  onPlayB,
  onHighScores,
  onHowTo,
  onToggleSound,
}: Props) {
  return (
    <div className="panel">
      <h1 className="panel-title">
        PARACHUTE
        <span>RESCUE</span>
      </h1>

      <div className="rule-with-icon">
        <span className="rule" />
        <PixelIcon name="parachute" className="rule-icon" />
        <span className="rule" />
      </div>

      <div className="panel-buttons">
        <button type="button" className="btn btn-red stacked" onClick={onPlayA}>
          <strong>GAME A</strong>
          <em>Standard</em>
        </button>
        <button type="button" className="btn btn-brown stacked" onClick={onPlayB}>
          <strong>GAME B</strong>
          <em>Palm Tree Challenge</em>
        </button>
        <button type="button" className="btn btn-tan" onClick={onHighScores}>
          <PixelIcon name="trophy" className="btn-icon" />
          HIGH SCORES
        </button>
        <button type="button" className="btn btn-tan" onClick={onHowTo}>
          <PixelIcon name="parachute" className="btn-icon" />
          HOW TO PLAY
        </button>
        <button type="button" className="btn btn-tan" onClick={onToggleSound}>
          <PixelIcon name={soundOn ? "sound-on" : "sound-off"} className="btn-icon" />
          SOUND&nbsp;&nbsp;{soundOn ? "ON" : "OFF"}
        </button>
      </div>

      <p className="panel-footer">© 2024 Retro Games</p>
    </div>
  );
}
