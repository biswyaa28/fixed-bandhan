/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — App Shell (Conditional Layout Wrapper)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Renders the AppBar and BottomNav only on authenticated routes.
 * Hidden on: splash (/), auth (/login, /verify), onboarding (/intent, /values, etc.), demo.
 *
 * This is a client component so it can read the pathname.
 * Rendered once in the root layout; children are passed through.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { usePathname } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { BottomNav } from "@/components/layout/BottomNav";

// Routes where the shell (AppBar + BottomNav) should be HIDDEN
const HIDE_SHELL_PREFIXES = [
  "/login",
  "/verify",
  "/intent",
  "/values",
  "/life-architecture",
  "/preview",
  "/demo",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide shell on splash, auth, and onboarding routes
  const isHidden =
    pathname === "/" ||
    HIDE_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isHidden) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Top App Bar */}
      <AppBar
        notificationCount={3}
        userInitials=""
        isPremium={false}
      />

      {/* Main content with padding to clear fixed bars */}
      <div
        className="min-h-screen pt-16 pb-20 lg:pb-4"
        // pt-16 = AppBar (56px) + border (3px) + shadow (4px) ≈ 64px = 16 × 4
        // pb-20 = BottomNav (56px) + border (3px) + shadow (4px) + safe area ≈ 80px = 20 × 4
      >
        {children}
      </div>

      {/* Bottom Navigation (mobile/tablet only) */}
      <BottomNav unreadMessages={2} />
    </>
  );
}

export default AppShell;
