/**
 * Script to replace broken R2 image URLs with working picsum.photos placeholders.
 *
 * Reads all documents from `projects`, `rentals`, and `site` collections,
 * then replaces any URL containing `pub-` + `.r2.dev` with picsum.photos URLs.
 *
 * Run: npx tsx scripts/update-placeholder-images.ts
 *
 * Requires NEXT_PUBLIC_FIREBASE_* env vars in .env.local.
 * NOTE: Firestore rules must temporarily allow unauthenticated writes.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

// ── Load .env.local ─────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "../.env.local");
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

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Check whether a URL is a broken R2 placeholder */
function isBrokenR2Url(url: unknown): url is string {
  if (typeof url !== "string") return false;
  return /pub-[a-f0-9]+\.r2\.dev/i.test(url) || url.includes("pub-XXXX.r2.dev");
}

/** Replace a single broken URL with a picsum.photos URL */
function makePicsumUrl(
  seed: string,
  width: number,
  height: number,
): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// ── Update projects ─────────────────────────────────────────────────────────

async function updateProjects(): Promise<number> {
  const snap = await getDocs(collection(db, "projects"));
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const id = docSnap.id;
    const changes: Record<string, unknown> = {};

    // mainImageUrl
    if (isBrokenR2Url(data.mainImageUrl)) {
      changes.mainImageUrl = makePicsumUrl(id, 1200, 800);
    }

    // gallery array
    if (Array.isArray(data.gallery)) {
      const newGallery = data.gallery.map((url: unknown, idx: number) =>
        isBrokenR2Url(url)
          ? makePicsumUrl(`${id}-${idx}`, 1200, 800)
          : url,
      );
      const hasChanges = newGallery.some((url, idx) => url !== data.gallery[idx]);
      if (hasChanges) {
        changes.gallery = newGallery;
      }
    }

    if (Object.keys(changes).length > 0) {
      await updateDoc(doc(db, "projects", id), changes);
      console.log(`  [projects] Updated ${id}: ${Object.keys(changes).join(", ")}`);
      updated++;
    }
  }

  return updated;
}

// ── Update rentals ──────────────────────────────────────────────────────────

async function updateRentals(): Promise<number> {
  const snap = await getDocs(collection(db, "rentals"));
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const id = docSnap.id;

    if (isBrokenR2Url(data.imageUrl)) {
      await updateDoc(doc(db, "rentals", id), {
        imageUrl: makePicsumUrl(id, 800, 800),
      });
      console.log(`  [rentals] Updated ${id}: imageUrl`);
      updated++;
    }
  }

  return updated;
}

// ── Update site singleton docs ──────────────────────────────────────────────

/**
 * Recursively walk an object and replace any broken R2 URLs.
 * Returns [newObject, changeCount].
 */
function replaceR2UrlsDeep(
  obj: unknown,
  seedPrefix: string,
  counter: { n: number },
): unknown {
  if (typeof obj === "string") {
    if (isBrokenR2Url(obj)) {
      counter.n++;
      // Derive seed from the URL path for variety
      const pathPart = obj.split("/").pop()?.replace(/\.\w+$/, "") ?? `item-${counter.n}`;
      return makePicsumUrl(`${seedPrefix}-${pathPart}`, 400, 400);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, idx) =>
      replaceR2UrlsDeep(item, `${seedPrefix}-${idx}`, counter),
    );
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = replaceR2UrlsDeep(val, `${seedPrefix}-${key}`, counter);
    }
    return result;
  }

  return obj;
}

async function updateSiteDocs(): Promise<number> {
  const snap = await getDocs(collection(db, "site"));
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const id = docSnap.id;
    const counter = { n: 0 };
    const newData = replaceR2UrlsDeep(data, id, counter) as Record<string, unknown>;

    if (counter.n > 0) {
      // updateDoc needs the changed fields; we re-set the whole doc content
      await updateDoc(doc(db, "site", id), newData);
      console.log(`  [site] Updated ${id}: ${counter.n} URL(s) replaced`);
      updated++;
    }
  }

  return updated;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Updating broken R2 image URLs with picsum.photos placeholders...\n");

  console.log("Processing projects...");
  const projectCount = await updateProjects();
  console.log(`  ${projectCount} project(s) updated.\n`);

  console.log("Processing rentals...");
  const rentalCount = await updateRentals();
  console.log(`  ${rentalCount} rental(s) updated.\n`);

  console.log("Processing site documents...");
  const siteCount = await updateSiteDocs();
  console.log(`  ${siteCount} site doc(s) updated.\n`);

  const total = projectCount + rentalCount + siteCount;
  console.log(`Done! ${total} document(s) updated total.`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
