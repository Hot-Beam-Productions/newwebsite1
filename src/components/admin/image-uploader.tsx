"use client";

import { MediaUploader } from "./media-uploader";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: "video" | "square" | "portrait";
  maxSizeMb?: number;
  showCropPreview?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  label = "Image",
  aspect = "video",
  maxSizeMb = 10,
  showCropPreview = true,
}: ImageUploaderProps) {
  return (
    <MediaUploader
      value={value}
      onChange={onChange}
      folder={folder}
      label={label}
      aspect={aspect}
      accept="image"
      maxSizeMb={maxSizeMb}
      showCropPreview={showCropPreview}
    />
  );
}
