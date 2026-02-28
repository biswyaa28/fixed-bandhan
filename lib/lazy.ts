/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Lazy Loading Strategy
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Central registry for code-split heavy components using next/dynamic.
 *
 * WHY THIS EXISTS:
 *   On a Moto E (2020) with 2GB RAM on a 2G connection (~30KB/s):
 *     • framer-motion alone is ~50KB gzipped
 *     • lucide-react icon set is ~15KB
 *     • Each page (chat, matches, premium) is 20-40KB
 *
 *   Without lazy loading, the initial JS bundle includes ALL pages.
 *   With lazy loading, users only download the page they navigate to.
 *
 * HOW IT WORKS:
 *   next/dynamic wraps React.lazy() + Suspense with:
 *     • A skeleton loading fallback (no layout shift)
 *     • ssr: false for purely interactive components
 *     • Automatic code splitting by webpack/turbopack
 *
 * USAGE (in page files):
 *   import { LazyChat, LazyChatSkeleton } from '@/lib/lazy';
 *   export default function ChatPage() {
 *     return <LazyChat />;
 *   }
 *
 * Or directly:
 *   import dynamic from 'next/dynamic';
 *   import { ChatListSkeleton } from '@/components/SkeletonLoader';
 *   const ChatContent = dynamic(() => import('@/components/ChatContent'), {
 *     loading: () => <ChatListSkeleton />,
 *     ssr: false,
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import dynamic from "next/dynamic";

import {
  ProfileCardSkeleton,
  ChatListSkeleton,
  ProfilePageSkeleton,
  PremiumPageSkeleton,
  PageSkeleton,
} from "@/components/SkeletonLoader";

// ─── Heavy third-party components that should never be in initial bundle ──

/**
 * framer-motion's AnimatePresence — only load when actually animating.
 * Saves ~50KB from the critical path.
 */
export const LazyAnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false },
);

/**
 * React Query Devtools — only in development, never ships to prod.
 */
export const LazyReactQueryDevtools = dynamic(
  () =>
    process.env.NODE_ENV === "development"
      ? import("@tanstack/react-query-devtools").then(
          (mod) => mod.ReactQueryDevtools,
        )
      : Promise.resolve(() => null),
  { ssr: false },
);

// ─── Page-level lazy splits ─────────────────────────────────────────────

/**
 * Discovery/Matches feed — heaviest page (profile cards + swipe logic).
 * Only loads when user navigates to /matches.
 */
export const LazyDiscoveryFeed = dynamic(
  () => import("@/components/DiscoveryFeed").catch(() => {
    // Fallback if component doesn't exist yet
    return { default: () => null };
  }),
  {
    loading: () => ProfileCardSkeleton(),
    ssr: false,
  },
);

// ─── Modal / Dialog lazy loading ─────────────────────────────────────────

/**
 * Premium upsell modal — only loads when user hits a limit.
 */
export const LazyPremiumModal = dynamic(
  () => import("@/components/PremiumUpsellModal").catch(() => {
    return { default: () => null };
  }),
  { ssr: false },
);

/**
 * Safety modal — only loads when user taps safety button.
 */
export const LazySafetyModal = dynamic(
  () => import("@/components/SafetyModal").catch(() => {
    return { default: () => null };
  }),
  { ssr: false },
);

/**
 * Profile modal — only loads when user taps on a profile card.
 */
export const LazyProfileModal = dynamic(
  () => import("@/components/ProfileModal").catch(() => {
    return { default: () => null };
  }),
  { ssr: false },
);

/**
 * Notification center — only loads when user taps bell icon.
 */
export const LazyNotificationCenter = dynamic(
  () => import("@/components/NotificationCenter").catch(() => {
    return { default: () => null };
  }),
  { ssr: false },
);

/**
 * Voice note recorder — only loads when user taps mic button in chat.
 * Heavy component: includes Web Audio API + waveform rendering.
 */
export const LazyVoiceRecorder = dynamic(
  () => import("@/components/VoiceNoteRecorder").catch(() => {
    return { default: () => null };
  }),
  { ssr: false },
);
