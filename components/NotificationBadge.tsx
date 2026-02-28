/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Notification Badge (Comic Book / 8-Bit)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Small unread-count badge that sits on top of a bell icon / nav item.
 *
 * Two variants:
 *   • Dot   — simple black square (when count is unknown or zero visual)
 *   • Count — black square with white number
 *
 * Animates on count change (pixel-bounce). Uses 8px grid, hard shadows.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface NotificationBadgeProps {
  /** Unread count (0 = hidden) */
  count: number;
  /** Click handler (open NotificationCenter) */
  onClick?: () => void;
  /** Show bell icon inside the button (default true) */
  showIcon?: boolean;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Accessible label override */
  ariaLabel?: string;
}

// ─── Standalone dot badge (no button) ────────────────────────────────────

export interface BadgeDotProps {
  count: number;
  className?: string;
}

/**
 * Tiny standalone badge — use this when you need to overlay a count
 * on a custom element (e.g. a nav tab icon).
 *
 * ```tsx
 * <div className="relative">
 *   <Heart />
 *   <BadgeDot count={3} className="absolute -top-1 -right-1" />
 * </div>
 * ```
 */
export function BadgeDot({ count, className }: BadgeDotProps) {
  if (count <= 0) return null;

  return (
    <AnimatePresence>
      <motion.span
        key={count}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className={cn(
          "inline-flex items-center justify-center",
          "min-w-[16px] h-4 px-0.5",
          "bg-black text-white",
          "text-[8px] font-bold leading-none",
          "border-2 border-white",
          className,
        )}
        aria-label={`${count} unread`}
      >
        {count > 99 ? "99+" : count}
      </motion.span>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function NotificationBadge({
  count,
  onClick,
  showIcon = true,
  className,
  size = "md",
  ariaLabel,
}: NotificationBadgeProps) {
  const prevCountRef = useRef(count);
  const isNew = count > prevCountRef.current;

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  const sizeClasses =
    size === "sm"
      ? "w-8 h-8"
      : "w-10 h-10";

  const iconSize =
    size === "sm"
      ? "w-4 h-4"
      : "w-5 h-5";

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses,
        "border-2 border-black bg-white cursor-pointer",
        "shadow-[2px_2px_0px_#000000]",
        "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
        "transition-all duration-100",
        className,
      )}
      aria-label={ariaLabel ?? `Notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      {showIcon && (
        <Bell className={cn(iconSize, "text-[#424242]")} strokeWidth={2.5} />
      )}

      {/* Badge */}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0, y: 4 }}
            animate={{
              scale: 1,
              y: 0,
              ...(isNew
                ? {
                    // Pixel-bounce on new notification
                    y: [0, -3, 0, -1, 0],
                    transition: {
                      y: { duration: 0.3, times: [0, 0.3, 0.5, 0.7, 1] },
                    },
                  }
                : {}),
            }}
            exit={{ scale: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className={cn(
              "absolute flex items-center justify-center",
              size === "sm"
                ? "-top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 text-[7px]"
                : "-top-1.5 -right-1.5 min-w-[18px] h-[18px] px-0.5 text-[9px]",
              "bg-black text-white font-bold leading-none",
              "border-2 border-white",
            )}
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default NotificationBadge;
