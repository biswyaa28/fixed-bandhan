/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Active Matches List (Tab 1)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Three sections:
 *   1. "New Matches (N)" — last 7 days, horizontal scroll avatars
 *   2. "Active Matches (N)" — ongoing conversations, vertical list
 *   3. "Past Matches (N)" — ended convos, collapsed by default
 *
 * Each match card:
 *   • Avatar (initials block), name, matched date
 *   • Compatibility score, last message preview
 *   • Tap → navigate to chat
 *   • Long-press → options menu (Block, Report, Hide)
 *
 * Comic-book aesthetic: 2px black borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Shield,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
  Clock,
  Ban,
  Flag,
  EyeOff,
  X,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  verificationLevel: "bronze" | "silver" | "gold";
  compatibility: number;
  matchedDate: string;
  matchedDaysAgo: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
  isOnline?: boolean;
  /** "active" | "new" | "past" */
  status: "new" | "active" | "past";
}

export interface ActiveMatchesProps {
  matches: MatchProfile[];
  isLoading?: boolean;
  className?: string;
}

// ─── Verification badge ──────────────────────────────────────────────────────

const VERIF = {
  bronze: { bg: "bg-[#E0E0E0]", letter: "B", Icon: Shield },
  silver: { bg: "bg-[#9E9E9E]", letter: "S", Icon: Shield },
  gold: { bg: "bg-[#424242] text-white", letter: "G", Icon: ShieldCheck },
} as const;

function MiniBadge({ level }: { level: "bronze" | "silver" | "gold" }) {
  const v = VERIF[level];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 border border-black text-[6px] font-bold",
        v.bg,
      )}
      aria-label={`${level} verified`}
    >
      {v.letter}
    </span>
  );
}

// ─── Options Menu (long-press) ───────────────────────────────────────────────

function OptionsMenu({
  name,
  onClose,
  onBlock,
  onReport,
  onHide,
}: {
  name: string;
  onClose: () => void;
  onBlock: () => void;
  onReport: () => void;
  onHide: () => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[3px] border-black safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-label={`Options for ${name}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-black">
          <h2 className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0">
            {name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-black" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-3 space-y-2">
          {[
            { icon: EyeOff, label: "Hide Match", desc: "Remove from your list", action: onHide },
            { icon: Ban, label: `Block ${name}`, desc: "They won't see you", action: onBlock },
            { icon: Flag, label: "Report Profile", desc: "Fake, spam, or harassment", action: onReport },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => { item.action(); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer",
                  "border-[2px] border-black bg-white",
                  "shadow-[2px_2px_0px_#000000]",
                  "transition-all duration-100",
                  "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                )}
              >
                <div className="w-8 h-8 border-[2px] border-black bg-[#F8F8F8] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-black" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-heading font-bold text-[#212121] m-0">{item.label}</p>
                  <p className="text-[8px] text-[#9E9E9E] m-0">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// ─── Match Card ──────────────────────────────────────────────────────────────

function MatchCard({
  match,
  onLongPress,
}: {
  match: MatchProfile;
  onLongPress: (m: MatchProfile) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLong = useRef(false);

  const handlePointerDown = useCallback(() => {
    didLong.current = false;
    timerRef.current = setTimeout(() => {
      didLong.current = true;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(20);
      onLongPress(match);
    }, 500);
  }, [match, onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const isPast = match.status === "past";

  return (
    <Link
      href={`/messages/${match.id}`}
      onClick={(e) => { if (didLong.current) e.preventDefault(); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn(
        "flex items-center gap-3 px-4 py-3 no-underline",
        "border-b border-dashed border-[#E0E0E0]",
        "hover:bg-[#F8F8F8] transition-colors duration-100",
        isPast && "opacity-60",
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-12 h-12 border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${match.gradientFrom}, ${match.gradientTo})`,
          }}
        >
          <span className="text-sm font-heading font-bold text-black select-none leading-none">
            {match.initials}
          </span>
        </div>
        {match.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white border-[2px] border-black flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-black" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Name + badge + compatibility */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className={cn(
              "text-sm font-heading font-bold text-[#212121] truncate",
              match.unread && match.unread > 0 && "text-black",
            )}>
              {match.name}, {match.age}
            </span>
            <MiniBadge level={match.verificationLevel} />
          </div>
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black text-white border border-black text-[7px] font-bold flex-shrink-0">
            <Heart className="w-2.5 h-2.5" strokeWidth={2.5} />
            {match.compatibility}%
          </span>
        </div>

        {/* Row 2: City + matched date */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[8px] text-[#9E9E9E] uppercase tracking-wider">
            {match.city}
          </span>
          <span className="text-[8px] text-[#9E9E9E]">·</span>
          <span className="flex items-center gap-0.5 text-[8px] text-[#9E9E9E]">
            <Clock className="w-2.5 h-2.5" strokeWidth={2} />
            {match.matchedDate}
          </span>
        </div>

        {/* Row 3: Last message */}
        {match.lastMessage && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-[#9E9E9E] truncate m-0 flex-1">
              {match.lastMessage}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {match.lastMessageTime && (
                <span className="text-[7px] text-[#9E9E9E] tabular-nums">
                  {match.lastMessageTime}
                </span>
              )}
              {match.unread && match.unread > 0 && (
                <span className="min-w-[16px] h-4 px-1 flex items-center justify-center bg-black text-white border-[2px] border-black text-[7px] font-bold leading-none">
                  {match.unread > 9 ? "9+" : match.unread}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  collapsible,
  collapsed,
  onToggle,
}: {
  title: string;
  count: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const Tag = collapsible ? "button" : "div";
  return (
    <Tag
      onClick={collapsible ? onToggle : undefined}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2",
        "border-b-[2px] border-black bg-[#F8F8F8]",
        collapsible && "cursor-pointer hover:bg-[#E0E0E0] transition-colors duration-100",
      )}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-[10px] font-heading font-bold text-black uppercase tracking-widest m-0">
          {title}
        </h3>
        <span className="px-1.5 py-0.5 bg-black text-white text-[7px] font-bold">
          {count}
        </span>
      </div>
      {collapsible && (
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[#9E9E9E] transition-transform duration-200",
            collapsed && "-rotate-90",
          )}
          strokeWidth={2}
        />
      )}
    </Tag>
  );
}

// ─── New Matches Horizontal Scroll ───────────────────────────────────────────

function NewMatchesRow({
  matches,
  onLongPress,
}: {
  matches: MatchProfile[];
  onLongPress: (m: MatchProfile) => void;
}) {
  if (matches.length === 0) return null;

  return (
    <div>
      <SectionHeader title="New Matches" count={matches.length} />
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/messages/${m.id}`}
              className="flex flex-col items-center gap-1 flex-shrink-0 no-underline group"
            >
              <div className="relative">
                <div
                  className="w-16 h-16 border-[2px] border-[#FFD700] shadow-[2px_2px_0px_#000000] flex items-center justify-center transition-all duration-100 group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#000000]"
                  style={{
                    background: `linear-gradient(135deg, ${m.gradientFrom}, ${m.gradientTo})`,
                  }}
                >
                  <span className="text-lg font-heading font-bold text-black select-none">
                    {m.initials}
                  </span>
                </div>
                {m.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white border-[2px] border-black flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-black" />
                  </span>
                )}
                <Sparkles
                  className="absolute -top-1 -right-1 w-4 h-4 text-[#FFD700]"
                  strokeWidth={2}
                  fill="#FFD700"
                />
              </div>
              <span className="text-[8px] font-bold text-black uppercase tracking-wider text-center max-w-[64px] truncate">
                {m.name.split(" ")[0]}
              </span>
              <span className="text-[7px] text-[#9E9E9E]">
                {m.compatibility}%
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-16 px-8">
      <div className="w-16 h-16 mx-auto mb-4 border-[2px] border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000] flex items-center justify-center">
        <Heart className="w-7 h-7 text-[#9E9E9E]" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-heading font-bold text-black uppercase mb-1">
        No Matches Yet
      </h3>
      <p className="text-xs text-[#9E9E9E] max-w-xs mx-auto m-0 mb-4">
        Start exploring profiles to find your perfect match!
      </p>
      <Link
        href="/discover"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 no-underline",
          "border-[2px] border-black bg-black text-white",
          "shadow-[3px_3px_0px_#000000]",
          "text-[10px] font-heading font-bold uppercase tracking-wider",
          "hover:bg-[#424242] transition-colors duration-100",
        )}
      >
        <Heart className="w-3.5 h-3.5" strokeWidth={2} />
        Explore Profiles
      </Link>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function MatchesSkeleton() {
  return (
    <div>
      {/* New matches row skeleton */}
      <div className="px-4 py-3 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 shimmer-bg" />
            <div className="w-10 h-2 shimmer-bg" />
          </div>
        ))}
      </div>
      {/* Active matches skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-dashed border-[#E0E0E0]">
          <div className="w-12 h-12 shimmer-bg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 shimmer-bg" />
            <div className="h-2 w-20 shimmer-bg" />
            <div className="h-3 w-48 shimmer-bg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ActiveMatches({
  matches,
  isLoading = false,
  className,
}: ActiveMatchesProps) {
  const [pastCollapsed, setPastCollapsed] = useState(true);
  const [optionsMatch, setOptionsMatch] = useState<MatchProfile | null>(null);

  const newMatches = matches.filter((m) => m.status === "new");
  const activeMatches = matches.filter((m) => m.status === "active");
  const pastMatches = matches.filter((m) => m.status === "past");

  if (isLoading) return <MatchesSkeleton />;
  if (matches.length === 0) return <EmptyState />;

  return (
    <div className={cn("", className)}>
      {/* ── New Matches (horizontal scroll) ── */}
      <NewMatchesRow matches={newMatches} onLongPress={setOptionsMatch} />

      {/* ── Active Matches (vertical list) ── */}
      {activeMatches.length > 0 && (
        <div>
          <SectionHeader title="Active Matches" count={activeMatches.length} />
          {activeMatches.map((m) => (
            <MatchCard key={m.id} match={m} onLongPress={setOptionsMatch} />
          ))}
        </div>
      )}

      {/* ── Past Matches (collapsible) ── */}
      {pastMatches.length > 0 && (
        <div>
          <SectionHeader
            title="Past Matches"
            count={pastMatches.length}
            collapsible
            collapsed={pastCollapsed}
            onToggle={() => setPastCollapsed((v) => !v)}
          />
          <AnimatePresence initial={false}>
            {!pastCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {pastMatches.map((m) => (
                  <MatchCard key={m.id} match={m} onLongPress={setOptionsMatch} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Options menu ── */}
      <AnimatePresence>
        {optionsMatch && (
          <OptionsMenu
            name={optionsMatch.name}
            onClose={() => setOptionsMatch(null)}
            onBlock={() => console.log("Block", optionsMatch.id)}
            onReport={() => console.log("Report", optionsMatch.id)}
            onHide={() => console.log("Hide", optionsMatch.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ActiveMatches;
