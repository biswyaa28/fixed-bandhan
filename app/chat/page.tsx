"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MessageCircle,
  Shield,
  ShieldCheck,
  Clock,
  Image,
  Mic,
  Send,
  Heart,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ChatConversation {
  id: string;
  profileId: string;
  name: string;
  avatarUrl: string;
  verificationLevel: "bronze" | "silver" | "gold";
  lastActive: string;
  isOnline: boolean;
  lastMessage: {
    text?: string;
    type: "text" | "photo" | "voice" | "interest";
    isFromMe: boolean;
    timestamp: string;
  };
  unreadCount: number;
  matchedDate: string;
  matchedDaysAgo: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const mockConversations: ChatConversation[] = [
  {
    id: "1",
    profileId: "p1",
    name: "Priya Sharma",
    avatarUrl: "/avatars/priya.jpg",
    verificationLevel: "gold",
    lastActive: "Online",
    isOnline: true,
    lastMessage: {
      text: "Thanks for the voice note! I loved hearing about your...",
      type: "text",
      isFromMe: false,
      timestamp: "2m ago",
    },
    unreadCount: 2,
    matchedDate: "3 days ago",
    matchedDaysAgo: 3,
  },
  {
    id: "2",
    profileId: "p2",
    name: "Ananya Iyer",
    avatarUrl: "/avatars/ananya.jpg",
    verificationLevel: "silver",
    lastActive: "2h ago",
    isOnline: false,
    lastMessage: {
      text: "Would love to know more about your family values",
      type: "text",
      isFromMe: true,
      timestamp: "5h ago",
    },
    unreadCount: 0,
    matchedDate: "1 week ago",
    matchedDaysAgo: 7,
  },
  {
    id: "3",
    profileId: "p3",
    name: "Sneha Patel",
    avatarUrl: "/avatars/sneha.jpg",
    verificationLevel: "gold",
    lastActive: "Yesterday",
    isOnline: false,
    lastMessage: {
      text: "Sent you a voice introduction",
      type: "voice",
      isFromMe: false,
      timestamp: "1d ago",
    },
    unreadCount: 1,
    matchedDate: "2 weeks ago",
    matchedDaysAgo: 14,
  },
  {
    id: "4",
    profileId: "p4",
    name: "Kavya Nair",
    avatarUrl: "/avatars/kavya.jpg",
    verificationLevel: "bronze",
    lastActive: "3d ago",
    isOnline: false,
    lastMessage: {
      text: "Sent you an interest",
      type: "interest",
      isFromMe: true,
      timestamp: "3d ago",
    },
    unreadCount: 0,
    matchedDate: "3 weeks ago",
    matchedDaysAgo: 21,
  },
  {
    id: "5",
    profileId: "p5",
    name: "Riya Gupta",
    avatarUrl: "/avatars/riya.jpg",
    verificationLevel: "silver",
    lastActive: "5d ago",
    isOnline: false,
    lastMessage: {
      text: "📷 Photo",
      type: "photo",
      isFromMe: false,
      timestamp: "5d ago",
    },
    unreadCount: 0,
    matchedDate: "1 month ago",
    matchedDaysAgo: 30,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────
function VerificationBadge({
  level,
  size = "sm",
}: {
  level: "bronze" | "silver" | "gold";
  size?: "sm" | "xs";
}) {
  const config = {
    bronze: {
      color: "text-amber-700 bg-amber-500/20 border-amber-500/30",
      icon: Shield,
    },
    silver: {
      color: "text-midnight-200 bg-white/20 border-white/30",
      icon: Shield,
    },
    gold: {
      color: "text-gold-500 bg-gold-500/20 border-gold-500/30",
      icon: ShieldCheck,
    },
  };

  const Icon = config[level].icon;
  const sizeClasses = size === "sm" ? "w-3.5 h-3.5 p-1.5" : "w-2.5 h-2.5 p-0.5";

  return (
    <div
      className={cn(
        "rounded-full border flex items-center justify-center",
        sizeClasses,
        config[level].color,
      )}
    >
      <Icon className="w-full h-full" />
    </div>
  );
}

function ChatListItem({
  conversation,
  onClick,
}: {
  conversation: ChatConversation;
  onClick: () => void;
}) {
  const getMessagePreview = (msg: ChatConversation["lastMessage"]) => {
    switch (msg.type) {
      case "photo":
        return (
          <span className="flex items-center gap-1 text-ink-400">
            <Image className="w-3 h-3" />
            <span>Photo</span>
          </span>
        );
      case "voice":
        return (
          <span className="flex items-center gap-1 text-ink-400">
            <Mic className="w-3 h-3" />
            <span>Voice note</span>
          </span>
        );
      case "interest":
        return (
          <span className="flex items-center gap-1 text-blush-500">
            <Heart className="w-3 h-3" />
            <span>Interest sent</span>
          </span>
        );
      default:
        return (
          <span className="truncate text-ink-400">
            {msg.isFromMe && (
              <span className="text-ink-500 font-medium">You: </span>
            )}
            {msg.text}
          </span>
        );
    }
  };

  const formatLastActive = (lastActive: string) => {
    if (lastActive === "Online") return "Online";
    return lastActive;
  };

  const avatarColors = [
    "bg-lavender-100 text-lavender-700",
    "bg-blush-100 text-blush-700",
    "bg-peach-100 text-peach-700",
    "bg-sage-100 text-sage-700",
    "bg-sky-100 text-sky-700",
  ];
  const colorIdx = conversation.name.charCodeAt(0) % avatarColors.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 px-4 py-3.5 cursor-pointer",
        "border-b border-ink-50 hover:bg-ink-50/60",
        "transition-colors duration-100",
        conversation.unreadCount > 0 && "bg-lavender-50/40",
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold border",
            avatarColors[colorIdx],
            "border-white shadow-sm",
          )}
        >
          {conversation.name.charAt(0)}
        </div>
        {conversation.isOnline && (
          <>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-sage-400 border-2 border-white block" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-sage-400 animate-ping opacity-60" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3
            className={cn(
              "text-[14px] truncate",
              conversation.unreadCount > 0
                ? "font-bold text-ink-900"
                : "font-semibold text-ink-700",
            )}
          >
            {conversation.name}
          </h3>
          <span
            className={cn(
              "text-[11px] shrink-0 ml-2 tabular-nums",
              conversation.isOnline
                ? "text-sage-500 font-medium"
                : "text-ink-300",
            )}
          >
            {formatLastActive(conversation.lastActive)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 text-xs text-ink-400 truncate">
            {getMessagePreview(conversation.lastMessage)}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-ink-300 tabular-nums">
              {conversation.lastMessage.timestamp}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Match date */}
        <p className="text-[10px] text-ink-300 mt-0.5 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          Matched {conversation.matchedDate}
        </p>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-lavender-100 border border-lavender-200 flex items-center justify-center mb-5 shadow-sm">
        <MessageCircle
          className="w-9 h-9 text-lavender-400"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-lg font-bold text-ink-900 mb-1.5">
        No conversations yet
      </h3>
      <p className="text-sm text-ink-500 mb-6 max-w-xs leading-relaxed">
        Start exploring matches to begin meaningful conversations!
      </p>
      <motion.a
        href="/matches"
        whileTap={{ scale: 0.97 }}
        className="px-6 py-2.5 rounded-2xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-700 transition-colors"
      >
        Explore Matches
      </motion.a>
    </motion.div>
  );
}

function SearchModal({
  isOpen,
  onClose,
  conversations,
}: {
  isOpen: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
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
            className="fixed inset-0 bg-ink-900/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[82vh] overflow-hidden safe-bottom"
          >
            <div className="p-4">
              {/* Handle */}
              <div className="w-10 h-1 bg-ink-200 rounded-full mx-auto mb-4" />

              {/* Search input */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations…"
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl border border-ink-200 text-ink-500 hover:bg-ink-50 hover:text-ink-700 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              {/* Results */}
              <div className="overflow-y-auto max-h-[60vh]">
                {filtered.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-ink-400">
                      {query ? "No results found" : "Start typing to search"}
                    </p>
                  </div>
                ) : (
                  filtered.map((conv) => (
                    <ChatListItem
                      key={conv.id}
                      conversation={conv}
                      onClick={onClose}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatListPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");

  // Pull to refresh simulation
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    // Simulate loading conversations
    const timer = setTimeout(() => {
      setConversations(mockConversations);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Simulate new messages
    setConversations((prev) => [
      {
        ...prev[0],
        unreadCount: prev[0].unreadCount + 1,
        lastMessage: {
          ...prev[0].lastMessage,
          timestamp: "Just now",
        },
      },
      ...prev.slice(1),
    ]);
    setIsRefreshing(false);
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    if (filter === "unread") return conv.unreadCount > 0;
    if (filter === "online") return conv.isOnline;
    return true;
  });

  return (
    <div className="min-h-screen bg-white safe-top pb-24">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-ink-100 safe-top">
        <div className="max-w-lg mx-auto px-4 pt-14 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[1.2rem] font-bold text-ink-900 tracking-tight">
                Messages
              </h1>
              <p className="text-[11px] text-ink-400">
                {conversations.filter((c) => c.unreadCount > 0).length} unread
              </p>
            </div>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-xl border border-ink-200 text-ink-500 hover:text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5">
            {(["all", "unread", "online"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-semibold transition-all",
                  filter === f
                    ? "bg-ink-900 text-white shadow-sm"
                    : "bg-ink-100 text-ink-500 hover:bg-ink-200",
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "unread" &&
                  conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                    <span
                      className={cn(
                        "ml-1 font-bold",
                        filter === f ? "text-blush-300" : "text-blush-500",
                      )}
                    >
                      {conversations.filter((c) => c.unreadCount > 0).length}
                    </span>
                  )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Refresh indicator ── */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-lavender-50 border-b border-lavender-100"
          >
            <div className="flex items-center justify-center gap-2 py-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-3.5 h-3.5 text-lavender-500" />
              </motion.div>
              <span className="text-xs text-lavender-600 font-medium">
                Refreshing…
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat List ── */}
      <main className="max-w-lg mx-auto">
        {isLoading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-4 py-3.5 border-b border-ink-50"
              >
                <div className="w-12 h-12 rounded-2xl shimmer-bg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 rounded shimmer-bg" />
                  <div className="h-2.5 w-44 rounded shimmer-bg" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            <AnimatePresence>
              {filteredConversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <ChatListItem
                    conversation={conv}
                    onClick={() => console.log("Navigate to chat:", conv.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ── New Chat FAB ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-24 right-5 z-20 w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-ink-900 flex items-center justify-center shadow-lg hover:bg-ink-700 transition-colors safe-bottom"
      >
        <Plus className="w-5 h-5 text-white" />
      </motion.button>

      {/* ── Search Modal ── */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        conversations={conversations}
      />
    </div>
  );
}
