/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — PWA Utilities (ZERO cost)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Install prompt management, push notification subscription,
 * background sync registration, and install analytics.
 *
 * ALL FREE:
 *   - Install tracking → localStorage (no analytics service)
 *   - Push notifications → Firebase Cloud Messaging (free tier)
 *   - Background sync → native Background Sync API
 *   - Offline detection → navigator.onLine + events
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface InstallState {
  /** Whether the browser's install prompt is available */
  canInstall: boolean;
  /** Whether the app is already installed (standalone mode) */
  isInstalled: boolean;
  /** Whether the user dismissed the install prompt */
  isDismissed: boolean;
  /** Whether we're on iOS (needs special instructions) */
  isIOS: boolean;
  /** Platform: android, ios, desktop, unknown */
  platform: "android" | "ios" | "desktop" | "unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INSTALL_DISMISSED_KEY = "bandhan_install_dismissed";
const INSTALL_DISMISSED_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const INSTALL_ANALYTICS_KEY = "bandhan_install_events";

// ─────────────────────────────────────────────────────────────────────────────
// 1. PLATFORM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/** Detect if running as installed PWA (standalone mode). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true || // iOS Safari
    document.referrer.includes("android-app://")
  );
}

/** Detect iOS (iPhone/iPad). */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/** Detect Android. */
export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

/** Get the platform category. */
export function getPlatform(): InstallState["platform"] {
  if (isIOS()) return "ios";
  if (isAndroid()) return "android";
  if (typeof window !== "undefined" && window.innerWidth > 1024) return "desktop";
  return "unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. INSTALL PROMPT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

let _deferredPrompt: any = null;

/**
 * Initialize the beforeinstallprompt listener.
 * Call this ONCE on app mount. Returns a cleanup function.
 *
 * The browser fires beforeinstallprompt when the PWA is eligible for install.
 * We capture the event so we can trigger it later from our custom UI.
 */
export function initInstallPrompt(
  onPromptAvailable?: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    e.preventDefault(); // Prevent the browser's mini-infobar
    _deferredPrompt = e;
    onPromptAvailable?.();
    trackInstallEvent("prompt_available");
  };

  window.addEventListener("beforeinstallprompt", handler);

  // Track actual install (appinstalled event)
  const installedHandler = () => {
    _deferredPrompt = null;
    trackInstallEvent("installed");
  };
  window.addEventListener("appinstalled", installedHandler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
    window.removeEventListener("appinstalled", installedHandler);
  };
}

/**
 * Trigger the native install prompt.
 * Returns true if the user accepted, false if dismissed.
 */
export async function triggerInstallPrompt(): Promise<boolean> {
  if (!_deferredPrompt) return false;

  trackInstallEvent("prompt_shown");

  try {
    _deferredPrompt.prompt();
    const { outcome } = await _deferredPrompt.userChoice;
    _deferredPrompt = null;

    if (outcome === "accepted") {
      trackInstallEvent("accepted");
      return true;
    } else {
      trackInstallEvent("dismissed");
      setInstallDismissed();
      return false;
    }
  } catch {
    return false;
  }
}

/** Check if the native install prompt is available. */
export function canShowInstallPrompt(): boolean {
  return _deferredPrompt !== null;
}

/** Check if user recently dismissed the install prompt. */
export function isInstallDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    const raw = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (!raw) return false;
    const timestamp = parseInt(raw, 10);
    if (Date.now() - timestamp > INSTALL_DISMISSED_TTL) {
      localStorage.removeItem(INSTALL_DISMISSED_KEY); // Expired, show again
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Mark the install prompt as dismissed. */
export function setInstallDismissed(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
  } catch {
    // Storage full or private browsing — silently fail
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. INSTALL ANALYTICS (ZERO cost — localStorage only)
// ─────────────────────────────────────────────────────────────────────────────

interface InstallEvent {
  event: string;
  timestamp: number;
  platform: string;
  standalone: boolean;
}

/** Track an install-related event to localStorage. */
function trackInstallEvent(event: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    const events: InstallEvent[] = JSON.parse(
      localStorage.getItem(INSTALL_ANALYTICS_KEY) || "[]",
    );
    events.push({
      event,
      timestamp: Date.now(),
      platform: getPlatform(),
      standalone: isStandalone(),
    });
    // Keep last 50 events
    localStorage.setItem(
      INSTALL_ANALYTICS_KEY,
      JSON.stringify(events.slice(-50)),
    );
  } catch {
    // Silently fail
  }
}

/** Get all install analytics events (for debugging). */
export function getInstallAnalytics(): InstallEvent[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(INSTALL_ANALYTICS_KEY) || "[]");
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PUSH NOTIFICATIONS (Firebase Cloud Messaging — free tier)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Request notification permission and get FCM token.
 * Returns the token string, or null if permission denied.
 *
 * PREREQUISITES:
 *   - public/firebase-messaging-sw.js must exist
 *   - NEXT_PUBLIC_FIREBASE_VAPID_KEY must be set
 */
export async function requestPushPermission(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) return null;

  // Already denied — can't ask again
  if (Notification.permission === "denied") return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // Lazy-import Firebase Messaging to avoid loading it for users who don't want push
    const { getMessaging, getToken } = await import("firebase/messaging");
    const { firebaseApp } = await import("@/lib/firebase/config");

    const messaging = getMessaging(firebaseApp());
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.warn("[PWA] NEXT_PUBLIC_FIREBASE_VAPID_KEY not set — push notifications disabled");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(
        "/firebase-messaging-sw.js",
      ),
    });

    return token || null;
  } catch (err) {
    console.error("[PWA] Failed to get push token:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BACKGROUND SYNC (for offline messages)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a background sync tag.
 * When the device goes back online, the service worker's "sync" event fires.
 *
 * @param tag - Sync tag name (e.g., "sync-messages", "sync-likes")
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    if ("sync" in registration) {
      await (registration as any).sync.register(tag);
      return true;
    }
  } catch (err) {
    console.warn("[PWA] Background sync not supported:", err);
  }
  return false;
}

/**
 * Queue a message for background sync.
 * Stores in IndexedDB so the service worker can access it when back online.
 */
export async function queueOfflineMessage(
  matchId: string,
  content: string,
  type: "text" | "voice" | "photo" = "text",
): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("bandhan-offline", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("pending-messages")) {
        db.createObjectStore("pending-messages", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("pending-messages", "readwrite");
      const store = tx.objectStore("pending-messages");
      store.add({
        matchId,
        content,
        type,
        timestamp: Date.now(),
        synced: false,
      });
      tx.oncomplete = () => {
        resolve();
        // Request background sync
        registerBackgroundSync("sync-messages");
      };
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ONLINE/OFFLINE STATUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to online/offline status changes.
 * Returns an unsubscribe function.
 */
export function onConnectivityChange(
  callback: (isOnline: boolean) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const onlineHandler = () => callback(true);
  const offlineHandler = () => callback(false);

  window.addEventListener("online", onlineHandler);
  window.addEventListener("offline", offlineHandler);

  return () => {
    window.removeEventListener("online", onlineHandler);
    window.removeEventListener("offline", offlineHandler);
  };
}

/** Get current online status. */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
