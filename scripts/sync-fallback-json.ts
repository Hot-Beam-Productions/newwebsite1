/**
 * Sync static fallback JSON with the latest Firestore content.
 *
 * Default: writes src/data/data.json
 * Check mode: npx tsx scripts/sync-fallback-json.ts --check
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  aboutSchema,
  brandSchema,
  contactSchema,
  footerSchema,
  homeSchema,
  navigationSchema,
  projectSchema,
  rentalSchema,
  rentalsSettingsSchema,
  seoSchema,
  workSettingsSchema,
} from "../src/lib/schemas";
import type { NavLink, ProjectItem, RentalItem, SiteData } from "../src/lib/types";

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { bytesValue: string }
  | { referenceValue: string }
  | { geoPointValue: { latitude: number; longitude: number } }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

interface FirestoreCollectionResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

function loadDotEnvLocal() {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) return;

  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID/FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_API_KEY/FIREBASE_API_KEY");
  }

  return { projectId, apiKey };
}

function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if ("bytesValue" in value) return value.bytesValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("geoPointValue" in value) return value.geoPointValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((item) => decodeFirestoreValue(item));
  }
  if ("mapValue" in value) {
    return decodeFirestoreFields(value.mapValue.fields ?? {});
  }
  return null;
}

function decodeFirestoreFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function decodeFirestoreDocument<T>(doc: FirestoreDocument): T {
  const id = doc.name.split("/").pop() ?? "";
  return { id, ...decodeFirestoreFields(doc.fields ?? {}) } as T;
}

async function fetchFirestoreJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}) for ${url}: ${body.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

async function getSiteDoc<T>(config: { projectId: string; apiKey: string }, docId: string): Promise<T> {
  const encodedDocId = encodeURIComponent(docId);
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/site/${encodedDocId}?key=${config.apiKey}`;
  const doc = await fetchFirestoreJson<FirestoreDocument>(url);
  return decodeFirestoreFields(doc.fields ?? {}) as T;
}

async function getCollectionDocs<T>(
  config: { projectId: string; apiKey: string },
  collectionName: string
): Promise<T[]> {
  const docs: T[] = [];
  let nextPageToken: string | undefined;

  do {
    const query = new URLSearchParams({
      key: config.apiKey,
      pageSize: "100",
      ...(nextPageToken ? { pageToken: nextPageToken } : {}),
    });
    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/${collectionName}?${query.toString()}`;
    const data = await fetchFirestoreJson<FirestoreCollectionResponse>(url);
    docs.push(...(data.documents ?? []).map((doc) => decodeFirestoreDocument<T>(doc)));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return docs;
}

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

async function buildSiteDataFromFirestore(config: { projectId: string; apiKey: string }): Promise<SiteData> {
  const [brandRaw, navigationRaw, seoRaw, homeRaw, aboutRaw, contactRaw, footerRaw, workSettingsRaw, rentalsSettingsRaw, projectsRaw, rentalsRaw] =
    await Promise.all([
      getSiteDoc(config, "brand"),
      getSiteDoc<{ links?: NavLink[] }>(config, "navigation"),
      getSiteDoc(config, "seo"),
      getSiteDoc(config, "home"),
      getSiteDoc(config, "about"),
      getSiteDoc(config, "contact"),
      getSiteDoc(config, "footer"),
      getSiteDoc(config, "work-settings"),
      getSiteDoc(config, "rentals-settings"),
      getCollectionDocs<ProjectItem>(config, "projects"),
      getCollectionDocs<RentalItem>(config, "rentals"),
    ]);

  const brand = brandSchema.parse(brandRaw);
  const navigation = navigationSchema.parse({ links: navigationRaw.links ?? [] }).links;
  const seo = seoSchema.parse(seoRaw);
  const home = homeSchema.parse(homeRaw);
  const about = aboutSchema.parse(aboutRaw);
  const contact = contactSchema.parse(contactRaw);
  const footer = footerSchema.parse(footerRaw);
  const workSettings = workSettingsSchema.parse(workSettingsRaw);
  const rentalsSettings = rentalsSettingsSchema.parse(rentalsSettingsRaw);
  const projects = sortByOrder(projectsRaw)
    .map((project) => projectSchema.parse(project));
  const rentals = sortByOrder(rentalsRaw)
    .map((rental) => rentalSchema.parse(rental));

  return {
    brand,
    navigation,
    seo,
    home,
    about,
    contact,
    footer,
    work: {
      heading: workSettings.heading,
      projects,
    },
    rentals: {
      heading: rentalsSettings.heading,
      categories: rentalsSettings.categories,
      footerNote: rentalsSettings.footerNote,
      items: rentals,
    },
  };
}

function writeFallbackJson(siteData: SiteData) {
  const outputPath = resolve(__dirname, "../src/data/data.json");
  writeFileSync(outputPath, `${JSON.stringify(siteData, null, 2)}\n`, "utf-8");
}

async function main() {
  loadDotEnvLocal();
  const checkOnly = process.argv.includes("--check");
  const config = getConfig();
  const siteData = await buildSiteDataFromFirestore(config);

  if (checkOnly) {
    console.log("Firestore data validated successfully.");
    return;
  }

  writeFallbackJson(siteData);
  console.log("Updated src/data/data.json from Firestore.");
}

main().catch((error) => {
  console.error("sync-fallback-json failed:", error);
  process.exit(1);
});
