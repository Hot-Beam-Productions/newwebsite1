"use client";

import { useEffect } from "react";

interface KeyboardShortcutOptions {
  meta?: boolean;
  disabled?: boolean;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: KeyboardShortcutOptions = {}
) {
  const { meta = false, disabled = false } = options;

  useEffect(() => {
    if (disabled) return;

    const lowerKey = key.toLowerCase();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== lowerKey) return;

      if (meta && !event.metaKey && !event.ctrlKey) return;

      if (isEditableElement(event.target)) {
        // Allow save shortcuts even while typing.
        if (!(meta && (event.metaKey || event.ctrlKey))) return;
      }

      callback(event);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [callback, disabled, key, meta]);
}
