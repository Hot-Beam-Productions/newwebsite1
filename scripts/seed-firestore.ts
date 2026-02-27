/**
 * One-time script to seed Firestore with data from data.json.
 * Uses the Firebase client SDK (no Admin SDK / service account needed).
 *
 * Run: npx tsx scripts/seed-firestore.ts
 *
 * Requires NEXT_PUBLIC_FIREBASE_* env vars in .env.local.
 * You must be signed in to the admin panel first (the script uses
 * anonymous write access, so Firestore rules must temporarily allow it).
 *
 * ALTERNATIVE: Use the Firebase MCP tools or Firebase Console to import data.
 *
 * NOTE: This script requires temporarily open Firestore security rules.
 * After seeding, restore restrictive rules.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  writeBatch,
} from "firebase/firestore";

// Load .env.local
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

interface SiteData {
  brand: Record<string, unknown>;
  navigation: Array<{ href: string; label: string }>;
  seo: Record<string, unknown>;
  home: Record<string, unknown>;
  work: {
    heading: Record<string, unknown>;
    projects: Array<Record<string, unknown>>;
  };
  about: Record<string, unknown>;
  rentals: {
    heading: Record<string, unknown>;
    categories: Array<Record<string, unknown>>;
    footerNote: string;
    items: Array<Record<string, unknown>>;
  };
  contact: Record<string, unknown>;
  footer: Record<string, unknown>;
}

async function seed() {
  const dataPath = resolve(__dirname, "../src/data/data.json");
  const raw = readFileSync(dataPath, "utf-8");
  const data: SiteData = JSON.parse(raw);

  // Site singleton documents (batch max 500 ops)
  const batch = writeBatch(db);

  batch.set(doc(db, "site", "brand"), data.brand);
  batch.set(doc(db, "site", "navigation"), { links: data.navigation });
  batch.set(doc(db, "site", "seo"), data.seo);
  batch.set(doc(db, "site", "home"), data.home);
  batch.set(doc(db, "site", "about"), data.about);
  batch.set(doc(db, "site", "contact"), data.contact);
  batch.set(doc(db, "site", "footer"), data.footer);

  batch.set(doc(db, "site", "work-settings"), {
    heading: data.work.heading,
  });

  batch.set(doc(db, "site", "rentals-settings"), {
    heading: data.rentals.heading,
    categories: data.rentals.categories,
    footerNote: data.rentals.footerNote,
  });

  // Projects collection
  for (let i = 0; i < data.work.projects.length; i++) {
    const project = data.work.projects[i];
    const id = project.id as string;
    batch.set(doc(db, "projects", id), { ...project, order: i });
  }

  // Rentals collection
  for (let i = 0; i < data.rentals.items.length; i++) {
    const item = data.rentals.items[i];
    const id = item.id as string;
    batch.set(doc(db, "rentals", id), { ...item, order: i });
  }

  await batch.commit();
  console.log("Firestore seeded successfully!");
  console.log(
    `  - ${data.work.projects.length} projects, ${data.rentals.items.length} rentals`
  );
  console.log(
    "  - Site documents: brand, navigation, seo, home, about, contact, footer, work-settings, rentals-settings"
  );

  // Force exit since Firebase client SDK keeps a connection open
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
