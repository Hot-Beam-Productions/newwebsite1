import type { S3Client } from "@aws-sdk/client-s3";
import type { SiteData } from "@/lib/types";

const DEFAULT_SNAPSHOT_KEY = "system/public-site-data.json";
const SNAPSHOT_CACHE_SECONDS = 30 * 60;
const SNAPSHOT_TAG = "public-site-data";

interface SnapshotStoreConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
  key: string;
}

interface PublishedSnapshotPayload {
  generatedAt: string;
  siteData: SiteData;
}

let cachedS3Client: S3Client | null = null;

function getSnapshotKey(): string {
  return process.env.PUBLIC_SITE_SNAPSHOT_KEY?.trim() || DEFAULT_SNAPSHOT_KEY;
}

function getPublicSnapshotUrl(): string | null {
  const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!publicDomain) return null;
  return `https://${publicDomain}/${getSnapshotKey()}`;
}

function getSnapshotStoreConfig(): SnapshotStoreConfig | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicDomain) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicDomain,
    key: getSnapshotKey(),
  };
}

async function getS3Client(config: SnapshotStoreConfig): Promise<S3Client> {
  if (cachedS3Client) return cachedS3Client;

  const { S3Client } = await import("@aws-sdk/client-s3");
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

function parsePublishedSnapshot(raw: unknown): SiteData | null {
  if (!raw || typeof raw !== "object") return null;
  const payload = raw as Partial<PublishedSnapshotPayload>;
  if (!payload.siteData || typeof payload.siteData !== "object") return null;
  return payload.siteData as SiteData;
}

export async function getPublishedSiteSnapshot(options?: { fresh?: boolean }): Promise<SiteData | null> {
  const url = getPublicSnapshotUrl();
  if (!url) return null;

  try {
    const response = await fetch(
      url,
      options?.fresh
        ? { cache: "no-store" }
        : {
            next: {
              revalidate: SNAPSHOT_CACHE_SECONDS,
              tags: [SNAPSHOT_TAG],
            },
          }
    );

    if (!response.ok) return null;
    const raw = (await response.json()) as unknown;
    return parsePublishedSnapshot(raw);
  } catch {
    return null;
  }
}

export async function publishSiteSnapshot(siteData: SiteData): Promise<boolean> {
  const config = getSnapshotStoreConfig();
  if (!config) return false;
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");

  const body = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      siteData,
    } satisfies PublishedSnapshotPayload
  );

  try {
    const s3Client = await getS3Client(config);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: config.key,
        Body: body,
        ContentType: "application/json; charset=utf-8",
        CacheControl: `public, max-age=${SNAPSHOT_CACHE_SECONDS}`,
      })
    );
    return true;
  } catch {
    return false;
  }
}
