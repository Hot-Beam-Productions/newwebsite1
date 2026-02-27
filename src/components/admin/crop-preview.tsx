"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CropPreviewProps {
  src: string;
  mediaType: "image" | "video";
  naturalWidth: number;
  naturalHeight: number;
  onClose: () => void;
}

type AspectOption = {
  id: "16:9" | "4:3" | "1:1" | "3:4" | "full";
  label: string;
  ratio: number | null;
};

const ASPECT_OPTIONS: AspectOption[] = [
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "full", label: "Full", ratio: null },
];

function getSafeZone(mediaAspect: number, targetAspect: number | null) {
  if (!targetAspect || !Number.isFinite(mediaAspect) || mediaAspect <= 0) {
    return { left: 0, top: 0, width: 100, height: 100 };
  }

  let widthRatio = 1;
  let heightRatio = 1;

  if (targetAspect > mediaAspect) {
    heightRatio = mediaAspect / targetAspect;
  } else if (targetAspect < mediaAspect) {
    widthRatio = targetAspect / mediaAspect;
  }

  const width = widthRatio * 100;
  const height = heightRatio * 100;

  return {
    left: (100 - width) / 2,
    top: (100 - height) / 2,
    width,
    height,
  };
}

export function CropPreview({
  src,
  mediaType,
  naturalWidth,
  naturalHeight,
  onClose,
}: CropPreviewProps) {
  const [activeAspectId, setActiveAspectId] = useState<AspectOption["id"]>("16:9");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const activeAspect = ASPECT_OPTIONS.find((option) => option.id === activeAspectId) ?? ASPECT_OPTIONS[0];
  const mediaAspect = naturalWidth > 0 && naturalHeight > 0 ? naturalWidth / naturalHeight : 16 / 9;

  const safeZone = useMemo(
    () => getSafeZone(mediaAspect, activeAspect.ratio),
    [mediaAspect, activeAspect.ratio]
  );

  const right = 100 - (safeZone.left + safeZone.width);
  const bottom = 100 - (safeZone.top + safeZone.height);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-5xl rounded-xl border border-border bg-surface p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Crop preview"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-lg text-foreground">Preview Crop</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border p-1.5 text-muted transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mx-auto max-h-[70vh] w-full overflow-hidden rounded-md border border-border bg-black">
          <div className="relative w-full" style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}>
            {mediaType === "video" ? (
              <video
                src={src}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={src}
                alt="Crop preview"
                fill
                unoptimized
                className="object-cover"
              />
            )}

            {activeAspect.ratio && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 bg-black/55" style={{ height: `${safeZone.top}%` }} />
                <div className="absolute inset-x-0 bottom-0 bg-black/55" style={{ height: `${bottom}%` }} />
                <div
                  className="absolute bg-black/55"
                  style={{
                    top: `${safeZone.top}%`,
                    bottom: `${bottom}%`,
                    left: 0,
                    width: `${safeZone.left}%`,
                  }}
                />
                <div
                  className="absolute bg-black/55"
                  style={{
                    top: `${safeZone.top}%`,
                    bottom: `${bottom}%`,
                    right: 0,
                    width: `${right}%`,
                  }}
                />
                <div
                  className="absolute border border-white/80"
                  style={{
                    left: `${safeZone.left}%`,
                    top: `${safeZone.top}%`,
                    width: `${safeZone.width}%`,
                    height: `${safeZone.height}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ASPECT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveAspectId(option.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                option.id === activeAspectId
                  ? "border-laser-cyan bg-laser-cyan/10 text-laser-cyan"
                  : "border-border text-muted-light hover:border-border-bright hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
