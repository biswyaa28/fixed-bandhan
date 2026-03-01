/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — User Warning Banner
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Shown to users who have active strikes or restrictions.
 * Displays the warning/restriction message with appeal link.
 * Auto-dismisses after the restriction period ends.
 *
 * Comic book aesthetic: thick borders, monochromatic, hard shadows.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Shield, Ban, Clock, ExternalLink } from "lucide-react";
import {
  type EnforcementAction,
  getEnforcementMessage,
} from "@/lib/moderation/report-handler";

// ─── Types ───────────────────────────────────────────────────────────────

interface UserWarningBannerProps {
  /** The enforcement action applied to this user */
  action: EnforcementAction;
  /** When the restriction ends (ISO string, null for permanent) */
  restrictedUntil: string | null;
  /** Active strike count */
  strikeCount: number;
  /** Whether the user has an active appeal */
  hasActiveAppeal: boolean;
  /** Callback when user taps "Appeal" */
  onAppeal?: () => void;
  /** Callback when banner is dismissed (only for warnings) */
  onDismiss?: () => void;
  /** Language */
  language?: "en" | "hi";
}

// ─── Component ───────────────────────────────────────────────────────────

export function UserWarningBanner({
  action,
  restrictedUntil,
  strikeCount,
  hasActiveAppeal,
  onAppeal,
  onDismiss,
  language = "en",
}: UserWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  const t = language === "hi";
  const msg = getEnforcementMessage(action, language);

  // ── Countdown timer for temporary restrictions ──
  useEffect(() => {
    if (!restrictedUntil) return;

    const update = () => {
      const now = Date.now();
      const end = new Date(restrictedUntil).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining("");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(
        t ? `${hours} घंटे ${minutes} मिनट शेष` : `${hours}h ${minutes}m remaining`,
      );
    };

    update();
    const interval = setInterval(update, 60_000); // Update every minute
    return () => clearInterval(interval);
  }, [restrictedUntil, t]);

  // Don't render if no action or already dismissed
  if (action === "none" || dismissed) return null;

  // If restriction has expired, don't show
  if (restrictedUntil && new Date(restrictedUntil).getTime() < Date.now()) {
    return null;
  }

  const canDismiss = action === "warn" || action === "content_removed";
  const showAppeal =
    !hasActiveAppeal &&
    (action === "restrict_48h" ||
      action === "suspend_7d" ||
      action === "suspend_30d" ||
      action === "permanent_ban");

  const iconMap: Record<string, typeof AlertTriangle> = {
    warn: AlertTriangle,
    content_removed: AlertTriangle,
    restrict_48h: Clock,
    suspend_7d: Shield,
    suspend_30d: Shield,
    permanent_ban: Ban,
  };
  const Icon = iconMap[action] || AlertTriangle;

  const bgColor =
    action === "permanent_ban"
      ? "bg-black text-white"
      : action === "restrict_48h" || action === "suspend_7d" || action === "suspend_30d"
        ? "bg-[#212121] text-white"
        : "bg-[#F8F8F8] text-black";

  const borderStyle = action === "permanent_ban" ? "border-white" : "border-black";

  return (
    <div
      className={`border-[3px] ${borderStyle} shadow-[4px_4px_0px_${action === "permanent_ban" ? "#424242" : "#000"}] ${bgColor} p-4`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 border-[2px] ${borderStyle} p-1.5`}>
          <Icon size={18} strokeWidth={3} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider">{msg.title}</h3>
            {canDismiss && (
              <button
                onClick={() => {
                  setDismissed(true);
                  onDismiss?.();
                }}
                className="p-0.5 transition-opacity hover:opacity-70"
                aria-label={t ? "बंद करें" : "Dismiss"}
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>

          <p className="text-[11px] leading-relaxed opacity-80">{msg.body}</p>

          {/* Strike counter */}
          {strikeCount > 0 && strikeCount < 3 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 border-[2px] ${borderStyle} ${
                      i <= strikeCount
                        ? action === "permanent_ban"
                          ? "bg-white"
                          : "bg-black"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                {t ? `${strikeCount}/3 चेतावनियाँ` : `${strikeCount}/3 strikes`}
              </span>
            </div>
          )}

          {/* Time remaining */}
          {timeRemaining && (
            <div className="mt-2 flex items-center gap-1.5">
              <Clock size={12} strokeWidth={3} />
              <span className="text-[10px] font-bold">{timeRemaining}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            {showAppeal && (
              <button
                onClick={onAppeal}
                className={`flex items-center gap-1.5 border-[2px] ${borderStyle} px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  action === "permanent_ban"
                    ? "hover:bg-white hover:text-black"
                    : "hover:bg-black hover:text-white"
                } transition-colors`}
              >
                <ExternalLink size={10} strokeWidth={3} />
                {t ? "अपील करें" : "Appeal"}
              </button>
            )}

            {hasActiveAppeal && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                <Clock size={10} strokeWidth={3} />
                {t ? "अपील की समीक्षा हो रही है" : "Appeal under review"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserWarningBanner;
