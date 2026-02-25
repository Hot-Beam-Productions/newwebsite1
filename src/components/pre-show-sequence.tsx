"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "hbp-preshow-seen";

// Each line: [text, colorClass]
// colorClass="" means muted/default
const SEQUENCE_LINES: [string, string][] = [
  ["HOT BEAM PRODUCTIONS", "text-laser-cyan"],
  ["SYSTEMS INITIALIZE...", ""],
  ["──────────────────────────", "text-border-bright"],
  ["AUDIO            ✓ ONLINE", "text-laser-amber"],
  ["LIGHTING         ✓ ONLINE", "text-laser-amber"],
  ["LASERS           ✓ ONLINE", "text-laser-amber"],
  ["VIDEO            ✓ ONLINE", "text-laser-amber"],
  ["SFX              ✓ ONLINE", "text-laser-amber"],
  ["──────────────────────────", "text-border-bright"],
  ["READY.", "text-laser-amber"],
];

const LINE_DELAY_MS = 160;
const HOLD_AFTER_LAST_MS = 600;

export function PreShowSequence() {
  const [visible, setVisible] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only show on first visit and respect reduced motion preferences
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    setVisible(true);

    // Reveal lines sequentially
    let count = 0;
    function revealNext() {
      count++;
      setRevealedCount(count);
      if (count < SEQUENCE_LINES.length) {
        timerRef.current = setTimeout(revealNext, LINE_DELAY_MS);
      } else {
        // All lines shown — hold briefly then dismiss
        timerRef.current = setTimeout(dismiss, HOLD_AFTER_LAST_MS);
      }
    }
    timerRef.current = setTimeout(revealNext, LINE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function dismiss() {
    setExiting(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }

  useEffect(() => {
    if (!visible) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          aria-label="System initialization sequence"
          className="fixed inset-0 z-[99999] bg-background flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="sr-only">Press Escape or Space to skip intro</span>
          <div role="status" aria-live="polite" className="font-mono text-sm leading-relaxed" style={{ minWidth: "26ch" }}>
            {SEQUENCE_LINES.slice(0, revealedCount).map(([text, colorClass], i) => (
              <div
                key={i}
                className={`whitespace-pre ${colorClass || "text-muted"}`}
                style={{ fontWeight: i === 0 ? 700 : i === SEQUENCE_LINES.length - 1 ? 700 : 300 }}
              >
                {text}
              </div>
            ))}
          </div>
          <button
            onClick={dismiss}
            className="absolute bottom-8 right-8 mono-label text-muted hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Skip intro"
          >
            SKIP ESC
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
