export interface FocalPoint {
  x: number;
  y: number;
}

const FOCAL_PARAM = "fp";
const DEFAULT_FOCAL_POINT: FocalPoint = { x: 50, y: 50 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizePoint(point: FocalPoint): FocalPoint {
  return {
    x: clamp(point.x, 0, 100),
    y: clamp(point.y, 0, 100),
  };
}

function parsePoint(raw: string | null): FocalPoint | null {
  if (!raw) return null;
  const [xRaw, yRaw] = raw.split(",");
  if (!xRaw || !yRaw) return null;

  const x = Number.parseFloat(xRaw);
  const y = Number.parseFloat(yRaw);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return normalizePoint({ x, y });
}

function roundToTenths(value: number): number {
  return Math.round(value * 10) / 10;
}

function isCentered(point: FocalPoint): boolean {
  return Math.abs(point.x - DEFAULT_FOCAL_POINT.x) < 0.05 && Math.abs(point.y - DEFAULT_FOCAL_POINT.y) < 0.05;
}

export function parseMediaUrl(rawUrl: string): {
  src: string;
  focalPoint: FocalPoint | null;
} {
  if (!rawUrl) {
    return { src: "", focalPoint: null };
  }

  const hashIndex = rawUrl.indexOf("#");
  const src = hashIndex >= 0 ? rawUrl.slice(0, hashIndex) : rawUrl;
  const hash = hashIndex >= 0 ? rawUrl.slice(hashIndex + 1) : "";
  const params = new URLSearchParams(hash);

  return {
    src,
    focalPoint: parsePoint(params.get(FOCAL_PARAM)),
  };
}

export function withFocalPoint(rawUrl: string, point: FocalPoint | null): string {
  if (!rawUrl) return "";

  const hashIndex = rawUrl.indexOf("#");
  const src = hashIndex >= 0 ? rawUrl.slice(0, hashIndex) : rawUrl;
  const hash = hashIndex >= 0 ? rawUrl.slice(hashIndex + 1) : "";
  const params = new URLSearchParams(hash);
  params.delete(FOCAL_PARAM);

  if (point) {
    const normalized = normalizePoint(point);
    if (!isCentered(normalized)) {
      params.set(
        FOCAL_PARAM,
        `${roundToTenths(normalized.x)},${roundToTenths(normalized.y)}`
      );
    }
  }

  const nextHash = params.toString();
  return nextHash ? `${src}#${nextHash}` : src;
}

export function focalPointToObjectPosition(point: FocalPoint | null): string {
  const normalized = point ? normalizePoint(point) : DEFAULT_FOCAL_POINT;
  return `${normalized.x}% ${normalized.y}%`;
}

export function stripMediaUrlDecorators(rawUrl: string): string {
  return parseMediaUrl(rawUrl).src;
}

