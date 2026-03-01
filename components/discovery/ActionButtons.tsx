/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Discovery Action Buttons (Fixed Bottom Bar)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Floating action bar at the bottom of the discovery feed.
 * Three buttons: ✖️ Pass · 💬 Appreciate · ❤️ Like
 *
 * Comic-book aesthetic:
 *   • White background with 2px black top border
 *   • Large 48px touch targets, thick 3px button borders
 *   • Hard 8-bit shadows, pixel-shift on press
 *   • Sits above the BottomNav (bottom: 80px on mobile)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { Heart, X, MessageCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionButtonsProps {
  /** Called when user taps "Pass" (✖️) */
  onPass?: () => void;
  /** Called when user taps "Appreciate" (💬) */
  onAppreciate?: () => void;
  /** Called when user taps "Like" (❤️) */
  onLike?: () => void;
  /** Disable all buttons (e.g. no more profiles) */
  disabled?: boolean;
  /** Are we at the daily limit? */
  limitReached?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Haptic
// ─────────────────────────────────────────────────────────────────────────────

function haptic(ms = 15) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ActionButtons({
  onPass,
  onAppreciate,
  onLike,
  disabled = false,
  limitReached = false,
  className,
}: ActionButtonsProps) {
  return (
    <div
      className={cn(
        // Fixed above BottomNav
        "fixed left-0 right-0 z-40",
        "bottom-[72px] lg:bottom-4",
        // Centering
        "flex justify-center",
        "px-4",
        className,
      )}
      role="group"
      aria-label="Profile actions"
    >
      <div
        className={cn(
          "flex items-center gap-3",
          "bg-white border-[2px] border-black",
          "shadow-[4px_4px_0px_#000000]",
          "px-5 py-3",
        )}
      >
        {/* ── Pass ── */}
        <button
          onClick={() => {
            if (disabled) return;
            haptic(10);
            onPass?.();
          }}
          disabled={disabled}
          aria-label="Pass on this profile"
          className={cn(
            "flex items-center justify-center",
            "w-12 h-12 min-w-[48px] min-h-[48px]",
            "border-[3px] border-black bg-white",
            "shadow-[3px_3px_0px_#000000]",
            "transition-all duration-100",
            disabled
              ? "opacity-40 cursor-not-allowed"
              : [
                  "cursor-pointer",
                  "hover:bg-[#F8F8F8]",
                  "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]",
                  "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                ],
          )}
        >
          <X className="w-6 h-6 text-black" strokeWidth={2.5} />
        </button>

        {/* ── Appreciate ── */}
        <button
          onClick={() => {
            if (disabled) return;
            haptic(12);
            onAppreciate?.();
          }}
          disabled={disabled}
          aria-label="Appreciate this profile"
          className={cn(
            "flex items-center justify-center",
            "w-10 h-10 min-w-[40px] min-h-[40px]",
            "border-[2px] border-black bg-[#F8F8F8]",
            "shadow-[2px_2px_0px_#000000]",
            "transition-all duration-100",
            disabled
              ? "opacity-40 cursor-not-allowed"
              : [
                  "cursor-pointer",
                  "hover:bg-[#E0E0E0]",
                  "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                ],
          )}
        >
          <MessageCircle className="w-5 h-5 text-[#424242]" strokeWidth={2} />
        </button>

        {/* ── Like ── */}
        <button
          onClick={() => {
            if (disabled || limitReached) return;
            haptic(20);
            onLike?.();
          }}
          disabled={disabled || limitReached}
          aria-label={limitReached ? "Daily limit reached" : "Like this profile"}
          className={cn(
            "flex items-center justify-center",
            "w-12 h-12 min-w-[48px] min-h-[48px]",
            "border-[3px] border-black",
            "shadow-[3px_3px_0px_#000000]",
            "transition-all duration-100",
            disabled || limitReached
              ? "bg-[#E0E0E0] opacity-40 cursor-not-allowed"
              : [
                  "bg-black text-white cursor-pointer",
                  "hover:bg-[#424242]",
                  "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]",
                  "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                ],
          )}
        >
          <Heart
            className={cn(
              "w-6 h-6",
              disabled || limitReached ? "text-[#9E9E9E]" : "text-white",
            )}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}

export default ActionButtons;
