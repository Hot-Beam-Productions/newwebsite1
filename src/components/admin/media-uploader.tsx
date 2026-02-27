"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Move, Scissors, Upload, X } from "lucide-react";
import { useAuth } from "./auth-provider";
import { CropPreview } from "./crop-preview";
import { FocalPointEditor } from "./focal-point-editor";
import { cn } from "@/lib/utils";
import { focalPointToObjectPosition, isPublishedMediaUrl, parseMediaUrl, withFocalPoint } from "@/lib/media-url";

type UploadAspect = "video" | "square" | "portrait" | "fullscreen";
type UploadAccept = "image" | "video" | "both";
type MediaType = "image" | "video";

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: UploadAspect;
  accept?: UploadAccept;
  maxSizeMb?: number;
  showCropPreview?: boolean;
}

interface UploadResponse {
  url: string;
  originalType: string;
  finalType: string;
  originalSize: number;
  finalSize: number;
}

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

const DEFAULT_MAX_IMAGE_MB = 10;
const DEFAULT_MAX_VIDEO_MB = 50;

const aspectClasses: Record<UploadAspect, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  fullscreen: "aspect-[16/9]",
};

const acceptAttributeByType: Record<UploadAccept, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/webm",
  both: "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm",
};

function inferMediaTypeFromFile(file: File): MediaType | null {
  if (IMAGE_TYPES.has(file.type)) return "image";
  if (VIDEO_TYPES.has(file.type)) return "video";
  return null;
}

function inferMediaTypeFromUrl(url: string): MediaType | null {
  if (!url) return null;
  return /\.(mp4|webm)(?:\?|#|$)/i.test(url) ? "video" : "image";
}

function formatMimeType(mimeType: string): string {
  const labelByType: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/avif": "AVIF",
    "video/mp4": "MP4",
    "video/webm": "WebM",
  };
  return labelByType[mimeType] ?? mimeType;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getUploadLimitMb(mediaType: MediaType, maxSizeMb?: number): number {
  if (typeof maxSizeMb === "number" && maxSizeMb > 0) {
    return maxSizeMb;
  }
  return mediaType === "video" ? DEFAULT_MAX_VIDEO_MB : DEFAULT_MAX_IMAGE_MB;
}

function getDropzoneHint(accept: UploadAccept, maxSizeMb?: number): string {
  if (accept === "video") {
    return `MP4 or WebM, up to ${maxSizeMb ?? DEFAULT_MAX_VIDEO_MB} MB`;
  }
  if (accept === "both") {
    return "Images up to 10 MB, videos (MP4/WebM) up to 50 MB";
  }
  return `JPEG, PNG, WebP, AVIF up to ${maxSizeMb ?? DEFAULT_MAX_IMAGE_MB} MB`;
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error) return payload.error;
  } catch {
    // Ignore parse errors and use a generic fallback below.
  }

  return "Upload failed";
}

function uploadWithProgress(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  const corsHint =
    "Direct upload blocked. Check R2 bucket CORS allows your site origin for PUT/OPTIONS and Content-Type.";

  const extractUploadError = (rawResponse: string): string | null => {
    if (!rawResponse) return null;

    const codeMatch = rawResponse.match(/<Code>([^<]+)<\/Code>/i);
    const messageMatch = rawResponse.match(/<Message>([^<]+)<\/Message>/i);

    if (codeMatch?.[1] && messageMatch?.[1]) {
      return `${codeMatch[1]}: ${messageMatch[1]}`;
    }
    if (codeMatch?.[1]) return codeMatch[1];
    return rawResponse.slice(0, 200).trim() || null;
  };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 120_000;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.max(1, Math.min(percent, 100)));
    };

    xhr.onerror = () => reject(new Error(corsHint));
    xhr.ontimeout = () => reject(new Error("Video upload timed out. Try again with a smaller file."));

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      const uploadError = extractUploadError(xhr.responseText);
      const suffix = uploadError ? `: ${uploadError}` : "";
      reject(new Error(`Video upload failed (${xhr.status})${suffix}`));
    };

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

async function getMediaDimensions(src: string, mediaType: MediaType): Promise<{ width: number; height: number }> {
  if (mediaType === "video") {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = src;
      video.onloadedmetadata = () => {
        const width = video.videoWidth || 16;
        const height = video.videoHeight || 9;
        resolve({ width, height });
      };
      video.onerror = () => reject(new Error("Unable to read video dimensions"));
    });
  }

  return new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.src = src;
    image.onload = () => {
      resolve({
        width: image.naturalWidth || 16,
        height: image.naturalHeight || 9,
      });
    };
    image.onerror = () => reject(new Error("Unable to read image dimensions"));
  });
}

export function MediaUploader({
  value,
  onChange,
  folder = "uploads",
  label = "Media",
  aspect = "video",
  accept = "image",
  maxSizeMb,
  showCropPreview = true,
}: MediaUploaderProps) {
  const { idToken } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [localPreviewType, setLocalPreviewType] = useState<MediaType | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showFocalEditor, setShowFocalEditor] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const parsedCommitted = useMemo(() => parseMediaUrl(value), [value]);
  const previewUrl = localPreviewUrl || parsedCommitted.src;
  const previewType =
    localPreviewType || inferMediaTypeFromUrl(previewUrl) || (accept === "video" ? "video" : "image");
  const hasMedia = isPublishedMediaUrl(previewUrl);
  const imageObjectPosition = focalPointToObjectPosition(localPreviewUrl ? null : parsedCommitted.focalPoint);

  const dropzoneMessage = useMemo(() => {
    if (accept === "video") return "Drop a video here or click to browse";
    if (accept === "both") return "Drop media here or click to browse";
    return "Drop an image here or click to browse";
  }, [accept]);

  const canUploadMediaType = useCallback(
    (mediaType: MediaType) => {
      if (accept === "both") return true;
      return accept === mediaType;
    },
    [accept]
  );

  const upload = useCallback(
    async (file: File) => {
      if (!idToken) {
        setError("You must be signed in to upload files.");
        return;
      }

      const mediaType = inferMediaTypeFromFile(file);
      if (!mediaType) {
        setError("Unsupported file type. Use JPEG, PNG, WebP, AVIF, MP4, or WebM.");
        return;
      }

      if (!canUploadMediaType(mediaType)) {
        setError(
          mediaType === "video"
            ? "This field only accepts image files."
            : "This field only accepts MP4 or WebM videos."
        );
        return;
      }

      const uploadLimitMb = getUploadLimitMb(mediaType, maxSizeMb);
      const maxBytes = uploadLimitMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File is too large. Maximum size is ${uploadLimitMb} MB.`);
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(mediaType === "video" ? 0 : 12);
      setConversionMessage(null);

      const previewObjectUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(previewObjectUrl);
      setLocalPreviewType(mediaType);

      try {
        const dimensions = await getMediaDimensions(previewObjectUrl, mediaType);
        setNaturalSize(dimensions);
      } catch {
        setNaturalSize(null);
      }

      try {
        if (mediaType === "image") {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", folder);

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${idToken}` },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(await getErrorMessage(response));
          }

          const result = (await response.json()) as UploadResponse;
          setProgress(100);
          onChange(result.url);

          const savingsPct = result.originalSize > 0
            ? Math.round(((result.originalSize - result.finalSize) / result.originalSize) * 100)
            : 0;
          const sizeDeltaMessage = savingsPct >= 0 ? `${savingsPct}% smaller` : `${Math.abs(savingsPct)}% larger`;

          setConversionMessage(
            `Converted ${formatMimeType(result.originalType)} -> ${formatMimeType(result.finalType)}, ${sizeDeltaMessage}`
          );
        } else {
          const presignParams = new URLSearchParams({
            fileName: file.name,
            contentType: file.type,
            folder,
          });

          const presignResponse = await fetch(`/api/upload/presign?${presignParams.toString()}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (!presignResponse.ok) {
            throw new Error(await getErrorMessage(presignResponse));
          }

          const { uploadUrl, publicUrl } = (await presignResponse.json()) as PresignResponse;
          await uploadWithProgress(uploadUrl, file, setProgress);
          onChange(publicUrl);
          setConversionMessage(`Uploaded ${formatMimeType(file.type)} (${formatBytes(file.size)})`);
        }

        setLocalPreviewUrl(null);
        setLocalPreviewType(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        window.setTimeout(() => setProgress(0), 500);
      }
    },
    [idToken, canUploadMediaType, maxSizeMb, folder, onChange]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      const file = event.dataTransfer.files[0];
      if (file) {
        void upload(file);
      }
    },
    [upload]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        void upload(file);
      }
      event.target.value = "";
    },
    [upload]
  );

  const clearMedia = useCallback(() => {
    onChange("");
    setError(null);
    setConversionMessage(null);
    setNaturalSize(null);
    setShowCropModal(false);
    setShowFocalEditor(false);
    setLocalPreviewType(null);
    setLocalPreviewUrl((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }, [onChange]);

  const maxSizeHint =
    accept === "both"
      ? "10 MB images / 50 MB video"
      : `${maxSizeMb ?? (accept === "video" ? DEFAULT_MAX_VIDEO_MB : DEFAULT_MAX_IMAGE_MB)} MB max`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-light">{label}</label>

      {hasMedia ? (
        <div className={cn("relative overflow-hidden rounded-md border border-border", aspectClasses[aspect])}>
          {previewType === "video" ? (
            <video
              src={previewUrl}
              className="h-full w-full object-cover"
              controls
              playsInline
              onLoadedMetadata={(event) => {
                const width = event.currentTarget.videoWidth;
                const height = event.currentTarget.videoHeight;
                if (width > 0 && height > 0) {
                  setNaturalSize({ width, height });
                }
              }}
            />
          ) : (
            <Image
              src={previewUrl}
              alt={label}
              fill
              unoptimized
              className="object-cover"
              style={{ objectPosition: imageObjectPosition }}
              onLoad={(event) => {
                const width = event.currentTarget.naturalWidth;
                const height = event.currentTarget.naturalHeight;
                if (width > 0 && height > 0) {
                  setNaturalSize({ width, height });
                }
              }}
            />
          )}
          <div className="absolute right-2 top-2 flex gap-2">
            {previewType === "image" && value ? (
              <button
                type="button"
                onClick={() => setShowFocalEditor(true)}
                className="rounded-md bg-background/80 px-2 py-1 text-xs text-foreground transition-colors hover:bg-background"
              >
                <span className="inline-flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  Frame
                </span>
              </button>
            ) : null}
            {showCropPreview && naturalSize && naturalSize.width > 0 && naturalSize.height > 0 ? (
              <button
                type="button"
                onClick={() => setShowCropModal(true)}
                className="rounded-md bg-background/80 px-2 py-1 text-xs text-foreground transition-colors hover:bg-background"
              >
                <span className="inline-flex items-center gap-1">
                  <Scissors className="h-3 w-3" />
                  Preview Crop
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={clearMedia}
              className="rounded-full bg-background/80 p-1.5 text-foreground transition-colors hover:bg-red-500/80 hover:text-white"
              aria-label={`Remove ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors",
            aspectClasses[aspect],
            dragOver ? "border-laser-cyan bg-laser-cyan/5" : "border-border hover:border-border-bright"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-laser-cyan" />
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-muted" />
              <p className="text-center text-sm text-muted">{dropzoneMessage}</p>
              <p className="mt-1 text-center text-xs text-muted-light">{getDropzoneHint(accept, maxSizeMb)}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={acceptAttributeByType[accept]}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading ? (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded bg-surface-light">
            <div
              className="h-full bg-laser-cyan transition-[width] duration-150"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <p className="text-xs text-muted-light">
            Uploading... {Math.max(progress, 1)}% ({maxSizeHint})
          </p>
        </div>
      ) : null}

      {conversionMessage ? <p className="text-xs text-emerald-400">{conversionMessage}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {showCropModal && hasMedia && naturalSize && naturalSize.width > 0 && naturalSize.height > 0 ? (
        <CropPreview
          src={previewUrl}
          mediaType={previewType}
          naturalWidth={naturalSize.width}
          naturalHeight={naturalSize.height}
          onClose={() => setShowCropModal(false)}
        />
      ) : null}

      {showFocalEditor && value && previewType === "image" ? (
        <FocalPointEditor
          src={parsedCommitted.src}
          aspect={aspect}
          initialPoint={parsedCommitted.focalPoint}
          onCancel={() => setShowFocalEditor(false)}
          onSave={(point) => {
            onChange(withFocalPoint(value, point));
            setShowFocalEditor(false);
          }}
        />
      ) : null}
    </div>
  );
}
