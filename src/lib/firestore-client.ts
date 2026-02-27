/**
 * Client-side Firestore helpers for the admin panel.
 * Uses the Firebase client SDK (no Admin SDK / service account needed).
 * Security is enforced via Firestore security rules.
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

// ── Site document helpers ──

export async function getSiteDoc<T>(docId: string): Promise<T> {
  const snap = await getDoc(doc(getFirebaseDb(), "site", docId));
  if (!snap.exists()) {
    throw new Error(`Missing site document: ${docId}`);
  }
  return snap.data() as T;
}

export async function updateSiteDoc(
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  await setDoc(doc(getFirebaseDb(), "site", docId), data);
}

// ── Collection helpers ──

export async function getCollectionDocs<T>(
  collectionName: string,
  orderField = "order"
): Promise<T[]> {
  const snap = await getDocs(collection(getFirebaseDb(), collectionName));
  const docs = snap.docs.map(
    (d) => ({ ...d.data(), id: d.id }) as unknown as T & Record<string, unknown>
  );

  return docs.sort((a, b) => {
    const aOrder = Number(a[orderField] ?? 0);
    const bOrder = Number(b[orderField] ?? 0);
    return aOrder - bOrder;
  }) as T[];
}

export async function getDocById<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const snap = await getDoc(doc(getFirebaseDb(), collectionName, id));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as T;
}

export async function setDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await setDoc(doc(getFirebaseDb(), collectionName, id), data);
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), collectionName, id));
}

export async function docExists(
  collectionName: string,
  id: string
): Promise<boolean> {
  const snap = await getDoc(doc(getFirebaseDb(), collectionName, id));
  return snap.exists();
}

// ── Batch writes ──

export function createBatch() {
  return writeBatch(getFirebaseDb());
}

export function batchSet(
  batch: ReturnType<typeof writeBatch>,
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
) {
  batch.set(doc(getFirebaseDb(), collectionName, docId), data);
}
