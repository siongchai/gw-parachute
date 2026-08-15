"use client";

import type { PointerEvent } from "react";

type Props = {
  onLeft: (pressed: boolean) => void;
  onRight: (pressed: boolean) => void;
  disabled?: boolean;
};

function bindPointer(
  pressed: boolean,
  onChange: (pressed: boolean) => void,
) {
  return (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onChange(pressed);
  };
}

export function ControlPad({ onLeft, onRight, disabled }: Props) {
  return (
    <div className="control-pad" style={{ touchAction: "none" }}>
      <div className="control-group">
        <button
          type="button"
          className="action-btn"
          aria-label="Move left"
          disabled={disabled}
          onPointerDown={bindPointer(true, onLeft)}
          onPointerUp={bindPointer(false, onLeft)}
          onPointerCancel={bindPointer(false, onLeft)}
          onLostPointerCapture={() => onLeft(false)}
          onContextMenu={(e) => e.preventDefault()}
        />
        <span className="action-label">◀ LEFT</span>
      </div>
      <div className="control-group">
        <button
          type="button"
          className="action-btn"
          aria-label="Move right"
          disabled={disabled}
          onPointerDown={bindPointer(true, onRight)}
          onPointerUp={bindPointer(false, onRight)}
          onPointerCancel={bindPointer(false, onRight)}
          onLostPointerCapture={() => onRight(false)}
          onContextMenu={(e) => e.preventDefault()}
        />
        <span className="action-label">RIGHT ▶</span>
      </div>
    </div>
  );
}
