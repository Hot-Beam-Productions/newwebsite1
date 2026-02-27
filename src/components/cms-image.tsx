import Image, { type ImageProps } from "next/image";
import { focalPointToObjectPosition, parseMediaUrl } from "@/lib/media-url";

type CmsImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
};

export function CmsImage({ src, alt, style, ...props }: CmsImageProps) {
  const parsed = parseMediaUrl(src);

  return (
    <Image
      {...props}
      src={parsed.src}
      alt={alt}
      style={{
        ...style,
        objectPosition: focalPointToObjectPosition(parsed.focalPoint),
      }}
    />
  );
}
