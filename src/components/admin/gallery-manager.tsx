"use client";

import { useCallback, useState } from "react";
import { X, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { CmsImage } from "@/components/cms-image";
import { isPublishedMediaUrl } from "@/lib/media-url";

interface GalleryManagerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export function GalleryManager({
  value,
  onChange,
  folder = "portfolio",
}: GalleryManagerProps) {
  const [showUploader, setShowUploader] = useState(false);

  const remove = useCallback(
    (index: number) => {
      const next = [...value];
      next.splice(index, 1);
      onChange(next);
    },
    [value, onChange]
  );

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const next = [...value];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      onChange(next);
    },
    [value, onChange]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === value.length - 1) return;
      const next = [...value];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      onChange(next);
    },
    [value, onChange]
  );

  const addImage = useCallback(
    (url: string) => {
      if (url) {
        onChange([...value, url]);
        setShowUploader(false);
      }
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-light">Gallery</label>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, i) => {
            const hasImage = isPublishedMediaUrl(url);
            return (
              <div
                key={`${url}-${i}`}
                className="group relative aspect-video overflow-hidden rounded-md border border-border"
              >
                {hasImage ? (
                  <CmsImage src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-surface text-xs text-muted">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="rounded bg-surface p-1 text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === value.length - 1}
                    className="rounded bg-surface p-1 text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="rounded bg-red-500/80 p-1 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUploader ? (
        <div className="rounded-md border border-border bg-surface p-4">
          <ImageUploader
            value=""
            onChange={addImage}
            folder={folder}
            label="Add gallery image"
          />
          <button
            type="button"
            onClick={() => setShowUploader(false)}
            className="mt-2 text-sm text-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUploader(true)}
          className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm text-muted transition-colors hover:border-laser-cyan hover:text-laser-cyan"
        >
          <Plus className="h-4 w-4" />
          Add Image
        </button>
      )}
    </div>
  );
}
