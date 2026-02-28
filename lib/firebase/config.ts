/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Firebase SDK Initialization (v9 Modular)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single source of truth for all Firebase service instances.
 * Uses the v9 modular SDK for tree-shaking (smaller bundle).
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication → Phone (for Indian OTP) and Google
 * 3. Create a Firestore database in asia-south1 (Mumbai)
 * 4. Enable Storage in asia-south1
 * 5. Copy your web app config to .env.local (see .env.local.example)
 * 6. For Cloud Functions, run: cd api && npm install
 *
 * EMULATOR USAGE:
 *   firebase emulators:start
 *   Then set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true in .env.local
 *
 * REGION: asia-south1 (Mumbai) for lowest latency to Indian users
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Firebase App ─────────────────────────────────────────────────────────────
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

// ── Auth ─────────────────────────────────────────────────────────────────────
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";

// ── Firestore ────────────────────────────────────────────────────────────────
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";

// ── Storage ──────────────────────────────────────────────────────────────────
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";

// ── Functions ────────────────────────────────────────────────────────────────
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from "firebase/functions";

// ── Analytics (client-only, optional) ────────────────────────────────────────
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from "firebase/analytics";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** All Firebase service instances in a single typed object */
export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
  analytics: Analytics | null;
}

/** Firebase config shape (matches Firebase console → Project settings) */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Firebase config assembled from environment variables.
 *
 * ERROR HANDLING: Every NEXT_PUBLIC_ variable is read from process.env.
 * If a required key is missing, getFirebaseConfig() throws at init time
 * so the error surfaces immediately instead of silently failing later.
 *
 * SECURITY: API keys are safe to expose in client bundles — Firebase
 * security is enforced by Firestore Rules, Storage Rules, and Auth
 * settings, NOT by keeping the API key secret.
 */
function getFirebaseConfig(): FirebaseConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  // ── Guard: detect missing config early ──
  // In demo mode these may be placeholders — that's fine, the mock layer
  // intercepts before any real Firebase call is made.
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoMode && (!apiKey || !projectId || !appId)) {
    throw new Error(
      "[Bandhan Firebase] Missing required environment variables.\n" +
        "Ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID,\n" +
        "and NEXT_PUBLIC_FIREBASE_APP_ID are set in .env.local.\n" +
        "See .env.local.example for the full list."
    );
  }

  return {
    apiKey: apiKey ?? "",
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      `${projectId ?? ""}.firebaseapp.com`,
    projectId: projectId ?? "",
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      `${projectId ?? ""}.appspot.com`,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: appId ?? "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton instances
// ─────────────────────────────────────────────────────────────────────────────

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _functions: Functions | null = null;
let _analytics: Analytics | null = null;
let _emulatorsConnected = false;

// ─────────────────────────────────────────────────────────────────────────────
// Initialisation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise (or return cached) FirebaseApp.
 * Safe to call repeatedly — uses the Firebase singleton guard internally.
 */
function getAppInstance(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  return _app;
}

/**
 * Connect emulators for local development.
 *
 * Call this ONCE after first obtaining service instances.
 * The function is idempotent — repeated calls are no-ops.
 *
 * Emulator ports must match firebase.json → emulators.
 */
function connectEmulators(
  auth: Auth,
  db: Firestore,
  storage: FirebaseStorage,
  functions: Functions,
): void {
  if (_emulatorsConnected) return;

  const host = "127.0.0.1";

  // Auth emulator (port 9099 — see firebase.json)
  connectAuthEmulator(auth, `http://${host}:9099`, {
    disableWarnings: true,
  });

  // Firestore emulator (port 8080)
  connectFirestoreEmulator(db, host, 8080);

  // Storage emulator (port 9199)
  connectStorageEmulator(storage, host, 9199);

  // Functions emulator (port 5001)
  connectFunctionsEmulator(functions, host, 5001);

  _emulatorsConnected = true;

  // eslint-disable-next-line no-console
  console.info(
    "[Bandhan Firebase] Connected to emulators " +
      "(auth:9099, firestore:8080, storage:9199, functions:5001)"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public getters (lazy-initialised singletons)
// ─────────────────────────────────────────────────────────────────────────────

/** Firebase App instance */
export function firebaseApp(): FirebaseApp {
  return getAppInstance();
}

/**
 * Firebase Auth instance.
 *
 * Default persistence is `indexedDB` in the browser which survives
 * page reloads and works well on Indian mobile networks with
 * intermittent connectivity.
 */
export function firebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getAppInstance());
  }
  return _auth;
}

/**
 * Firestore instance.
 *
 * Region is determined at project creation time (asia-south1 recommended).
 * No client-side region config is needed — the SDK connects to the
 * project's default database.
 */
export function firebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getAppInstance());
  }
  return _db;
}

/**
 * Firebase Storage instance.
 *
 * Default bucket: `${projectId}.appspot.com`
 * For a custom bucket, pass its name: `getStorage(app, 'gs://my-bucket')`.
 */
export function firebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getAppInstance());
  }
  return _storage;
}

/**
 * Cloud Functions instance.
 *
 * Region is set to `asia-south1` to co-locate with Firestore and
 * minimise latency for Indian users. When calling a function:
 *
 * ```ts
 * import { httpsCallable } from "firebase/functions";
 * const fn = httpsCallable(firebaseFunctions(), "myFunction");
 * ```
 */
export function firebaseFunctions(): Functions {
  if (!_functions) {
    // asia-south1 = Mumbai — co-located with Firestore
    _functions = getFunctions(getAppInstance(), "asia-south1");
  }
  return _functions;
}

/**
 * Firebase Analytics (client-side only).
 *
 * Returns `null` during SSR or if the browser blocks analytics.
 * Always guard usage: `const a = await firebaseAnalytics(); if (a) { ... }`
 */
export async function firebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (_analytics) return _analytics;

  try {
    const supported = await isAnalyticsSupported();
    if (supported) {
      _analytics = getAnalytics(getAppInstance());
    }
  } catch {
    // Analytics blocked by browser extension or unavailable — non-fatal
    _analytics = null;
  }
  return _analytics;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap (runs once on module load, client-side only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Eagerly initialise all services and (optionally) connect emulators.
 *
 * This runs at import time when the module is first loaded in the
 * browser. In SSR (Node) it is skipped entirely — Firebase client SDK
 * is browser-only.
 */
if (typeof window !== "undefined") {
  try {
    // Touch every getter once so instances are ready when components mount.
    const app = getAppInstance();
    const auth = firebaseAuth();
    const db = firebaseDb();
    const storage = firebaseStorage();
    const functions = firebaseFunctions();

    // Connect to local emulators when the flag is set.
    const useEmulators =
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
    if (useEmulators) {
      connectEmulators(auth, db, storage, functions);
    }
  } catch (error) {
    // Non-fatal: in demo mode Firebase is mocked anyway.
    // eslint-disable-next-line no-console
    console.warn("[Bandhan Firebase] Initialisation skipped:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience: all services in one object (for contexts / providers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns every Firebase service in a single typed object.
 *
 * Useful inside a React context provider:
 * ```tsx
 * const services = getFirebaseServices();
 * ```
 *
 * ERROR HANDLING: This will throw if called during SSR because
 * Firebase client SDK requires a browser environment.
 */
export function getFirebaseServices(): FirebaseServices {
  if (typeof window === "undefined") {
    throw new Error(
      "[Bandhan Firebase] getFirebaseServices() cannot be called during SSR. " +
        "Use individual getters (firebaseAuth(), firebaseDb(), etc.) inside " +
        "useEffect or event handlers."
    );
  }

  return {
    app: firebaseApp(),
    auth: firebaseAuth(),
    db: firebaseDb(),
    storage: firebaseStorage(),
    functions: firebaseFunctions(),
    analytics: _analytics, // may be null until firebaseAnalytics() resolves
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports for convenience
// ─────────────────────────────────────────────────────────────────────────────

export type {
  FirebaseApp,
  Auth,
  Firestore,
  FirebaseStorage,
  Functions,
  Analytics,
};
