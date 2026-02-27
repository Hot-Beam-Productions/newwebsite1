import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function updateAtPath<T extends object>(
  source: T,
  path: string,
  value: unknown
): T {
  const next = structuredClone(source);
  const keys = path.split(".");
  let current = next as Record<string, unknown>;

  for (const key of keys.slice(0, -1)) {
    const child = current[key];
    if (!child || typeof child !== "object" || Array.isArray(child)) {
      throw new Error(`Invalid update path: ${path}`);
    }
    current = child as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  return next;
}

export function toSafeExternalUrl(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Ignore malformed URL and use fallback.
  }

  return fallback;
}
