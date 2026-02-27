import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { verifyAdminToken } from "@/lib/auth-helpers";

let _s3: S3Client | null = null;
function getS3(): S3Client {
  if (_s3) return _s3;
  _s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return _s3;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const SAFE_FOLDER_PATTERN = /^[a-z0-9/-]+$/;

function sanitizeFolder(rawFolder: string): string {
  const folder = rawFolder.toLowerCase().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!folder || folder.includes("..") || !SAFE_FOLDER_PATTERN.test(folder)) {
    throw new Error("Invalid upload folder");
  }
  return folder;
}

function getFileExtension(fileName: string, mimeType: string): string {
  const extFromType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };

  const rawExt = fileName.split(".").pop()?.toLowerCase() ?? "";
  const safeExt = /^[a-z0-9]+$/.test(rawExt) ? rawExt : "";
  return safeExt || extFromType[mimeType] || "jpg";
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await verifyAdminToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folderRaw = (formData.get("folder") as string) || "uploads";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use JPEG, PNG, WebP, or AVIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 400 }
    );
  }

  let folder: string;
  try {
    folder = sanitizeFolder(folderRaw);
  } catch {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  const ext = getFileExtension(file.name, file.type);
  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await getS3().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const url = `https://${process.env.NEXT_PUBLIC_R2_DOMAIN}/${key}`;
  return NextResponse.json({ url });
}
