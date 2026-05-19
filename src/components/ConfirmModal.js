// ConfirmModal.js — Reusable confirmation popup before destructive actions
// Uses lucide-react icons

import { AlertTriangle, CheckCircle } from "lucide-react";
import "../styles/confirmmodal.css";

/**
 * Props:
 *  - isOpen: boolean
 *  - title: string
 *  - message: string
 *  - confirmLabel: string (default "Confirm")
 *  - cancelLabel: string (default "Cancel")
 *  - onConfirm: () => void
 *  - onCancel: () => void
 *  - danger: boolean — makes confirm button red
 */
function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!isOpen) return null;

  return (
    /* Backdrop — clicking outside dismisses */
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          {danger
            ? <AlertTriangle size={32} color="#EF4444" />
            : <CheckCircle size={32} color="#818CF8" />}
        </div>

        <h3 className="modal-title">{title}</h3>
        {message && <p className="modal-message">{message}</p>}

        <div className="modal-actions">
          <button
            className="button button-secondary"
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`button ${danger ? "button-danger" : ""}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
