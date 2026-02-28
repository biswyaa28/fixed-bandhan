/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — useNotifications Hook
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Real-time notification hook that:
 *   • Subscribes to Firestore onSnapshot for the user's notifications
 *   • Maintains a real-time unread count
 *   • Groups notifications by type (e.g. "3 people liked your profile")
 *   • Shows in-app toast for new notifications (via a queue)
 *   • Plays notification sound (respects user preference)
 *   • Provides mark-read / mark-all / delete actions
 *   • Manages notification preferences
 *   • Registers push token on mount (once)
 *   • Cleans up ALL listeners on unmount
 *
 * Usage:
 *   const {
 *     notifications, unreadCount, isLoading, toastQueue,
 *     markAsRead, markAllRead, remove, dismissToast,
 *     preferences, updatePreferences,
 *   } = useNotifications(userId);
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  onNewNotifications,
  onUnreadCount,
  onForegroundMessage,
  markNotificationAsRead,
  markAllAsRead as serviceMarkAll,
  deleteNotification,
  groupNotifications,
  requestPushPermission,
  getNotificationPreferences,
  setNotificationPreferences,
  isNotificationTypeEnabled,
  type NotificationItem,
  type NotificationPreferences,
} from "@/lib/firebase/notifications";

import type { NotificationType } from "@/lib/firebase/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  /** Timestamp the toast was enqueued (for auto-dismiss) */
  enqueuedAt: number;
}

export interface UseNotificationsReturn {
  /** Grouped notification list (newest first) */
  notifications: NotificationItem[];
  /** Raw (ungrouped) notification list */
  rawNotifications: NotificationItem[];
  /** Real-time unread count for badge */
  unreadCount: number;
  /** True during initial load */
  isLoading: boolean;
  /** Toast queue — show the first item, dismiss to dequeue */
  toastQueue: ToastItem[];

  // ── Actions ──
  markAsRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (notificationId: string) => Promise<void>;
  dismissToast: (toastId: string) => void;

  // ── Preferences ──
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Auto-dismiss toasts after this many milliseconds */
const TOAST_TTL_MS = 6_000;
/** Max toasts in queue at once */
const MAX_TOAST_QUEUE = 5;
/** Notification sound file path */
const NOTIFICATION_SOUND_URL = "/sounds/notification.mp3";

// ─────────────────────────────────────────────────────────────────────────────
// Sound helper
// ─────────────────────────────────────────────────────────────────────────────

let _audioCache: HTMLAudioElement | null = null;

function playNotificationSound(): void {
  try {
    if (!_audioCache) {
      _audioCache = new Audio(NOTIFICATION_SOUND_URL);
      _audioCache.volume = 0.5;
    }
    _audioCache.currentTime = 0;
    _audioCache.play().catch(() => {
      // Browser may block autoplay — non-fatal
    });
  } catch {
    // Audio API unavailable — non-fatal
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useNotifications(
  userId: string | null | undefined,
): UseNotificationsReturn {
  const [raw, setRaw] = useState<NotificationItem[]>([]);
  const [grouped, setGrouped] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toastQueue, setToastQueue] = useState<ToastItem[]>([]);
  const [preferences, setPrefs] = useState<NotificationPreferences>(
    () => {
      if (userId) return getNotificationPreferences(userId);
      return getNotificationPreferences("");
    },
  );

  // Track previous notification IDs so we can detect genuinely new ones
  const prevIdsRef = useRef<Set<string>>(new Set());
  // Flag to skip toast on initial load
  const initialLoadRef = useRef(true);

  // ── Sync preferences when userId changes ──
  useEffect(() => {
    if (userId) {
      setPrefs(getNotificationPreferences(userId));
    }
  }, [userId]);

  // ── Main notification listener ──
  useEffect(() => {
    if (!userId) {
      setRaw([]);
      setGrouped([]);
      setIsLoading(false);
      return;
    }

    const unsub = onNewNotifications(userId, (items) => {
      setRaw(items);
      setGrouped(groupNotifications(items));
      setIsLoading(false);

      // ── Detect new notifications for toast ──
      if (initialLoadRef.current) {
        // First snapshot — just record IDs, don't toast
        prevIdsRef.current = new Set(items.map((i) => i.id));
        initialLoadRef.current = false;
        return;
      }

      const prevIds = prevIdsRef.current;
      const newItems = items.filter(
        (i) => !prevIds.has(i.id) && !i.data.isRead,
      );
      prevIdsRef.current = new Set(items.map((i) => i.id));

      if (newItems.length === 0) return;

      // Enqueue toasts for new items (respecting preferences)
      const currentPrefs = getNotificationPreferences(userId);

      const newToasts: ToastItem[] = newItems
        .filter((item) =>
          isNotificationTypeEnabled(userId, item.data.type),
        )
        .slice(0, MAX_TOAST_QUEUE)
        .map((item) => ({
          id: item.id,
          title: item.data.title,
          body: item.data.message,
          type: item.data.type,
          enqueuedAt: Date.now(),
        }));

      if (newToasts.length > 0) {
        setToastQueue((prev) =>
          [...newToasts, ...prev].slice(0, MAX_TOAST_QUEUE),
        );

        // Play sound if enabled
        if (currentPrefs.soundEnabled) {
          playNotificationSound();
        }
      }
    });

    return () => {
      unsub();
      initialLoadRef.current = true;
    };
  }, [userId]);

  // ── Unread count listener ──
  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const unsub = onUnreadCount(userId, (count) => {
      setUnreadCount(count);
    });

    return unsub;
  }, [userId]);

  // ── FCM foreground message listener ──
  useEffect(() => {
    if (!userId) return;

    let unsub: (() => void) | null = null;

    onForegroundMessage((payload) => {
      // Foreground FCM messages — show as toast
      const prefs = getNotificationPreferences(userId);
      const toast: ToastItem = {
        id: `fcm_${Date.now()}`,
        title: payload.title,
        body: payload.body,
        type: (payload.data?.type as NotificationType) ?? "system",
        enqueuedAt: Date.now(),
      };

      setToastQueue((prev) => [toast, ...prev].slice(0, MAX_TOAST_QUEUE));

      if (prefs.soundEnabled) {
        playNotificationSound();
      }
    }).then((u) => {
      unsub = u ?? null;
    });

    return () => {
      unsub?.();
    };
  }, [userId]);

  // ── Register push token once ──
  useEffect(() => {
    if (!userId) return;
    // Fire and forget — don't block rendering
    requestPushPermission(userId).catch(() => {});
  }, [userId]);

  // ── Auto-dismiss toasts ──
  useEffect(() => {
    if (toastQueue.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setToastQueue((prev) =>
        prev.filter((t) => now - t.enqueuedAt < TOAST_TTL_MS),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [toastQueue.length]);

  // ── Actions ──

  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      setRaw((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, data: { ...n.data, isRead: true } }
            : n,
        ),
      );
      try {
        await markNotificationAsRead(notificationId);
      } catch {
        // Revert would go here, but read-marking is best-effort
      }
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    // Optimistic
    setRaw((prev) =>
      prev.map((n) => ({ ...n, data: { ...n.data, isRead: true } })),
    );
    try {
      await serviceMarkAll(userId);
    } catch {
      // best-effort
    }
  }, [userId]);

  const remove = useCallback(async (notificationId: string) => {
    // Optimistic
    setRaw((prev) => prev.filter((n) => n.id !== notificationId));
    try {
      await deleteNotification(notificationId);
    } catch {
      // best-effort
    }
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setToastQueue((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const updatePreferences = useCallback(
    (prefs: Partial<NotificationPreferences>) => {
      if (!userId) return;
      setNotificationPreferences(userId, prefs);
      setPrefs((prev) => ({ ...prev, ...prefs }));
    },
    [userId],
  );

  // Re-group whenever raw changes
  useEffect(() => {
    setGrouped(groupNotifications(raw));
  }, [raw]);

  return {
    notifications: grouped,
    rawNotifications: raw,
    unreadCount,
    isLoading,
    toastQueue,
    markAsRead,
    markAllRead,
    remove,
    dismissToast,
    preferences,
    updatePreferences,
  };
}

export default useNotifications;
