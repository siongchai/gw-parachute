"use client";

type Props = {
  open: boolean;
  name: string;
  onChange: (name: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SaveScoreModal({ open, name, onChange, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
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
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm();
            }}
          />
        </label>
        <div className="panel-buttons">
          <button type="button" className="btn btn-red" onClick={onConfirm}>
            SAVE
          </button>
          <button type="button" className="btn btn-tan" onClick={onCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
