import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./FormModal.css";

/**
 * Presentational modal shell: portal, backdrop, Escape, close button, initial
 * focus. Knows nothing about forms or webhooks — callers own the body.
 *
 * Portalled to <body>: .card applies a transform on hover, which would make it
 * the containing block for position:fixed, and its overflow:hidden would clip
 * the dialog.
 */
export default function FormModal({ labelledBy, initialFocusRef, onClose, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const target = initialFocusRef?.current ?? panelRef.current;
    target?.focus();
  }, [initialFocusRef]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fmodal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="fmodal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <button
          type="button"
          className="fmodal__close"
          onClick={onClose}
          aria-label="Kapat"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
