/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Chat Conversations List
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Shows all active matches as a chat list, sorted by last message time.
 * Real-time updates via onSnapshot on the matches collection.
 *
 * Features:
 *   • Unread count badge per conversation
 *   • Online status indicator
 *   • Last message preview + timestamp
 *   • Verification badge
 *   • Empty state with CTA
 *   • Skeleton loading
 *   • Comic book monochrome aesthetic
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Search,
  Mic,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";

import { firebaseDb } from "@/lib/firebase/config";
import { COLLECTIONS, type MatchDocument } from "@/lib/firebase/schema";
import { getUserProfiles } from "@/lib/firebase/users";
import type { UserDocument } from "@/lib/firebase/schema";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { VerificationTier } from "@/components/VerificationBadge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface ChatListProps {
  userId: string;
  onSelectChat: (matchId: string, otherUser: UserDocument) => void;
  selectedMatchId?: string | null;
}

interface ChatItem {
  matchId: string;
  match: MatchDocument;
  otherUser: UserDocument;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatRelativeTime(ts: any): string {
  if (!ts) return "";
  let millis: number;
  if (typeof ts === "string") millis = new Date(ts).getTime();
  else if (typeof ts?.toMillis === "function") millis = ts.toMillis();
  else return "";

  const diff = Date.now() - millis;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(millis).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getPreviewIcon(preview: string | null) {
  if (!preview) return null;
  if (preview.startsWith("🎤")) return <Mic className="w-3 h-3 text-[#9E9E9E] flex-shrink-0" strokeWidth={2.5} />;
  if (preview.startsWith("📷")) return <ImageIcon className="w-3 h-3 text-[#9E9E9E] flex-shrink-0" strokeWidth={2.5} />;
  return null;
}

// ─── Skeleton ────────────────────────────────────────────────────────────

function ChatItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-[#E0E0E0]">
      <div className="w-10 h-10 bg-[#E0E0E0] border-2 border-[#E0E0E0] animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-[#E0E0E0] animate-pulse" />
        <div className="h-2.5 w-40 bg-[#E0E0E0] animate-pulse" />
      </div>
      <div className="h-2.5 w-8 bg-[#E0E0E0] animate-pulse" />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────

function EmptyChats() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 flex items-center justify-center border-2 border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000] mb-5">
        <MessageCircle className="w-6 h-6 text-[#9E9E9E]" strokeWidth={2} />
      </div>
      <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-2">
        No conversations yet
      </h3>
      <p className="text-xs text-[#9E9E9E] max-w-[220px] leading-relaxed">
        Match with someone to start chatting. Head to the discovery feed to find your match!
      </p>
    </div>
  );
}

// ─── Chat row ────────────────────────────────────────────────────────────

function ChatRow({
  item,
  userId,
  isSelected,
  onSelect,
}: {
  item: ChatItem;
  userId: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { match, otherUser } = item;
  const unread = match.unreadCount?.[userId] ?? 0;
  const isFromMe = match.lastMessageSenderId === userId;
  const initials = otherUser.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer",
        "border-b-2 border-[#E0E0E0] transition-colors duration-100",
        isSelected
          ? "bg-[#F8F8F8] border-l-[3px] border-l-black"
          : "bg-white hover:bg-[#F8F8F8]",
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {otherUser.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={otherUser.avatarUrl}
            alt={otherUser.name}
            className="w-10 h-10 object-cover border-2 border-black"
          />
        ) : (
          <div className="w-10 h-10 bg-[#E0E0E0] border-2 border-black flex items-center justify-center">
            <span className="text-xs font-bold text-black">{initials}</span>
          </div>
        )}
        {/* Online dot */}
        {otherUser.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-black border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={cn(
              "text-xs font-bold truncate",
              unread > 0 ? "text-black" : "text-[#424242]",
            )}
          >
            {otherUser.name}
          </span>
          <VerificationBadge
            tier={otherUser.verificationLevel as VerificationTier}
            size="sm"
            showTooltip={false}
          />
        </div>

        <div className="flex items-center gap-1">
          {isFromMe && (
            <span className="text-[10px] text-[#9E9E9E] flex-shrink-0">You:</span>
          )}
          {getPreviewIcon(match.lastMessagePreview)}
          <p
            className={cn(
              "text-[11px] truncate",
              unread > 0 ? "text-[#212121] font-bold" : "text-[#9E9E9E]",
            )}
          >
            {match.lastMessagePreview || "Say hello!"}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-[9px] text-[#9E9E9E] font-bold">
          {formatRelativeTime(match.lastMessageAt)}
        </span>
        {unread > 0 && (
          <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-black text-white text-[9px] font-bold">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ChatList({
  userId,
  onSelectChat,
  selectedMatchId,
}: ChatListProps) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Real-time listener for matches
  useEffect(() => {
    const db = firebaseDb();
    const matchesRef = collection(db, COLLECTIONS.MATCHES);

    // Listen for matches involving this user (user1 side)
    const q1 = query(
      matchesRef,
      where("user1Id", "==", userId),
      where("status", "==", "active"),
    );
    const q2 = query(
      matchesRef,
      where("user2Id", "==", userId),
      where("status", "==", "active"),
    );

    let items1: { id: string; data: MatchDocument }[] = [];
    let items2: { id: string; data: MatchDocument }[] = [];
    let profiles: Map<string, UserDocument> = new Map();
    let loaded1 = false;
    let loaded2 = false;

    const rebuild = async () => {
      if (!loaded1 || !loaded2) return;

      const all = [...items1, ...items2];
      const otherUids = all.map((m) =>
        m.data.user1Id === userId ? m.data.user2Id : m.data.user1Id,
      );

      // Only fetch profiles we don't have yet
      const missing = otherUids.filter((uid) => !profiles.has(uid));
      if (missing.length > 0) {
        try {
          const fetched = await getUserProfiles(missing);
          fetched.forEach((u) => profiles.set(u.uid, u));
        } catch {
          // Non-fatal
        }
      }

      const chatItems: ChatItem[] = all
        .map((m) => {
          const otherUid = m.data.user1Id === userId ? m.data.user2Id : m.data.user1Id;
          const otherUser = profiles.get(otherUid);
          if (!otherUser) return null;
          return { matchId: m.id, match: m.data, otherUser };
        })
        .filter((c): c is ChatItem => c !== null);

      // Sort by lastMessageAt desc
      chatItems.sort((a, b) => {
        const aT = toMillis(a.match.lastMessageAt);
        const bT = toMillis(b.match.lastMessageAt);
        return bT - aT;
      });

      setChats(chatItems);
      setIsLoading(false);
    };

    const unsub1 = onSnapshot(q1, (snap) => {
      items1 = snap.docs.map((d) => ({ id: d.id, data: d.data() as MatchDocument }));
      loaded1 = true;
      rebuild();
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      items2 = snap.docs.map((d) => ({ id: d.id, data: d.data() as MatchDocument }));
      loaded2 = true;
      rebuild();
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId]);

  // Filter by search
  const filtered = search.trim()
    ? chats.filter((c) =>
        c.otherUser.name.toLowerCase().includes(search.toLowerCase()),
      )
    : chats;

  return (
    <div className="flex flex-col h-full bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b-2 border-black bg-[#F8F8F8]">
        <h2 className="text-xs font-bold text-black uppercase tracking-wider mb-2">
          Messages
        </h2>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9E9E9E]"
            strokeWidth={2.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className={cn(
              "w-full pl-8 pr-8 py-2 text-xs text-[#212121] bg-white placeholder-[#9E9E9E]",
              "border-2 border-black outline-none",
              "focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
              "transition-shadow duration-150",
            )}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0"
            >
              <X className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <>
            <ChatItemSkeleton />
            <ChatItemSkeleton />
            <ChatItemSkeleton />
          </>
        )}

        {!isLoading && filtered.length === 0 && <EmptyChats />}

        <AnimatePresence initial={false}>
          {!isLoading &&
            filtered.map((item) => (
              <motion.div
                key={item.matchId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <ChatRow
                  item={item}
                  userId={userId}
                  isSelected={item.matchId === selectedMatchId}
                  onSelect={() => onSelectChat(item.matchId, item.otherUser)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === "string") return new Date(ts).getTime();
  if (typeof ts?.toMillis === "function") return ts.toMillis();
  return 0;
}

export default ChatList;
