/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Notification Center (Comic Book / 8-Bit)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Slide-in panel from right that:
 *   • Displays grouped notifications (real-time via useNotifications hook)
 *   • Tabbed filtering: All | Matches | Messages | Likes
 *   • Mark single / all as read
 *   • Delete individual notifications (swipe-to-dismiss on mobile)
 *   • In-app toast popover for new notifications
 *   • Notification preferences panel (toggle per type + sound)
 *   • Empty state illustration
 *   • Skeleton loading
 *
 * Requires a parent to pass the hook values OR a userId to self-manage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  Users,
  Check,
  Clock,
  Eye,
  Shield,
  Trash2,
  Volume2,
  VolumeX,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { useNotifications, type ToastItem } from "@/hooks/useNotifications";

import type {
  NotificationItem,
  NotificationPreferences,
} from "@/lib/firebase/notifications";

import type { NotificationType } from "@/lib/firebase/schema";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Tab definitions ─────────────────────────────────────────────────────

type TabId = "all" | "match" | "message" | "like";

const TABS: {
  id: TabId;
  label: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  types: NotificationType[];
}[] = [
  { id: "all", label: "All", labelHi: "सभी", icon: Bell, types: [] },
  {
    id: "match",
    label: "Matches",
    labelHi: "मैच",
    icon: Heart,
    types: ["match"],
  },
  {
    id: "message",
    label: "Messages",
    labelHi: "संदेश",
    icon: MessageCircle,
    types: ["message"],
  },
  {
    id: "like",
    label: "Likes",
    labelHi: "लाइक",
    icon: Users,
    types: ["like", "special", "premium"],
  },
];

const TYPE_ICON: Record<
  NotificationType,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  match: Heart,
  message: MessageCircle,
  like: Heart,
  special: Heart,
  premium: Heart,
  visit: Eye,
  verification: Shield,
  reminder: Bell,
  system: Bell,
};

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatTimeAgo(ts: any): string {
  let millis: number;
  if (!ts) return "";
  if (typeof ts === "string") millis = new Date(ts).getTime();
  else if (typeof ts?.toMillis === "function") millis = ts.toMillis();
  else return "";

  const diff = Date.now() - millis;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(millis).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

// ─── Skeleton ────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-4 border-b border-[#E0E0E0]">
      <div className="w-10 h-10 bg-[#E0E0E0] border-2 border-[#E0E0E0] animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 bg-[#E0E0E0] animate-pulse" />
        <div className="h-2.5 w-44 bg-[#E0E0E0] animate-pulse" />
      </div>
      <div className="h-2.5 w-6 bg-[#E0E0E0] animate-pulse flex-shrink-0" />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────

function EmptyNotifications({ language }: { language: "en" | "hi" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-14 h-14 bg-[#F8F8F8] border-2 border-black flex items-center justify-center mb-4">
        <Bell className="w-7 h-7 text-[#E0E0E0]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-bold text-[#9E9E9E] uppercase m-0">
        {language === "en" ? "No Notifications" : "कोई सूचना नहीं"}
      </p>
      <p className="text-xs text-[#9E9E9E] m-0 mt-2 text-center">
        {language === "en" ? "You're all caught up!" : "सब कुछ देख लिया!"}
      </p>
    </div>
  );
}

// ─── Preferences panel ───────────────────────────────────────────────────

const PREF_LABELS: {
  key: keyof Omit<NotificationPreferences, "soundEnabled">;
  label: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { key: "match", label: "New Matches", labelHi: "नए मैच", icon: Heart },
  { key: "message", label: "Messages", labelHi: "संदेश", icon: MessageCircle },
  { key: "like", label: "Likes", labelHi: "लाइक", icon: Heart },
  {
    key: "special",
    label: "Special Interest",
    labelHi: "विशेष रुचि",
    icon: Heart,
  },
  {
    key: "premium",
    label: "Premium Interest",
    labelHi: "प्रीमियम रुचि",
    icon: Heart,
  },
  {
    key: "visit",
    label: "Profile Visits",
    labelHi: "प्रोफ़ाइल विज़िट",
    icon: Eye,
  },
  {
    key: "verification",
    label: "Verification",
    labelHi: "सत्यापन",
    icon: Shield,
  },
  { key: "reminder", label: "Reminders", labelHi: "रिमाइंडर", icon: Bell },
  { key: "system", label: "System", labelHi: "सिस्टम", icon: Bell },
];

function PreferencesPanel({
  preferences,
  onUpdate,
  onBack,
  language,
}: {
  preferences: NotificationPreferences;
  onUpdate: (prefs: Partial<NotificationPreferences>) => void;
  onBack: () => void;
  language: "en" | "hi";
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-black text-white border-b-2 border-black flex-shrink-0">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center bg-white text-black cursor-pointer hover:bg-[#E0E0E0] border-none"
          aria-label="Back"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
        <Settings className="w-4 h-4" strokeWidth={2.5} />
        <span className="text-xs font-bold uppercase tracking-wider">
          {language === "en" ? "Preferences" : "प्राथमिकताएं"}
        </span>
      </div>

      {/* Sound toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b-2 border-black bg-[#F8F8F8]">
        <div className="flex items-center gap-2">
          {preferences.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-black" strokeWidth={2.5} />
          ) : (
            <VolumeX className="w-4 h-4 text-[#9E9E9E]" strokeWidth={2.5} />
          )}
          <span className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            {language === "en" ? "Sound" : "ध्वनि"}
          </span>
        </div>
        <ToggleSwitch
          checked={preferences.soundEnabled}
          onChange={(v) => onUpdate({ soundEnabled: v })}
        />
      </div>

      {/* Type toggles */}
      <div className="flex-1 overflow-y-auto">
        {PREF_LABELS.map(({ key, label, labelHi, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center justify-between px-4 py-3 border-b border-[#E0E0E0]"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-[#424242]" strokeWidth={2} />
              <span className="text-[11px] font-bold text-[#212121] uppercase tracking-wider">
                {language === "en" ? label : labelHi}
              </span>
            </div>
            <ToggleSwitch
              checked={preferences[key]}
              onChange={(v) => onUpdate({ [key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-10 h-5 border-2 border-black cursor-pointer",
        "transition-colors duration-100",
        checked ? "bg-black" : "bg-[#E0E0E0]",
      )}
    >
      <motion.div
        className={cn(
          "absolute top-0 w-4 h-full",
          checked ? "bg-white" : "bg-white border-r-2 border-black",
        )}
        animate={{ left: checked ? 18 : 0 }}
        transition={{ duration: 0.15 }}
      />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CENTER PROPS
// ═══════════════════════════════════════════════════════════════════════════

export interface NotificationCenterProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close the panel */
  onClose: () => void;
  /** Current user ID — used to initialise the useNotifications hook */
  userId: string;
  /** UI language */
  language?: "en" | "hi";
  /** Callback when a notification is clicked (for navigation) */
  onNotificationClick?: (item: NotificationItem) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CENTER
// ═══════════════════════════════════════════════════════════════════════════

export function NotificationCenter({
  isOpen,
  onClose,
  userId,
  language = "en",
  onNotificationClick,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    remove,
    preferences,
    updatePreferences,
  } = useNotifications(userId);

  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [showPrefs, setShowPrefs] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Reset tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab("all");
      setShowPrefs(false);
    }
  }, [isOpen]);

  // Filter by tab
  const tabDef = TABS.find((t) => t.id === activeTab)!;
  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => tabDef.types.includes(n.data.type));

  const handleClick = useCallback(
    (item: NotificationItem) => {
      if (!item.data.isRead) {
        markAsRead(item.id);
      }
      onNotificationClick?.(item);
    },
    [markAsRead, onNotificationClick],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[90]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[360px] z-[95] bg-white border-l-4 border-black shadow-[-8px_0_0px_#000000] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            {showPrefs ? (
              <PreferencesPanel
                preferences={preferences}
                onUpdate={updatePreferences}
                onBack={() => setShowPrefs(false)}
                language={language}
              />
            ) : (
              <>
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 py-3 bg-black text-white border-b-2 border-black flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {language === "en" ? "Notifications" : "सूचनाएं"}
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-white text-black text-[8px] font-bold border-2 border-white leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="bg-transparent border-none cursor-pointer hover:opacity-70 p-0"
                        title="Mark all as read"
                        aria-label="Mark all as read"
                      >
                        <Check
                          className="w-4 h-4 text-[#9E9E9E]"
                          strokeWidth={2.5}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => setShowPrefs(true)}
                      className="bg-transparent border-none cursor-pointer hover:opacity-70 p-0"
                      title="Notification preferences"
                      aria-label="Notification preferences"
                    >
                      <Settings
                        className="w-4 h-4 text-[#9E9E9E]"
                        strokeWidth={2.5}
                      />
                    </button>
                    <button
                      onClick={onClose}
                      className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer hover:bg-[#E0E0E0] border-none"
                      aria-label="Close notifications"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex border-b-2 border-black flex-shrink-0">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1 px-2 py-3",
                          "text-[10px] font-bold uppercase tracking-wider",
                          "border-none cursor-pointer",
                          isActive
                            ? "bg-white text-black border-b-[3px] border-b-black"
                            : "bg-[#F8F8F8] text-[#9E9E9E] hover:text-[#424242]",
                        )}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className="hidden sm:inline">
                          {language === "en" ? tab.label : tab.labelHi}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Notification List ── */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading && (
                    <>
                      <NotificationSkeleton />
                      <NotificationSkeleton />
                      <NotificationSkeleton />
                    </>
                  )}

                  {!isLoading && filtered.length === 0 && (
                    <EmptyNotifications language={language} />
                  )}

                  {!isLoading && (
                    <div>
                      {filtered.map((item, i) => {
                        const Icon = TYPE_ICON[item.data.type] ?? Bell;
                        const isGrouped = (item.data.groupCount ?? 1) > 1;
                        const initials = item.data.data?.senderName
                          ? item.data.data.senderName[0].toUpperCase()
                          : null;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ delay: i * 0.025 }}
                            layout
                          >
                            <button
                              onClick={() => handleClick(item)}
                              className={cn(
                                "w-full flex items-start gap-3 px-4 py-4 text-left",
                                "border-b border-[#E0E0E0] cursor-pointer",
                                "bg-transparent border-x-0 border-t-0",
                                !item.data.isRead
                                  ? "bg-[#F8F8F8]"
                                  : "hover:bg-[#F8F8F8]",
                              )}
                            >
                              {/* Avatar / Icon */}
                              <div className="flex-shrink-0 relative">
                                {initials ? (
                                  <div className="w-10 h-10 bg-[#E0E0E0] border-2 border-black flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-black">
                                      {initials}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-[#F8F8F8] border-2 border-black flex items-center justify-center">
                                    <Icon
                                      className="w-5 h-5 text-[#424242]"
                                      strokeWidth={2}
                                    />
                                  </div>
                                )}
                                {/* Unread dot */}
                                {!item.data.isRead && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-black border-2 border-white" />
                                )}
                                {/* Group count badge */}
                                {isGrouped && (
                                  <div className="absolute -bottom-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-black text-white text-[7px] font-bold flex items-center justify-center border border-white">
                                    {item.data.groupCount}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "text-xs uppercase m-0 leading-tight",
                                    !item.data.isRead
                                      ? "font-bold text-black"
                                      : "font-semibold text-[#424242]",
                                  )}
                                >
                                  {language === "en"
                                    ? item.data.title
                                    : (item.data.titleHi ?? item.data.title)}
                                </p>
                                <p className="text-xs text-[#9E9E9E] m-0 mt-1 truncate leading-normal">
                                  {language === "en"
                                    ? item.data.message
                                    : (item.data.messageHi ??
                                      item.data.message)}
                                </p>
                              </div>

                              {/* Time + delete */}
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className="text-[10px] text-[#9E9E9E] font-bold flex items-center gap-0.5 leading-none">
                                  <Clock
                                    className="w-2.5 h-2.5"
                                    strokeWidth={2}
                                  />
                                  {formatTimeAgo(item.data.createdAt)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    remove(item.id);
                                  }}
                                  className="bg-transparent border-none cursor-pointer p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                                  aria-label="Delete notification"
                                  tabIndex={-1}
                                >
                                  <Trash2
                                    className="w-3 h-3 text-[#9E9E9E] hover:text-black"
                                    strokeWidth={2}
                                  />
                                </button>
                              </div>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Footer ── */}
                <div className="flex-shrink-0 px-4 py-3 border-t-2 border-black bg-[#F8F8F8]">
                  <button
                    onClick={() => setShowPrefs(true)}
                    className="w-full py-2 text-xs font-bold uppercase text-[#9E9E9E] bg-transparent border-2 border-dashed border-[#9E9E9E] cursor-pointer hover:border-black hover:text-black transition-colors"
                  >
                    {language === "en"
                      ? "Notification Preferences"
                      : "सूचना प्राथमिकताएं"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// IN-APP TOAST
// ═══════════════════════════════════════════════════════════════════════════

export interface NotificationToastProps {
  /** Toast queue from useNotifications */
  toasts: ToastItem[];
  /** Dismiss a toast by ID */
  onDismiss: (id: string) => void;
  /** Click handler for navigation */
  onClick?: (toast: ToastItem) => void;
}

/**
 * Renders a stack of toast notifications at the top of the screen.
 * Shows max 3 visible toasts; older ones are hidden below.
 */
export function NotificationToast({
  toasts,
  onDismiss,
  onClick,
}: NotificationToastProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[320px]">
      <AnimatePresence>
        {toasts.slice(0, 3).map((toast) => {
          const Icon = TYPE_ICON[toast.type] ?? Bell;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "flex items-start gap-3 p-3",
                "bg-white border-[3px] border-black",
                "shadow-[4px_4px_0px_#000000]",
                "cursor-pointer",
              )}
              onClick={() => {
                onClick?.(toast);
                onDismiss(toast.id);
              }}
              role="alert"
              aria-live="polite"
            >
              <div className="w-8 h-8 bg-[#F8F8F8] border-2 border-black flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-black uppercase tracking-wider m-0 leading-tight">
                  {toast.title}
                </p>
                <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5 truncate leading-normal">
                  {toast.body}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(toast.id);
                }}
                className="bg-transparent border-none cursor-pointer p-0 flex-shrink-0"
                aria-label="Dismiss"
              >
                <X
                  className="w-3.5 h-3.5 text-[#9E9E9E] hover:text-black"
                  strokeWidth={2.5}
                />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
