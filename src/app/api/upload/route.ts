import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { verifyAdminToken } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const SAFE_FOLDER_PATTERN = /^[a-z0-9/-]+$/;

interface UploadConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}

let cachedS3Client: S3Client | null = null;

function getUploadConfig(): UploadConfig {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicDomain) {
    throw new Error("Missing required R2 environment variables");
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicDomain,
  };
}

function getS3Client(config: UploadConfig): S3Client {
  if (cachedS3Client) return cachedS3Client;

  cachedS3Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedS3Client;
}

function sanitizeFolder(rawFolder: unknown): string {
  const folder = String(rawFolder ?? "uploads")
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");

  if (!folder || folder.includes("..") || !SAFE_FOLDER_PATTERN.test(folder)) {
    throw new Error("Invalid upload folder");
  }

  return folder;
}

function getFileExtension(fileName: string, mimeType: string): string {
  const extensionFromType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };

  const rawExtension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const safeExtension = /^[a-z0-9]+$/.test(rawExtension) ? rawExtension : "";
  return safeExtension || extensionFromType[mimeType] || "jpg";
}

function isImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(mimeType);
}

function isVideoType(mimeType: string): boolean {
  return ALLOWED_VIDEO_TYPES.has(mimeType);
}

function getMaxFileSize(mimeType: string): number {
  return isVideoType(mimeType) ? MAX_VIDEO_FILE_SIZE : MAX_IMAGE_FILE_SIZE;
}

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  try {
    await verifyAdminToken(authHeader.slice(7));
  } catch {
    return unauthorizedResponse();
  }

  let config: UploadConfig;
  try {
    config = getUploadConfig();
  } catch {
    return NextResponse.json({ error: "Upload service is not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const fileField = formData.get("file");
  if (!isFile(fileField)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const file = fileField;
  if (!isImageType(file.type) && !isVideoType(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use JPEG, PNG, WebP, AVIF, MP4, or WebM." },
      { status: 400 }
    );
  }

  const maxFileSize = getMaxFileSize(file.type);
  if (file.size > maxFileSize) {
    return NextResponse.json(
      {
        error: isVideoType(file.type)
          ? "File too large. Maximum video size is 50 MB."
          : "File too large. Maximum image size is 10 MB.",
      },
      { status: 400 }
    );
  }

  let folder: string;
  try {
    folder = sanitizeFolder(formData.get("folder"));
  } catch {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  const originalType = file.type;
  const originalSize = file.size;

  let outputBuffer: Buffer;
  let finalType = originalType;
  let extension = getFileExtension(file.name, originalType);

  try {
    const sourceBuffer = Buffer.from(await file.arrayBuffer());

    if (isImageType(originalType)) {
      outputBuffer = await sharp(sourceBuffer).rotate().webp({ quality: 80 }).toBuffer();
      finalType = "image/webp";
      extension = "webp";
    } else {
      outputBuffer = sourceBuffer;
    }
  } catch {
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }

  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  try {
    await getS3Client(config).send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: outputBuffer,
        ContentType: finalType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({
    url: `https://${config.publicDomain}/${key}`,
    originalType,
    finalType,
    originalSize,
    finalSize: outputBuffer.byteLength,
  });
}
