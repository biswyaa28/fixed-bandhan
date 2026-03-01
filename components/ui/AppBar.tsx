/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — App Bar (Top Navigation)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Fixed top bar with:
 *   • Left: "Bandhan AI" logo
 *   • Right: Notification bell (with unread count) + profile avatar
 *
 * Comic-book aesthetic: charcoal background, thick white bottom border,
 * hard 8-bit shadow, pixel-art badge for notifications.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, User, Crown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface AppBarProps {
  /** Unread notification count (0 = badge hidden) */
  notificationCount?: number;
  /** User's display name initials (e.g. "PS") */
  userInitials?: string;
  /** Whether the user is premium */
  isPremium?: boolean;
  /** Called when notification bell is clicked */
  onNotificationsClick?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AppBar({
  notificationCount = 0,
  userInitials = "",
  isPremium = false,
  onNotificationsClick,
  className,
}: AppBarProps) {
  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50",
        "bg-[#212121]",
        "border-b-[3px] border-white",
        "shadow-[0_4px_0px_#000000]",
        className,
      )}
      role="banner"
    >
      {/* Safe area padding for iOS notch */}
      <div className="safe-top" />

      <nav
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6"
        aria-label="Top navigation"
      >
        {/* ── Left: Logo ────────────────────────────────────────────── */}
        <Link
          href="/discover"
          className="group flex items-center gap-2 no-underline"
          aria-label="Bandhan AI — Home"
        >
          {/* Logo mark: 32×32 square with 8-bit shadow */}
          <div
            className={cn(
              "h-8 w-8 border-2 border-black bg-white",
              "flex items-center justify-center",
              "shadow-[2px_2px_0px_#000000]",
              "transition-[transform,box-shadow] duration-150",
              "group-hover:translate-x-[1px] group-hover:translate-y-[1px]",
              "group-hover:shadow-[1px_1px_0px_#000000]",
            )}
          >
            <span className="select-none font-heading text-sm font-bold leading-none text-black">
              B
            </span>
          </div>
          {/* Wordmark */}
          <span className="select-none font-heading text-base font-bold uppercase leading-none tracking-tight text-white">
            Bandhan <span className="text-[#E0E0E0]">AI</span>
          </span>
        </Link>

        {/* ── Right: Actions ────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          {/* Premium badge (only on desktop, if not premium) */}
          {!isPremium && (
            <Link
              href="/premium"
              className={cn(
                "hidden items-center gap-1.5 px-3 py-1.5 no-underline sm:flex",
                "bg-white text-black",
                "border-2 border-black",
                "font-heading text-[10px] font-bold uppercase tracking-wider",
                "shadow-[2px_2px_0px_#000000]",
                "transition-[transform,box-shadow] duration-150",
                "hover:translate-x-[1px] hover:translate-y-[1px]",
                "hover:shadow-[1px_1px_0px_#000000]",
              )}
            >
              <Crown className="h-3.5 w-3.5" strokeWidth={2.5} />
              Premium
            </Link>
          )}

          {/* Notification bell */}
          <button
            onClick={onNotificationsClick}
            className={cn(
              "relative min-h-[48px] min-w-[48px] p-2",
              "flex items-center justify-center",
              "text-[#9E9E9E] hover:text-white",
              "hover:bg-black",
              "cursor-pointer border-none bg-transparent",
              "transition-colors duration-150",
            )}
            aria-label={
              notificationCount > 0
                ? `${notificationCount} unread notifications`
                : "Notifications"
            }
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            {/* 8-bit badge */}
            {notificationCount > 0 && (
              <span
                className={cn(
                  "absolute right-1.5 top-1.5",
                  "h-4 min-w-[16px] px-0.5",
                  "bg-white text-black",
                  "border-2 border-black",
                  "text-[8px] font-bold",
                  "flex items-center justify-center leading-none",
                )}
                aria-hidden="true"
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Profile avatar */}
          <Link
            href="/profile"
            className={cn(
              "relative h-9 w-9 overflow-hidden",
              "border-2 border-white bg-[#E0E0E0]",
              "flex items-center justify-center",
              "hover:bg-white",
              "cursor-pointer no-underline",
              "transition-colors duration-150",
            )}
            aria-label="Your profile"
          >
            {userInitials ? (
              <span className="select-none font-heading text-[10px] font-bold uppercase leading-none text-black">
                {userInitials}
              </span>
            ) : (
              <User className="h-4 w-4 text-black" strokeWidth={2.5} />
            )}
            {/* Online indicator: 8px square */}
            <span
              className="absolute -bottom-px -right-px h-2 w-2 border-[1.5px] border-black bg-white"
              aria-hidden="true"
            />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default AppBar;
