"use client";

import { useEffect, useId, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      window.requestAnimationFrame(() => cancelButtonRef.current?.focus());
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCancel();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="z-50 w-full max-w-sm rounded-lg border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-transparent"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-500/10 p-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 id={titleId} className="font-heading text-lg text-foreground">
              {title}
            </h3>
            <p id={descriptionId} className="mt-1 text-sm text-muted">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
