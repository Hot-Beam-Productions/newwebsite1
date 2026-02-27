"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FocalPoint } from "@/lib/media-url";

interface FocalPointEditorProps {
  src: string;
  aspect: "video" | "square" | "portrait" | "fullscreen";
  initialPoint: FocalPoint | null;
  onCancel: () => void;
  onSave: (point: FocalPoint | null) => void;
}

const aspectClasses: Record<FocalPointEditorProps["aspect"], string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  fullscreen: "aspect-[16/9]",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toPercent(
  event: ReactPointerEvent<HTMLDivElement>,
  element: HTMLDivElement
): FocalPoint {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
  };
}

export function FocalPointEditor({
  src,
  aspect,
  initialPoint,
  onCancel,
  onSave,
}: FocalPointEditorProps) {
  const [point, setPoint] = useState<FocalPoint>(initialPoint ?? { x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-3xl rounded-xl border border-border bg-surface p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Frame image"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-lg text-foreground">Frame Image</h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border p-1.5 text-muted transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs text-muted-light">
          Click or drag to choose the focal point used when the image is cropped.
        </p>

        <div className="mx-auto w-full max-w-2xl">
          <div
            ref={surfaceRef}
            className={cn("relative overflow-hidden rounded-md border border-border bg-black touch-none", aspectClasses[aspect])}
            onPointerDown={(event) => {
              if (!surfaceRef.current) return;
              setDragging(true);
              setPoint(toPercent(event, surfaceRef.current));
            }}
            onPointerMove={(event) => {
              if (!dragging || !surfaceRef.current) return;
              setPoint(toPercent(event, surfaceRef.current));
            }}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
          >
            <Image
              src={src}
              alt="Frame preview"
              fill
              unoptimized
              className="pointer-events-none select-none object-cover"
              style={{ objectPosition: `${point.x}% ${point.y}%` }}
            />

            <div
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPoint({ x: 50, y: 50 })}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-light transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-light transition-colors hover:bg-surface-light"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(point)}
              className="rounded-md bg-laser-cyan px-3 py-1.5 text-xs font-semibold text-background transition-all hover:brightness-110"
            >
              Save Framing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
