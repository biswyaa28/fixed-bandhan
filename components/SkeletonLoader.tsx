/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Skeleton Loaders (Comic Book / 8-Bit)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Skeleton screens for every critical path in the app.
 * Designed for perceived performance on 2G / budget phones (<2GB RAM).
 *
 * RULES:
 *   • No framer-motion (skeletons must load before heavy JS)
 *   • CSS-only shimmer animation (GPU-accelerated transform)
 *   • Matches exact layout dimensions to prevent CLS
 *   • Uses comic book visual language (hard borders, no blur)
 *   • All dimensions on 8px grid
 *
 * Variants:
 *   <ProfileCardSkeleton />    — Discovery feed cards
 *   <ChatListSkeleton />       — Chat conversation list
 *   <ChatBubbleSkeleton />     — Chat message bubbles
 *   <ProfilePageSkeleton />    — Full profile page
 *   <MatchListSkeleton />      — Matches grid
 *   <PremiumPageSkeleton />    — Premium plans page
 *   <GenericSkeleton />        — Flexible block skeleton
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Base Shimmer Block ──────────────────────────────────────────────────

interface ShimmerProps {
  className?: string;
  /** Width — Tailwind class like "w-32" or "w-full" */
  w?: string;
  /** Height — Tailwind class like "h-4" or "h-16" */
  h?: string;
  /** Make it a circle/square */
  rounded?: boolean;
}

/**
 * Base shimmer element.
 * Uses a CSS shimmer animation via the `.skeleton-shimmer` class
 * defined in globals.css. Falls back to a pulsing gray block.
 */
export function Shimmer({ className, w = "w-full", h = "h-4", rounded }: ShimmerProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer bg-[#E0E0E0]",
        w,
        h,
        rounded ? "rounded-full" : "",
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ─── Profile Card Skeleton (Discovery Feed) ─────────────────────────────

export function ProfileCardSkeleton() {
  return (
    <div
      className="border-2 border-[#E0E0E0] bg-[#F8F8F8] p-0 shadow-[4px_4px_0px_#E0E0E0]"
      aria-label="Loading profile..."
      role="status"
    >
      {/* Photo area */}
      <Shimmer h="h-64" className="border-b-2 border-[#E0E0E0]" />

      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Name + age */}
        <div className="flex items-center gap-2">
          <Shimmer w="w-32" h="h-5" />
          <Shimmer w="w-10" h="h-5" />
        </div>

        {/* City + badge */}
        <div className="flex items-center gap-2">
          <Shimmer w="w-4" h="h-4" rounded />
          <Shimmer w="w-24" h="h-3" />
          <Shimmer w="w-16" h="h-4" />
        </div>

        {/* Bio lines */}
        <Shimmer w="w-full" h="h-3" />
        <Shimmer w="w-3/4" h="h-3" />

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Shimmer w="w-12" h="h-12" className="border-2 border-[#E0E0E0]" />
          <Shimmer w="w-14" h="h-14" className="border-2 border-[#E0E0E0]" />
          <Shimmer w="w-12" h="h-12" className="border-2 border-[#E0E0E0]" />
        </div>
      </div>
    </div>
  );
}

// ─── Chat List Skeleton ──────────────────────────────────────────────────

function ChatListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-[#E0E0E0] px-4 py-3">
      {/* Avatar */}
      <Shimmer w="w-12" h="h-12" className="flex-shrink-0 border-2 border-[#E0E0E0]" />

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Shimmer w="w-24" h="h-4" />
          <Shimmer w="w-10" h="h-3" />
        </div>
        <Shimmer w="w-44" h="h-3" />
      </div>
    </div>
  );
}

export function ChatListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading conversations...">
      {/* Search bar */}
      <div className="border-b-2 border-[#E0E0E0] px-4 py-3">
        <Shimmer h="h-10" className="border-2 border-[#E0E0E0]" />
      </div>

      {/* Conversation items */}
      {Array.from({ length: count }, (_, i) => (
        <ChatListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Chat Bubble Skeleton ────────────────────────────────────────────────

export function ChatBubbleSkeleton({ fromMe = false }: { fromMe?: boolean }) {
  return (
    <div
      className={cn("mb-3 flex", fromMe ? "justify-end" : "justify-start")}
      aria-hidden="true"
    >
      <div
        className={cn(
          "max-w-[70%] space-y-2 border-2 border-[#E0E0E0] p-3",
          fromMe ? "bg-white" : "bg-[#F8F8F8]",
        )}
      >
        <Shimmer w={fromMe ? "w-36" : "w-44"} h="h-3" />
        <Shimmer w={fromMe ? "w-24" : "w-32"} h="h-3" />
        <Shimmer w="w-12" h="h-2" className="ml-auto" />
      </div>
    </div>
  );
}

export function ChatMessagesSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-1 px-4 py-2" role="status" aria-label="Loading messages...">
      {Array.from({ length: count }, (_, i) => (
        <ChatBubbleSkeleton key={i} fromMe={i % 3 === 0} />
      ))}
    </div>
  );
}

// ─── Profile Page Skeleton ───────────────────────────────────────────────

export function ProfilePageSkeleton() {
  return (
    <div
      className="mx-auto max-w-md space-y-4 p-4"
      role="status"
      aria-label="Loading profile..."
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <Shimmer w="w-20" h="h-20" className="flex-shrink-0 border-2 border-[#E0E0E0]" />
        <div className="flex-1 space-y-2">
          <Shimmer w="w-36" h="h-5" />
          <Shimmer w="w-24" h="h-3" />
          <Shimmer w="w-20" h="h-4" />
        </div>
      </div>

      {/* Completion bar */}
      <Shimmer h="h-3" className="border border-[#E0E0E0]" />

      {/* Info cards */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2 border-2 border-[#E0E0E0] p-4">
          <div className="flex items-center gap-2">
            <Shimmer w="w-5" h="h-5" rounded />
            <Shimmer w="w-28" h="h-4" />
          </div>
          <Shimmer w="w-full" h="h-3" />
        </div>
      ))}
    </div>
  );
}

// ─── Match List Skeleton (Grid) ──────────────────────────────────────────

export function MatchListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4" role="status" aria-label="Loading matches...">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Shimmer w="w-32" h="h-6" />
        <Shimmer w="w-20" h="h-8" className="border-2 border-[#E0E0E0]" />
      </div>

      {/* Cards */}
      {Array.from({ length: count }, (_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Premium Page Skeleton ───────────────────────────────────────────────

export function PremiumPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-md space-y-6 p-4"
      role="status"
      aria-label="Loading plans..."
    >
      {/* Header */}
      <div className="space-y-2 text-center">
        <Shimmer w="w-10" h="h-10" rounded className="mx-auto" />
        <Shimmer w="w-48" h="h-6" className="mx-auto" />
        <Shimmer w="w-64" h="h-3" className="mx-auto" />
      </div>

      {/* Plan toggle */}
      <Shimmer h="h-10" className="border-2 border-[#E0E0E0]" />

      {/* Plan cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 border-2 border-[#E0E0E0] p-4">
          <div className="flex items-center justify-between">
            <Shimmer w="w-20" h="h-5" />
            <Shimmer w="w-16" h="h-4" />
          </div>
          <Shimmer w="w-24" h="h-8" />
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex items-center gap-2">
              <Shimmer w="w-4" h="h-4" />
              <Shimmer w="w-40" h="h-3" />
            </div>
          ))}
          <Shimmer h="h-12" className="border-2 border-[#E0E0E0]" />
        </div>
      ))}
    </div>
  );
}

// ─── Generic Skeleton ────────────────────────────────────────────────────

interface GenericSkeletonProps {
  /** Number of rows */
  rows?: number;
  /** Show avatar circle */
  avatar?: boolean;
  className?: string;
}

export function GenericSkeleton({
  rows = 3,
  avatar = false,
  className,
}: GenericSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Loading...">
      {avatar && (
        <div className="flex items-center gap-3">
          <Shimmer w="w-10" h="h-10" rounded />
          <div className="flex-1 space-y-2">
            <Shimmer w="w-32" h="h-4" />
            <Shimmer w="w-20" h="h-3" />
          </div>
        </div>
      )}
      {Array.from({ length: rows }, (_, i) => (
        <Shimmer key={i} w={i === rows - 1 ? "w-3/4" : "w-full"} h="h-3" />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ─── Settings Page Skeleton ──────────────────────────────────────────

export function SettingsPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-md space-y-4 p-4"
      role="status"
      aria-label="Loading settings..."
    >
      {/* Header */}
      <Shimmer w="w-32" h="h-6" />

      {/* Settings sections */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-3 border-2 border-[#E0E0E0] p-4">
          <Shimmer w="w-28" h="h-4" />
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shimmer w="w-5" h="h-5" />
                <Shimmer w="w-32" h="h-3" />
              </div>
              <Shimmer w="w-10" h="h-5" />
            </div>
          ))}
        </div>
      ))}

      {/* Logout button */}
      <Shimmer h="h-12" className="border-2 border-[#E0E0E0]" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ─── Onboarding Skeleton ─────────────────────────────────────────────

export function OnboardingSkeleton() {
  return (
    <div className="mx-auto max-w-md space-y-6 p-6" role="status" aria-label="Loading...">
      {/* Progress bar */}
      <Shimmer h="h-2" className="border border-[#E0E0E0]" />

      {/* Heading */}
      <div className="space-y-2 text-center">
        <Shimmer w="w-48" h="h-6" className="mx-auto" />
        <Shimmer w="w-64" h="h-3" className="mx-auto" />
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2 border-2 border-[#E0E0E0] p-4">
            <Shimmer w="w-8" h="h-8" className="mx-auto" />
            <Shimmer w="w-20" h="h-3" className="mx-auto" />
          </div>
        ))}
      </div>

      {/* CTA button */}
      <Shimmer h="h-12" className="border-2 border-[#E0E0E0]" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ─── Verify Page Skeleton ────────────────────────────────────────────

export function VerifyPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-md space-y-4 p-4"
      role="status"
      aria-label="Loading verification..."
    >
      {/* Icon + heading */}
      <div className="space-y-3 text-center">
        <Shimmer w="w-16" h="h-16" className="mx-auto border-2 border-[#E0E0E0]" />
        <Shimmer w="w-40" h="h-5" className="mx-auto" />
        <Shimmer w="w-56" h="h-3" className="mx-auto" />
      </div>

      {/* Step cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 border-2 border-[#E0E0E0] p-4">
          <Shimmer w="w-8" h="h-8" />
          <div className="flex-1 space-y-1">
            <Shimmer w="w-32" h="h-4" />
            <Shimmer w="w-48" h="h-3" />
          </div>
        </div>
      ))}

      {/* CTA */}
      <Shimmer h="h-12" className="border-2 border-[#E0E0E0]" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ─── Discovery Feed Skeleton (card stack) ────────────────────────────

export function DiscoveryFeedSkeleton() {
  return (
    <div
      className="mx-auto max-w-md space-y-4"
      role="status"
      aria-label="Loading discovery feed..."
    >
      {/* Daily limit counter */}
      <div className="px-4 pt-3">
        <Shimmer w="w-36" h="h-3" />
      </div>

      {/* Perfect match section */}
      <div className="px-4">
        <Shimmer w="w-48" h="h-5" className="mb-2" />
        <div className="border-2 border-[#E0E0E0] shadow-[4px_4px_0px_#E0E0E0]">
          <Shimmer h="h-40" className="border-b-2 border-[#E0E0E0]" />
          <div className="space-y-2 p-3">
            <Shimmer w="w-32" h="h-5" />
            <Shimmer w="w-20" h="h-3" />
          </div>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex gap-2 overflow-hidden px-4">
        {[1, 2, 3, 4].map((i) => (
          <Shimmer
            key={i}
            w="w-24"
            h="h-8"
            className="flex-shrink-0 border border-[#E0E0E0]"
          />
        ))}
      </div>

      {/* Profile cards */}
      <div className="space-y-4 px-4">
        <ProfileCardSkeleton />
        <ProfileCardSkeleton />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// ─── Full Page Skeleton (used by dynamic() loading fallbacks) ────────────

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fake top bar */}
      <div className="flex h-14 items-center border-b-[3px] border-white bg-[#212121] px-4">
        <Shimmer w="w-24" h="h-4" className="bg-[#424242]" />
      </div>
      <div className="mx-auto max-w-md p-4">
        <GenericSkeleton rows={5} avatar />
      </div>
    </div>
  );
}

export default GenericSkeleton;
