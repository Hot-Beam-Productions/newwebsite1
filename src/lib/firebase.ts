import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

function readFirebaseEnv(publicValue: string | undefined, fallbackValue: string | undefined): string | undefined {
  return publicValue ?? fallbackValue;
}

const firebaseConfig = {
  apiKey: readFirebaseEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, process.env.FIREBASE_API_KEY),
  authDomain: readFirebaseEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, process.env.FIREBASE_AUTH_DOMAIN),
  projectId: readFirebaseEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, process.env.FIREBASE_PROJECT_ID),
  storageBucket: readFirebaseEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, process.env.FIREBASE_STORAGE_BUCKET),
  messagingSenderId: readFirebaseEnv(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: readFirebaseEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, process.env.FIREBASE_APP_ID),
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function isFirebaseConfigured(): boolean {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* (or FIREBASE_*) env vars.");
  }
  _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}
