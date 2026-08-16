"use client";

import type { ReactNode, PointerEvent } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type Props = {
  screen: ReactNode;
  overlay: ReactNode;
  onStepLeft: () => void;
  onStepRight: () => void;
  onGameA: () => void;
  onGameB: () => void;
  onTime: () => void;
};

/** Virtual Game & Watch style casing, laid out from the reference mockup. */
export function Handheld({
  screen,
  overlay,
  onStepLeft,
  onStepRight,
  onGameA,
  onGameB,
  onTime,
}: Props) {
  const step =
    (fn: () => void) => (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      fn();
    };

  return (
    <div className="handheld" role="application" aria-label="Parachute Rescue handheld">
      <div className="case">
        <div className="faceplate">
          <h1 className="portrait-title">
            PARACHUTE
            <span>RESCUE</span>
          </h1>

          <div className="badge-column">
            <div className="badge">
              <PixelIcon name="parachute" className="badge-chute" />
              <span className="badge-line">PARACHUTE</span>
              <span className="badge-line big">RESCUE</span>
            </div>
            <p className="badge-caption">WIDE SCREEN</p>
          </div>

          <div className="bezel">
            <div className="bezel-title">
              <span className="rule" />
              <span>PARACHUTE RESCUE</span>
              <span className="rule" />
            </div>

            <div className="screen-frame">
              <div className="screen">
                {screen}
                {overlay}
              </div>
            </div>

            <div className="bezel-title bottom">
              <span className="rule" />
              <span>WIDE SCREEN</span>
              <span className="rule" />
            </div>
          </div>

          <div className="mode-column">
            <div className="mode-item">
              <span className="mode-label">GAME A</span>
              <button type="button" className="pill" onClick={onGameA} aria-label="Start Game A" />
              <span className="led-note">
                <i className="led amber" /> ALARM
              </span>
            </div>
            <div className="mode-item">
              <span className="mode-label">GAME B</span>
              <button type="button" className="pill" onClick={onGameB} aria-label="Start Game B" />
              <span className="led-note">
                <i className="led" /> ACL
              </span>
            </div>
            <div className="mode-item mode-item-solo">
              <span className="mode-label">MENU</span>
              <button type="button" className="pill" onClick={onTime} aria-label="Menu" />
            </div>
          </div>

          <div className="pad pad-left">
            <button
              type="button"
              className="round-btn"
              aria-label="Move boat left"
              onPointerDown={step(onStepLeft)}
              onContextMenu={(e) => e.preventDefault()}
            />
            <span className="pad-label">◀ LEFT</span>
          </div>

          <div className="pad pad-right">
            <button
              type="button"
              className="round-btn"
              aria-label="Move boat right"
              onPointerDown={step(onStepRight)}
              onContextMenu={(e) => e.preventDefault()}
            />
            <span className="pad-label">RIGHT ▶</span>
          </div>
        </div>
      </div>
    </div>
  );
}
