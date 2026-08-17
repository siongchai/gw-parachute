"use client";

type Props = {
  open: boolean;
  name: string;
  busy?: boolean;
  error?: string | null;
  onChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SaveScoreModal({
  open,
  name,
  busy = false,
  error = null,
  onChange,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div
        className="panel modal"
        role="dialog"
        aria-label="Save score"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rule-heading">
          <span className="rule" />
          <h2>SAVE SCORE</h2>
          <span className="rule" />
        </div>
        <label className="name-field">
          NAME
          <input
            value={name}
            maxLength={12}
            autoFocus
            disabled={busy}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !busy) onConfirm();
            }}
          />
        </label>
        {error && <p className="scores-note">{error}</p>}
        <div className="panel-buttons">
          <button type="button" className="btn btn-red" onClick={onConfirm} disabled={busy}>
            {busy ? "SAVING…" : "SAVE"}
          </button>
          <button type="button" className="btn btn-tan" onClick={onCancel} disabled={busy}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
