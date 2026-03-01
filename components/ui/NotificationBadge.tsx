/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Notification Badge (Red Dot / Count)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Renders a red notification indicator on any element.
 *
 * Variants:
 *   • dot    → simple red dot (no number), 8×8px
 *   • count  → red square with white number, min 16×16px
 *
 * Usage:
 *   <NotificationBadge count={3}>
 *     <BellIcon />
 *   </NotificationBadge>
 *
 * Comic-book aesthetic: square shape, 2px black border, no rounded corners.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface NotificationBadgeProps {
  /** Number to display. 0 or undefined = hidden. Capped at 99+. */
  count?: number;
  /** Force show as a simple dot regardless of count */
  dot?: boolean;
  /** Position offset. Default: top-right */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Badge size */
  size?: "sm" | "md";
  /** Pulse animation on the dot/badge */
  pulse?: boolean;
  /** Child element the badge is attached to */
  children: ReactNode;
  className?: string;
}

// ─── Position Map ────────────────────────────────────────────────────────

const POSITION_MAP = {
  "top-right": "-top-1 -right-1",
  "top-left": "-top-1 -left-1",
  "bottom-right": "-bottom-1 -right-1",
  "bottom-left": "-bottom-1 -left-1",
} as const;

// ─── Component ───────────────────────────────────────────────────────────

export function NotificationBadge({
  count,
  dot = false,
  position = "top-right",
  size = "sm",
  pulse = false,
  children,
  className,
}: NotificationBadgeProps) {
  const hasCount = typeof count === "number" && count > 0;
  const showDot = dot || hasCount;
  const displayText = hasCount ? (count > 99 ? "99+" : String(count)) : "";
  const isDotOnly = dot || !hasCount;

  // Size config
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const countSize =
    size === "sm"
      ? "min-w-[14px] h-[14px] px-[3px] text-[7px]"
      : "min-w-[16px] h-4 px-1 text-[8px]";

  if (!showDot) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      {children}

      {/* Badge */}
      <span
        className={cn(
          "absolute z-10",
          "flex items-center justify-center",
          "bg-[#EF476F] border-[2px] border-black",
          "font-heading font-bold text-white leading-none select-none",
          POSITION_MAP[position],
          isDotOnly ? dotSize : countSize,
          pulse && "animate-heartbeat",
        )}
        aria-label={hasCount ? `${count} notifications` : "New notification"}
        role="status"
      >
        {!isDotOnly && displayText}
      </span>
    </div>
  );
}

export default NotificationBadge;
