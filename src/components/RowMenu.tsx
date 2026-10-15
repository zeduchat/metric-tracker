"use client";

import { useEffect, useRef, useState } from "react";
import { UpdateStatusModal, type UpdateStatusSubmission } from "./UpdateStatusModal";

export function RowMenu({ label, submission }: { label: string; submission?: UpdateStatusSubmission }) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="row-menu-wrap" ref={ref}>
      <button
        className="row-menu"
        type="button"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
          <circle cx="3" cy="7" r="1.2" />
          <circle cx="7" cy="7" r="1.2" />
          <circle cx="11" cy="7" r="1.2" />
        </svg>
      </button>

      {open && (
        <div className="row-dropdown" role="menu">
          <button className="row-dropdown-item" role="menuitem" type="button" onClick={() => { setOpen(false); if (submission) setModalOpen(true); }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" />
              <polyline points="4,6.5 6,8.5 9,5" />
            </svg>
            Update status
          </button>
          <button className="row-dropdown-item" role="menuitem" type="button" onClick={() => setOpen(false)}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="1,9 4,5 7,7 10,3 12,4" />
            </svg>
            Add traffic
          </button>
          <div className="row-dropdown-divider" role="separator" />
          <button className="row-dropdown-item row-dropdown-item--danger" role="menuitem" type="button" onClick={() => setOpen(false)}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="1,3 12,3" />
              <path d="M5 3V2h3v1" />
              <rect x="2.5" y="3" width="8" height="8" rx="1" />
              <line x1="5" y1="6" x2="5" y2="9" />
              <line x1="8" y1="6" x2="8" y2="9" />
            </svg>
            Delete
          </button>
        </div>
      )}
      {submission && (
        <UpdateStatusModal
          open={modalOpen}
          submission={submission}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
