/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Bottom Navigation (5 Tabs)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Fixed bottom bar for mobile. Hidden on desktop (sidebar takes over).
 *
 * Tabs: Discover · Messages · Matches · Profile · More
 *
 * Comic-book aesthetic:
 *   • Charcoal (#212121) background, thick white top border
 *   • Active tab inverts to white bg + black text + triangle pointer
 *   • 8-bit notification badge (white text on black)
 *   • Minimum 48px touch targets on every tab
 *   • Haptic feedback on tab switch (if supported)
 *   • Safe-area inset for iOS home indicator
 *
 * Responsive:
 *   • Visible on mobile/tablet (<1024px)
 *   • Hidden on desktop (≥1024px) — DesktopSidebar is used instead
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, Users, User, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab Configuration
// ─────────────────────────────────────────────────────────────────────────────

interface Tab {
  href: string;
  icon: typeof Heart;
  label: string;
  /** Aria-label override (defaults to label) */
  ariaLabel?: string;
  /** Unread count badge — 0 or undefined = hidden */
  badge?: number;
}

const TABS: Tab[] = [
  {
    href: "/discover",
    icon: Heart,
    label: "Discover",
    ariaLabel: "Discover matches",
  },
  {
    href: "/messages",
    icon: MessageCircle,
    label: "Messages",
    ariaLabel: "Messages",
    badge: 0, // Dynamically set by parent or hook
  },
  {
    href: "/matches",
    icon: Users,
    label: "Matches",
    ariaLabel: "Your matches",
  },
  {
    href: "/profile",
    icon: User,
    label: "Profile",
    ariaLabel: "Your profile",
  },
  {
    href: "/more",
    icon: MoreHorizontal,
    label: "More",
    ariaLabel: "More options",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface BottomNavProps {
  /** Override badge count for Messages tab */
  unreadMessages?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Haptic Feedback Helper
// ─────────────────────────────────────────────────────────────────────────────

function triggerHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10); // 10ms subtle tap
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BottomNav({ unreadMessages = 0, className }: BottomNavProps) {
  const pathname = usePathname();

  // Build tabs with dynamic badge
  const tabs = TABS.map((tab) =>
    tab.href === "/messages" ? { ...tab, badge: unreadMessages } : tab,
  );

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className={cn(
        // Fixed bottom, full width, above page content
        "fixed bottom-0 left-0 right-0 z-50",
        // Hidden on desktop — sidebar takes over at lg breakpoint
        "lg:hidden",
        // Charcoal background, thick white top border, hard shadow
        "bg-[#212121]",
        "border-t-[3px] border-white",
        "shadow-[0_-4px_0px_#000000]",
        className,
      )}
      aria-label="Main navigation"
      role="navigation"
    >
      {/* Tab row */}
      <div className="mx-auto flex max-w-lg items-stretch">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={triggerHaptic}
              aria-current={active ? "page" : undefined}
              aria-label={tab.ariaLabel || tab.label}
              className={cn(
                // Flex-1, centered column layout
                "flex flex-1 flex-col items-center justify-center",
                // 56px min height = 7 × 8px grid, 48px min touch target
                "relative min-h-[56px] py-2 no-underline",
                // Border between tabs
                "border-x border-[#424242]",
                // Active = inverted (white bg, black text)
                active ? "bg-white" : "bg-transparent hover:bg-black",
                // Transition for background color only (not transforms — 8-bit feel)
                "transition-colors duration-100",
              )}
            >
              {/* Icon: 32×32 centered container */}
              <div className="relative flex h-8 w-8 items-center justify-center">
                <Icon
                  className={cn("h-5 w-5", active ? "text-black" : "text-[#9E9E9E]")}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                {/* Badge: 8-bit square, only when non-zero */}
                {tab.badge != null && tab.badge > 0 && !active && (
                  <span
                    className={cn(
                      "absolute -right-2 -top-1",
                      "h-4 min-w-[16px] px-0.5",
                      "bg-white text-black",
                      "border-2 border-black",
                      "text-[8px] font-bold",
                      "flex items-center justify-center leading-none",
                    )}
                    aria-label={`${tab.badge} unread`}
                  >
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>

              {/* Label: tiny uppercase */}
              <span
                className={cn(
                  "mt-0.5 font-heading text-[10px] font-bold uppercase leading-none tracking-wider",
                  active ? "text-black" : "text-[#9E9E9E]",
                )}
                aria-hidden="true"
              >
                {tab.label}
              </span>

              {/* Active indicator: thick top bar + triangle arrow */}
              {active && (
                <>
                  <div
                    className="absolute left-2 right-2 top-0 h-[3px] bg-black"
                    aria-hidden="true"
                  />
                  <div
                    className={cn(
                      "absolute left-1/2 top-[3px] -translate-x-1/2",
                      "h-0 w-0",
                      "border-l-[5px] border-l-transparent",
                      "border-r-[5px] border-r-transparent",
                      "border-t-[5px] border-t-black",
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* iOS safe area bottom padding */}
      <div className="safe-bottom" />
    </nav>
  );
}

export default BottomNav;
