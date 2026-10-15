"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SubmissionStatus = "live" | "pending" | "review" | "rejected";

export interface UpdateStatusSubmission {
  id: string;
  product: string;
  directory: string;
  status: SubmissionStatus;
  listingUrl?: string | null;
}

const STATUS_OPTIONS: { value: SubmissionStatus; label: string; hint: string }[] = [
  { value: "live", label: "Live", hint: "Public and driving traffic" },
  { value: "pending", label: "Pending", hint: "Submitted, awaiting review" },
  { value: "review", label: "In review", hint: "Directory is reviewing" },
  { value: "rejected", label: "Rejected", hint: "Needs rework or appeal" },
];

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  live: "Live",
  pending: "Pending",
  review: "In review",
  rejected: "Rejected",
};

function isValidHttpsUrl(value: string) {
  if (!value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

interface Props {
  open: boolean;
  submission: UpdateStatusSubmission | null;
  onClose: () => void;
  onSubmit?: (next: { status: SubmissionStatus; listingUrl: string }) => void | Promise<void>;
}

export function UpdateStatusModal({ open, submission, onClose, onSubmit }: Props) {
  const titleId = useId();
  const descId = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const [status, setStatus] = useState<SubmissionStatus>("pending");
  const [listingUrl, setListingUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && submission) {
      setStatus(submission.status);
      setListingUrl(submission.listingUrl ?? "");
      setError(null);
      setTouched(false);
      setSaving(false);
      lastFocused.current = document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => selectRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open, submission]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !submission) return null;

  const trimmedUrl = listingUrl.trim();
  const requiresUrl = status === "live";
  const urlValid = !trimmedUrl || isValidHttpsUrl(trimmedUrl);
  const changed =
    status !== submission.status || trimmedUrl !== (submission.listingUrl ?? "").trim();
  const canSubmit =
    changed && !saving &&
    (!requiresUrl || isValidHttpsUrl(trimmedUrl)) &&
    (trimmedUrl === "" || urlValid);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (requiresUrl && !isValidHttpsUrl(trimmedUrl)) {
      setError("Add the https:// listing URL — required when status is Live.");
      return;
    }
    if (trimmedUrl && !isValidHttpsUrl(trimmedUrl)) {
      setError("That URL doesn't look valid. Use a full https:// link.");
      return;
    }
    if (!changed) return;
    setError(null);
    setSaving(true);
    try {
      await onSubmit?.({ status, listingUrl: trimmedUrl });
      // TODO: PATCH /api/submissions/:id with { status, listingUrl }
      onClose();
    } catch {
      setError("Couldn't update status. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="usm-overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        className="usm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="usm-header">
          <div className="usm-header-copy">
            <p className="usm-eyebrow">
              <span className="usm-mark" aria-hidden="true"><i /><i /><i /></span>
              {submission.id} · Update
            </p>
            <h2 className="usm-title" id={titleId}>Update status</h2>
            <p className="usm-sub" id={descId}>
              {submission.product} on {submission.directory}
              <span className={`status-badge s-${submission.status} usm-current`}>
                {STATUS_LABEL[submission.status]}
              </span>
            </p>
          </div>
          <button className="usm-close" type="button" onClick={onClose} aria-label="Close dialog">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="usm-body">
            <div className="usm-grid">
              <div className="usm-field">
                <label className="usm-label" htmlFor={`${titleId}-status`}>New status</label>
                <div className="usm-select-wrap">
                  <span className={`usm-dot d-${status}`} aria-hidden="true" />
                  <select
                    id={`${titleId}-status`}
                    ref={selectRef}
                    className="usm-select"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as SubmissionStatus);
                      if (touched) setError(null);
                    }}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <svg className="usm-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3,5.5 7,9.5 11,5.5" />
                  </svg>
                </div>
                <p className="usm-hint">{STATUS_OPTIONS.find((o) => o.value === status)?.hint}</p>
              </div>

              <div className="usm-field">
                <label className="usm-label" htmlFor={`${titleId}-url`}>
                  Listing URL {requiresUrl && <span className="usm-required">*</span>}
                </label>
                <div className="usm-input-wrap">
                  <svg className="usm-link-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1" />
                    <path d="M8 6a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1" />
                  </svg>
                  <input
                    id={`${titleId}-url`}
                    className={`usm-input${touched && !urlValid ? " usm-input-error" : ""}`}
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://..."
                    value={listingUrl}
                    onChange={(e) => {
                      setListingUrl(e.target.value);
                      if (touched && error) setError(null);
                    }}
                    onBlur={() => setTouched(true)}
                    aria-invalid={touched && !urlValid}
                  />
                </div>
                <p className="usm-hint">
                  {requiresUrl ? "Required for Live — link to the public listing." : "Optional — link to the live listing when available."}
                </p>
              </div>
            </div>
            {touched && error && (
              <p className="usm-error" role="alert">{error}</p>
            )}
            {changed && !error && (
              <p className="usm-preview" aria-live="polite">
                {STATUS_LABEL[submission.status]} → <strong>{STATUS_LABEL[status]}</strong>
                {trimmedUrl && isValidHttpsUrl(trimmedUrl) ? " · URL added" : ""}
              </p>
            )}
          </div>

          <div className="usm-footer">
            <button className="btn-ghost usm-cancel" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn-primary usm-submit" type="submit" disabled={!canSubmit}>
              {saving ? "Updating…" : "Update status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
