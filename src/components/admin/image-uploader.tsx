"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: "video" | "square" | "portrait";
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const aspectClasses = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
};

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
  aspect = "video",
}: ImageUploaderProps) {
  const { idToken } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!idToken) {
        setError("You must be signed in to upload images.");
        return;
      }

      if (!ALLOWED_FILE_TYPES.has(file.type)) {
        setError("Only JPEG, PNG, WebP, and AVIF files are allowed.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File is too large. Maximum size is 10 MB.");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [idToken, folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      e.target.value = "";
    },
    [upload]
  );

  const hasImage = value && !value.includes("pub-XXXX");

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-light">{label}</label>

      {hasImage ? (
        <div className={cn("relative overflow-hidden rounded-md border border-border", aspectClasses[aspect])}>
          <Image src={value} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground transition-colors hover:bg-red-500/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors",
            aspectClasses[aspect],
            dragOver
              ? "border-laser-cyan bg-laser-cyan/5"
              : "border-border hover:border-border-bright"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-laser-cyan" />
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-muted" />
              <p className="text-sm text-muted">
                Drop an image here or click to browse
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
