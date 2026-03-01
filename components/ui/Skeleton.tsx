/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Skeleton Loaders (Comic Book / 8-Bit)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gray rectangles with pixelated shimmer animation.
 * Each variant matches the exact dimensions of the component it replaces.
 *
 * Available skeletons:
 *   • SkeletonBox         — generic rectangle (configurable w/h)
 *   • SkeletonText        — single line of text (configurable width)
 *   • SkeletonAvatar      — square initials block
 *   • SkeletonCard        — full discovery/profile card
 *   • SkeletonChatRow     — chat list conversation row
 *   • SkeletonMatchCard   — matches list card row
 *   • SkeletonProfilePage — entire profile page skeleton
 *
 * Design rules:
 *   • All borders 2px black
 *   • No rounded corners (0px)
 *   • Uses .shimmer-bg from globals.css (pixelated shimmer)
 *   • 8px grid spacing
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Generic Skeleton Box ────────────────────────────────────────────────

export interface SkeletonBoxProps {
  /** Width (Tailwind class or CSS value). Default: "w-full" */
  width?: string;
  /** Height (Tailwind class or CSS value). Default: "h-4" */
  height?: string;
  /** Show a 2px black border */
  bordered?: boolean;
  className?: string;
}

export function SkeletonBox({
  width = "w-full",
  height = "h-4",
  bordered = false,
  className,
}: SkeletonBoxProps) {
  return (
    <div
      className={cn(
        "shimmer-bg",
        width,
        height,
        bordered && "border-[2px] border-[#E0E0E0]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ─── Text Line Skeleton ──────────────────────────────────────────────────

export interface SkeletonTextProps {
  /** Width as Tailwind class. Default: "w-3/4" */
  width?: string;
  /** Line height: sm=12px, md=16px, lg=20px */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const textSizeMap = {
  sm: "h-3",
  md: "h-4",
  lg: "h-5",
};

export function SkeletonText({
  width = "w-3/4",
  size = "md",
  className,
}: SkeletonTextProps) {
  return (
    <div
      className={cn("shimmer-bg", width, textSizeMap[size], className)}
      aria-hidden="true"
    />
  );
}

// ─── Avatar Skeleton ─────────────────────────────────────────────────────

export interface SkeletonAvatarProps {
  /** sm=32px, md=48px, lg=64px, xl=80px */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

export function SkeletonAvatar({
  size = "md",
  className,
}: SkeletonAvatarProps) {
  return (
    <div
      className={cn(
        "shimmer-bg border-[2px] border-[#E0E0E0] flex-shrink-0",
        avatarSizeMap[size],
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ─── Profile Card Skeleton (Discovery Feed) ─────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-[2px] border-[#E0E0E0] bg-[#F8F8F8]",
        className,
      )}
      aria-hidden="true"
      role="status"
      aria-label="Loading profile card"
    >
      {/* Photo placeholder */}
      <div className="w-full aspect-[3/4] shimmer-bg border-b-[2px] border-[#E0E0E0]" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name + badge row */}
        <div className="flex items-center justify-between">
          <SkeletonText width="w-32" size="lg" />
          <SkeletonBox width="w-6" height="h-6" bordered />
        </div>

        {/* Location */}
        <SkeletonText width="w-24" size="sm" />

        {/* Compatibility */}
        <SkeletonBox width="w-20" height="h-5" bordered />

        {/* Action buttons row */}
        <div className="flex gap-3 pt-2 border-t border-dashed border-[#E0E0E0]">
          <SkeletonBox width="w-12" height="h-12" bordered />
          <SkeletonBox width="w-12" height="h-12" bordered />
          <SkeletonBox width="w-12" height="h-12" bordered />
        </div>
      </div>
    </div>
  );
}

// ─── Chat Row Skeleton ───────────────────────────────────────────────────

export function SkeletonChatRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "border-b border-dashed border-[#E0E0E0]",
        className,
      )}
      aria-hidden="true"
    >
      <SkeletonAvatar size="md" />
      <div className="flex-1 space-y-1.5">
        <SkeletonText width="w-32" size="md" />
        <SkeletonText width="w-20" size="sm" />
        <SkeletonText width="w-48" size="sm" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <SkeletonText width="w-8" size="sm" />
      </div>
    </div>
  );
}

// ─── Match Card Skeleton ─────────────────────────────────────────────────

export function SkeletonMatchCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-[2px] border-[#E0E0E0] bg-white mx-4 mb-3",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex gap-3 p-3">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-1.5">
          <SkeletonText width="w-28" size="sm" />
          <SkeletonText width="w-36" size="md" />
          <SkeletonText width="w-20" size="sm" />
          <SkeletonBox width="w-16" height="h-4" bordered />
        </div>
      </div>
      {/* Action buttons */}
      <div className="flex border-t border-[#E0E0E0]">
        <div className="flex-1 h-10 shimmer-bg" />
        <div className="flex-1 h-10 shimmer-bg border-l border-[#E0E0E0]" />
      </div>
    </div>
  );
}

// ─── Profile Page Skeleton ───────────────────────────────────────────────

export function SkeletonProfilePage({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen bg-white", className)} aria-hidden="true">
      {/* Header banner */}
      <div className="h-24 shimmer-bg border-b-[2px] border-[#E0E0E0]" />

      {/* Avatar overlapping banner */}
      <div className="px-4 -mt-10 mb-4">
        <div className="flex items-end justify-between">
          <SkeletonAvatar size="xl" />
          <SkeletonBox width="w-24" height="h-6" bordered />
        </div>
      </div>

      {/* Name + intent */}
      <div className="px-4 space-y-2 mb-4">
        <SkeletonText width="w-48" size="lg" />
        <SkeletonText width="w-24" size="sm" />
        <SkeletonBox width="w-36" height="h-6" bordered />
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4">
        <div className="border-[2px] border-[#E0E0E0] p-3">
          <div className="flex items-center justify-between mb-2">
            <SkeletonText width="w-32" size="sm" />
            <SkeletonText width="w-8" size="md" />
          </div>
          <div className="h-3 shimmer-bg border border-[#E0E0E0]" />
        </div>
      </div>

      {/* Dashed divider */}
      <div className="mx-4 border-b border-dashed border-[#E0E0E0] mb-4" />

      {/* Life details grid */}
      <div className="mx-4 border-[2px] border-[#E0E0E0] mb-4">
        <div className="grid grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "p-3",
                i % 2 === 1 && "border-l border-dashed border-[#E0E0E0]",
                i < 4 && "border-b border-dashed border-[#E0E0E0]",
              )}
            >
              <SkeletonText width="w-12" size="sm" />
              <div className="mt-1">
                <SkeletonText width="w-20" size="md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashed divider */}
      <div className="mx-4 border-b border-dashed border-[#E0E0E0] mb-4" />

      {/* Bio section */}
      <div className="px-4 mb-4">
        <SkeletonText width="w-16" size="sm" />
        <div className="mt-2 border-[2px] border-[#E0E0E0] p-3 space-y-2">
          <SkeletonText width="w-full" size="sm" />
          <SkeletonText width="w-5/6" size="sm" />
          <SkeletonText width="w-2/3" size="sm" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 shimmer-bg border-[2px] border-[#E0E0E0]" />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton List (N rows) ──────────────────────────────────────────────

export function SkeletonList({
  rows = 4,
  variant = "chat",
  className,
}: {
  rows?: number;
  variant?: "chat" | "match";
  className?: string;
}) {
  const Row = variant === "chat" ? SkeletonChatRow : SkeletonMatchCard;
  return (
    <div
      className={cn("", className)}
      aria-hidden="true"
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <Row key={i} />
      ))}
    </div>
  );
}

// ─── Default Export ──────────────────────────────────────────────────────

export default SkeletonBox;
