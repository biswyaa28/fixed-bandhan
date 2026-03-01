/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — (main) Route Group Layout
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This Next.js route group layout wraps all post-login pages:
 *   /matches, /chat, /profile, /premium, /more, etc.
 *
 * It renders the MainLayout shell (AppBar + BottomNav + Desktop Sidebar)
 * around the page content. Auth/onboarding pages live outside this group
 * and use the root layout directly (no bottom nav, no app bar).
 *
 * Route structure:
 *   app/
 *   ├── layout.tsx              ← Root (fonts, providers, <html>)
 *   ├── page.tsx                ← Splash / redirect
 *   ├── (auth)/                 ← Login, OTP (no shell)
 *   ├── (onboarding)/           ← Intent, values, preview (no shell)
 *   └── (main)/                 ← THIS FILE
 *       ├── layout.tsx          ← MainLayout shell (AppBar + BottomNav)
 *       ├── matches/page.tsx    ← Discovery feed
 *       ├── chat/page.tsx       ← Chat list
 *       ├── profile/page.tsx    ← User profile
 *       ├── premium/page.tsx    ← Premium upsell
 *       └── more/page.tsx       ← Settings, referral, help
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { MainLayout } from "@/components/layout/MainLayout";

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      notificationCount={3}
      unreadMessages={2}
      userInitials=""
      isPremium={false}
    >
      {children}
    </MainLayout>
  );
}
