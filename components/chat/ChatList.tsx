/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Chat List (Conversations Index)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Shows all active conversations sorted by most-recent.
 * Comic-book aesthetic: thick borders, hard shadows, monochromatic.
 *
 * Features:
 *   • Profile avatar (initials block) + online indicator
 *   • Name + age + city
 *   • Last message preview (blurred label for photos)
 *   • Timestamp + unread count badge (8-bit block)
 *   • Typing indicator for active chats
 *   • "New Match" banner card at top
 *   • Filter pills: All | Unread | Online
 *   • Search overlay
 *   • Skeleton loading state
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Image as ImageIcon,
  Mic,
  Heart,
  Shield,
  ShieldCheck,
  X,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ConversationSummary {
  id: string;
  name: string;
  age: number;
  city: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  verificationLevel: "bronze" | "silver" | "gold";
  isOnline: boolean;
  isTyping: boolean;
  lastMessage: {
    text?: string;
    type: "text" | "photo" | "voice" | "interest";
    isFromMe: boolean;
    timestamp: string;
  };
  unreadCount: number;
  /** For "New Match" banner — true if matched in last 24h */
  isNewMatch: boolean;
}

export interface ChatListProps {
  conversations: ConversationSummary[];
  isLoading?: boolean;
  filter?: "all" | "unread" | "online";
  onFilterChange?: (filter: "all" | "unread" | "online") => void;
  className?: string;
}

// ─── Verification badge (compact) ────────────────────────────────────────────

const VERIF_CFG = {
  bronze: { bg: "bg-[#E0E0E0]", letter: "B", Icon: Shield },
  silver: { bg: "bg-[#9E9E9E]", letter: "S", Icon: Shield },
  gold: { bg: "bg-[#424242] text-white", letter: "G", Icon: ShieldCheck },
} as const;

function MiniBadge({ level }: { level: "bronze" | "silver" | "gold" }) {
  const cfg = VERIF_CFG[level];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 border border-black text-[6px] font-bold",
        cfg.bg,
      )}
      aria-label={`${level} verified`}
    >
      {cfg.letter}
    </span>
  );
}

// ─── Message Preview ─────────────────────────────────────────────────────────

function MessagePreview({
  msg,
  isTyping,
}: {
  msg: ConversationSummary["lastMessage"];
  isTyping: boolean;
}) {
  if (isTyping) {
    return (
      <span className="flex items-center gap-1 text-[#424242] font-bold italic">
        typing
        <span className="flex gap-[2px]">
          <span className="w-[4px] h-[4px] bg-[#424242] animate-[typing-bounce_0.8s_ease-in-out_infinite_0ms]" />
          <span className="w-[4px] h-[4px] bg-[#424242] animate-[typing-bounce_0.8s_ease-in-out_infinite_200ms]" />
          <span className="w-[4px] h-[4px] bg-[#424242] animate-[typing-bounce_0.8s_ease-in-out_infinite_400ms]" />
        </span>
      </span>
    );
  }

  switch (msg.type) {
    case "photo":
      return (
        <span className="flex items-center gap-1 text-[#9E9E9E]">
          <ImageIcon className="w-3 h-3" strokeWidth={2} />
          <span className="blur-[3px] select-none">Photo</span>
        </span>
      );
    case "voice":
      return (
        <span className="flex items-center gap-1 text-[#9E9E9E]">
          <Mic className="w-3 h-3" strokeWidth={2} />
          Voice note
        </span>
      );
    case "interest":
      return (
        <span className="flex items-center gap-1 text-[#424242]">
          <Heart className="w-3 h-3" strokeWidth={2} />
          Interest sent
        </span>
      );
    default:
      return (
        <span className="truncate text-[#9E9E9E]">
          {msg.isFromMe && <span className="text-[#424242] font-bold">You: </span>}
          {msg.text}
        </span>
      );
  }
}

// ─── Chat List Item ──────────────────────────────────────────────────────────

function ChatListItem({ conv }: { conv: ConversationSummary }) {
  const hasUnread = conv.unreadCount > 0;

  return (
    <Link
      href={`/messages/${conv.id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 no-underline",
        "border-b border-dashed border-[#E0E0E0]",
        "hover:bg-[#F8F8F8] transition-colors duration-100",
        hasUnread && "bg-[#FAFAFA]",
      )}
    >
      {/* Avatar: initials block with online dot */}
      <div className="relative flex-shrink-0">
        <div
          className="w-11 h-11 border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${conv.gradientFrom}, ${conv.gradientTo})`,
          }}
        >
          <span className="text-sm font-heading font-bold text-black select-none leading-none">
            {conv.initials}
          </span>
        </div>
        {conv.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white border-[2px] border-black flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-black" />
          </span>
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Name + badge + timestamp */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span
              className={cn(
                "text-sm truncate",
                hasUnread ? "font-bold text-black" : "font-heading font-bold text-[#212121]",
              )}
            >
              {conv.name}, {conv.age}
            </span>
            <MiniBadge level={conv.verificationLevel} />
          </div>
          <span className="text-[8px] text-[#9E9E9E] flex-shrink-0 tabular-nums uppercase tracking-wider">
            {conv.lastMessage.timestamp}
          </span>
        </div>

        {/* Row 2: City */}
        <p className="text-[8px] text-[#9E9E9E] m-0 mb-0.5 uppercase tracking-wider">
          {conv.city}
        </p>

        {/* Row 3: Last message + unread badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 text-[11px] truncate">
            <MessagePreview msg={conv.lastMessage} isTyping={conv.isTyping} />
          </div>
          {hasUnread && (
            <span
              className={cn(
                "min-w-[18px] h-[18px] px-1",
                "flex items-center justify-center",
                "bg-black text-white border-[2px] border-black",
                "text-[8px] font-bold leading-none",
              )}
            >
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── New Match Banner ────────────────────────────────────────────────────────

function NewMatchBanner({ matches }: { matches: ConversationSummary[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b-[2px] border-black bg-[#FFFEF5]">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[#FFD700]" strokeWidth={2} fill="#FFD700" />
        <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-black">
          New Matches
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/messages/${m.id}`}
            className="flex flex-col items-center gap-1 flex-shrink-0 no-underline"
          >
            <div
              className="w-14 h-14 border-[2px] border-[#FFD700] shadow-[2px_2px_0px_#000000] flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${m.gradientFrom}, ${m.gradientTo})`,
              }}
            >
              <span className="text-base font-heading font-bold text-black select-none">
                {m.initials}
              </span>
            </div>
            <span className="text-[8px] font-bold text-black uppercase tracking-wider text-center max-w-[56px] truncate">
              {m.name.split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Search Overlay ──────────────────────────────────────────────────────────

function SearchOverlay({
  isOpen,
  onClose,
  conversations,
}: {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
}) {
  const [query, setQuery] = useState("");
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[3px] border-black max-h-[80vh] overflow-hidden safe-bottom"
          >
            <div className="px-4 py-3 border-b-[2px] border-black flex items-center gap-2">
              <Search className="w-4 h-4 text-[#9E9E9E]" strokeWidth={2} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                autoFocus
                className="flex-1 text-sm text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic bg-transparent border-none outline-none"
              />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8] cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[65vh]">
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-[#9E9E9E] py-12">
                  {query ? "No conversations found" : "Type to search"}
                </p>
              ) : (
                filtered.map((conv) => (
                  <div key={conv.id} onClick={onClose}>
                    <ChatListItem conv={conv} />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChatListSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 border-b border-dashed border-[#E0E0E0]"
        >
          <div className="w-11 h-11 shimmer-bg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-32 shimmer-bg" />
            <div className="h-2 w-16 shimmer-bg" />
            <div className="h-3 w-48 shimmer-bg" />
          </div>
        </div>
      ))}
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
        No Conversations Yet
      </h3>
      <p className="text-xs text-[#9E9E9E] max-w-xs mx-auto m-0">
        Start exploring matches to begin meaningful conversations!
      </p>
      <Link
        href="/discover"
        className={cn(
          "inline-flex items-center gap-2 mt-4 px-4 py-2 no-underline",
          "border-[2px] border-black bg-black text-white",
          "shadow-[3px_3px_0px_#000000]",
          "text-[10px] font-heading font-bold uppercase tracking-wider",
          "hover:bg-[#424242] transition-colors duration-100",
        )}
      >
        <Heart className="w-3.5 h-3.5" strokeWidth={2} />
        Explore Matches
      </Link>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ChatList({
  conversations,
  isLoading = false,
  filter = "all",
  onFilterChange,
  className,
}: ChatListProps) {
  const [showSearch, setShowSearch] = useState(false);

  const filtered = conversations.filter((c) => {
    if (filter === "unread") return c.unreadCount > 0;
    if (filter === "online") return c.isOnline;
    return true;
  });

  const newMatches = conversations.filter((c) => c.isNewMatch);
  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length;

  return (
    <div className={cn("min-h-screen bg-white", className)}>
      {/* ── Header ── */}
      <div className="px-4 pt-2 pb-2 border-b-[2px] border-black">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-heading font-bold text-black uppercase tracking-wide m-0">
              Messages
            </h1>
            <p className="text-[8px] text-[#9E9E9E] uppercase tracking-widest m-0">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            aria-label="Search conversations"
            className={cn(
              "w-9 h-9 flex items-center justify-center",
              "border-[2px] border-black bg-white cursor-pointer",
              "shadow-[2px_2px_0px_#000000]",
              "hover:bg-[#F8F8F8] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
              "transition-all duration-100",
            )}
          >
            <Search className="w-4 h-4 text-black" strokeWidth={2} />
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {(["all", "unread", "online"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange?.(f)}
              aria-pressed={filter === f}
              className={cn(
                "px-2.5 py-1 border-[2px] cursor-pointer",
                "text-[8px] font-heading font-bold uppercase tracking-widest",
                "transition-all duration-100",
                filter === f
                  ? "border-black bg-black text-white shadow-none translate-x-[1px] translate-y-[1px]"
                  : "border-black bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-[#F8F8F8]",
              )}
            >
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── New match banner ── */}
      <NewMatchBanner matches={newMatches} />

      {/* ── List ── */}
      {isLoading ? (
        <ChatListSkeleton />
      ) : filtered.length === 0 && conversations.length > 0 ? (
        <p className="text-center text-xs text-[#9E9E9E] py-12">
          No {filter} conversations
        </p>
      ) : conversations.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {filtered.map((conv) => (
            <ChatListItem key={conv.id} conv={conv} />
          ))}
        </div>
      )}

      {/* Search overlay */}
      <SearchOverlay
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        conversations={conversations}
      />
    </div>
  );
}

export default ChatList;
