import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { verifyAdminToken } from "@/lib/auth-helpers";

export const runtime = "nodejs";

const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const SAFE_FOLDER_PATTERN = /^[a-z0-9/-]+$/;
const PRESIGN_TTL_SECONDS = 5 * 60;

interface UploadConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
}

interface PresignPayload {
  fileName?: unknown;
  contentType?: unknown;
  folder?: unknown;
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

function getFileExtension(fileName: string, contentType: string): string {
  const extensionFromType: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
  };

  const rawExtension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const safeExtension = /^[a-z0-9]+$/.test(rawExtension) ? rawExtension : "";

  return safeExtension || extensionFromType[contentType] || "mp4";
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function ensureAuthorized(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  try {
    await verifyAdminToken(authHeader.slice(7));
    return true;
  } catch {
    return false;
  }
}

async function createPresignResponse(payload: PresignPayload) {
  const fileName = String(payload.fileName ?? "").trim();
  const contentType = String(payload.contentType ?? "").trim().toLowerCase();

  if (!fileName) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }

  if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Only MP4 and WebM videos are supported." }, { status: 400 });
  }

  let folder: string;
  try {
    folder = sanitizeFolder(payload.folder);
  } catch {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  let config: UploadConfig;
  try {
    config = getUploadConfig();
  } catch {
    return NextResponse.json({ error: "Upload service is not configured" }, { status: 500 });
  }

  const extension = getFileExtension(fileName, contentType);
  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(getS3Client(config), command, {
      expiresIn: PRESIGN_TTL_SECONDS,
    });

    return NextResponse.json({
      uploadUrl,
      publicUrl: `https://${config.publicDomain}/${key}`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const isAuthorized = await ensureAuthorized(request);
  if (!isAuthorized) {
    return unauthorizedResponse();
  }

  const payload: PresignPayload = {
    fileName: request.nextUrl.searchParams.get("fileName"),
    contentType: request.nextUrl.searchParams.get("contentType"),
    folder: request.nextUrl.searchParams.get("folder"),
  };

  return createPresignResponse(payload);
}

export async function POST(request: NextRequest) {
  const isAuthorized = await ensureAuthorized(request);
  if (!isAuthorized) {
    return unauthorizedResponse();
  }

  let payload: PresignPayload;
  try {
    payload = (await request.json()) as PresignPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  return createPresignResponse(payload);
}
