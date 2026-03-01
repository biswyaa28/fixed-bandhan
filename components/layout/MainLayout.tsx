/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Main Layout (Authenticated Shell)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Wraps all authenticated pages (discover, chat, profile, matches, etc.)
 * with the top app bar, bottom navigation, and optional desktop sidebar.
 *
 * Layout structure:
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  AppBar (fixed top, 56px)                              │
 *   ├──────────┬──────────────────────────┬──────────────────┤
 *   │          │                          │                  │
 *   │ Desktop  │    Main Content Area     │  Desktop Right   │
 *   │ Sidebar  │    (scrollable)          │  Panel (future)  │
 *   │ (≥1024)  │                          │                  │
 *   │          │                          │                  │
 *   ├──────────┴──────────────────────────┴──────────────────┤
 *   │  BottomNav (fixed bottom, mobile only <1024px)         │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Responsive breakpoints:
 *   • Mobile  (< 640px):  Single column + bottom nav
 *   • Tablet  (640–1023): Single column + bottom nav
 *   • Desktop (≥ 1024):   Sidebar + main + optional right panel
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Users,
  User,
  MoreHorizontal,
  Crown,
  Settings,
  Gift,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/layout/BottomNav";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Sidebar Tab Config
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarLink {
  href: string;
  icon: typeof Heart;
  label: string;
  section: "main" | "secondary";
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { href: "/matches", icon: Heart, label: "Discover", section: "main" },
  { href: "/chat", icon: MessageCircle, label: "Messages", section: "main" },
  { href: "/matches/list", icon: Users, label: "Matches", section: "main" },
  { href: "/profile", icon: User, label: "Profile", section: "main" },
  { href: "/premium", icon: Crown, label: "Premium", section: "secondary" },
  { href: "/referral", icon: Gift, label: "Invite Friends", section: "secondary" },
  { href: "/settings", icon: Settings, label: "Settings", section: "secondary" },
  { href: "/help", icon: HelpCircle, label: "Help", section: "secondary" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface MainLayoutProps {
  children: React.ReactNode;
  /** Unread notification count */
  notificationCount?: number;
  /** Unread chat message count */
  unreadMessages?: number;
  /** User initials for avatar (e.g. "PS") */
  userInitials?: string;
  /** Whether user has premium */
  isPremium?: boolean;
  /** Called when notification bell is tapped */
  onNotificationsClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MainLayout({
  children,
  notificationCount = 0,
  unreadMessages = 0,
  userInitials = "",
  isPremium = false,
  onNotificationsClick,
}: MainLayoutProps) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleNotifications = useCallback(() => {
    setNotifOpen((prev) => !prev);
    onNotificationsClick?.();
  }, [onNotificationsClick]);

  const isActive = (href: string) => {
    if (href === "/matches") return pathname === "/matches";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const mainLinks = SIDEBAR_LINKS.filter((l) => l.section === "main");
  const secondaryLinks = SIDEBAR_LINKS.filter((l) => l.section === "secondary");

  return (
    <>
      {/* ── Top App Bar ─────────────────────────────────────────── */}
      <AppBar
        notificationCount={notificationCount}
        userInitials={userInitials}
        isPremium={isPremium}
        onNotificationsClick={handleNotifications}
      />

      {/* ── Content Area ────────────────────────────────────────── */}
      <div className="flex min-h-screen">
        {/* ── Desktop Sidebar (≥1024px) ────────────────────────── */}
        <aside
          className={cn(
            "hidden lg:flex lg:flex-col lg:w-60 lg:flex-shrink-0",
            "fixed top-[59px] left-0 bottom-0",
            "bg-white",
            "border-r-[2px] border-black",
            "overflow-y-auto",
          )}
          aria-label="Sidebar navigation"
        >
          {/* Main links */}
          <nav className="flex flex-col p-3 gap-1" role="navigation">
            {mainLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 no-underline",
                    "text-sm font-heading font-bold uppercase tracking-wider",
                    "border-2",
                    "transition-colors duration-100",
                    active
                      ? "bg-black text-white border-black shadow-[2px_2px_0px_#000000]"
                      : "bg-white text-[#424242] border-transparent hover:border-black hover:bg-[#F8F8F8]",
                  )}
                >
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    strokeWidth={active ? 2.5 : 2}
                    aria-hidden="true"
                  />
                  {link.label}
                  {/* Message badge */}
                  {link.href === "/chat" && unreadMessages > 0 && (
                    <span
                      className={cn(
                        "ml-auto min-w-[20px] h-5 px-1",
                        "flex items-center justify-center",
                        "text-[10px] font-bold leading-none",
                        active
                          ? "bg-white text-black border-2 border-white"
                          : "bg-black text-white border-2 border-black",
                      )}
                    >
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                  {/* Active arrow */}
                  {active && (
                    <span className="ml-auto text-[10px] leading-none" aria-hidden="true">
                      ◄
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-4 border-t border-dashed border-[#E0E0E0]" />

          {/* Secondary links */}
          <nav className="flex flex-col p-3 gap-1" role="navigation" aria-label="Secondary navigation">
            {secondaryLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 no-underline",
                    "text-xs font-heading font-bold uppercase tracking-wider",
                    "border-2",
                    "transition-colors duration-100",
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-[#9E9E9E] border-transparent hover:border-[#E0E0E0] hover:text-[#424242]",
                  )}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: Premium card (only if not premium) */}
          {!isPremium && (
            <div className="mt-auto p-4">
              <div className="p-4 bg-[#F8F8F8] border-[2px] border-black shadow-[4px_4px_0px_#000000]">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-black" strokeWidth={2.5} aria-hidden="true" />
                  <span className="text-xs font-heading font-bold text-black uppercase">
                    Go Premium
                  </span>
                </div>
                <p className="text-[10px] text-[#424242] mb-3 leading-relaxed m-0">
                  Unlimited matches, priority visibility & exclusive features.
                </p>
                <Link
                  href="/premium"
                  className={cn(
                    "block w-full py-2.5 text-center no-underline",
                    "bg-black text-white",
                    "border-2 border-black",
                    "text-[10px] font-heading font-bold uppercase tracking-wider",
                    "hover:bg-[#424242]",
                    "transition-colors duration-100",
                  )}
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content ──────────────────────────────────────── */}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 outline-none",
            // Top padding: AppBar height (56px) + border (3px) + shadow (4px) = 63px → round to 64px (8×8)
            "pt-16",
            // Bottom padding: BottomNav height (56px) + border (3px) + shadow (4px) + safe area ≈ 80px
            "pb-20 lg:pb-4",
            // Desktop: offset by sidebar width
            "lg:ml-60",
            // Max width for content readability
            "lg:max-w-3xl xl:max-w-4xl",
            // Horizontal padding
            "px-0 sm:px-4 lg:px-6",
          )}
        >
          {children}
        </main>
      </div>

      {/* ── Bottom Navigation (mobile/tablet only) ──────────────── */}
      <BottomNav unreadMessages={unreadMessages} />
    </>
  );
}

export default MainLayout;
