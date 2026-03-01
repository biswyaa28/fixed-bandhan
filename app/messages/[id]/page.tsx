/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Individual Chat Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: /messages/[id]
 *
 * Full chat view with:
 *   • Header: name, badge, video call, safety
 *   • Messages area with ChatBubble (sent/received)
 *   • Typing indicator
 *   • ChatInput with voice/photo
 *   • Floating SafetyButton
 *   • "Appreciate This" context menu on long-press
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Video, Shield, ShieldCheck, Heart, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { type ChatMessage, ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SafetyButton } from "@/components/chat/SafetyButton";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatProfile {
  id: string;
  name: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  verificationLevel: "bronze" | "silver" | "gold";
  isOnline: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PROFILE: ChatProfile = {
  id: "p1",
  name: "Priya Sharma",
  initials: "PS",
  gradientFrom: "#EDE9FE",
  gradientTo: "#DDD6FE",
  verificationLevel: "gold",
  isOnline: true,
};

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    type: "text",
    content: "Hi! Thanks for connecting. I saw you like traveling too!",
    isFromMe: false,
    timestamp: "10:30 AM",
    status: "read",
  },
  {
    id: "m2",
    type: "text",
    content:
      "Yes! I just came back from a trip to Rajasthan. The culture there is amazing.",
    isFromMe: true,
    timestamp: "10:32 AM",
    status: "read",
  },
  {
    id: "m3",
    type: "text",
    content: "Oh wow! I've always wanted to visit Jaipur. How was your experience?",
    isFromMe: false,
    timestamp: "10:35 AM",
    status: "read",
  },
  {
    id: "m4",
    type: "photo",
    content: "/photos/jaipur.jpg",
    isFromMe: true,
    timestamp: "10:36 AM",
    status: "read",
    isBlurred: true,
  },
  {
    id: "m5",
    type: "voice",
    content: "voice_note_1.webm",
    isFromMe: false,
    timestamp: "10:38 AM",
    status: "read",
    duration: 12,
  },
  {
    id: "m6",
    type: "text",
    content: "That voice note was so sweet! Your voice is very calming 🙏",
    isFromMe: true,
    timestamp: "10:40 AM",
    status: "delivered",
  },
  {
    id: "m7",
    type: "text",
    content: "Thank you! Would you like to share more about yourself?",
    isFromMe: false,
    timestamp: "10:42 AM",
    status: "read",
  },
];

// ─── Verification Badge ──────────────────────────────────────────────────────

const VERIF = {
  bronze: { bg: "bg-[#E0E0E0]", letter: "B", label: "Phone Verified", Icon: Shield },
  silver: { bg: "bg-[#9E9E9E]", letter: "S", label: "ID Verified", Icon: Shield },
  gold: {
    bg: "bg-[#424242] text-white",
    letter: "G",
    label: "Gold Verified",
    Icon: ShieldCheck,
  },
} as const;

function VerifBadge({ level }: { level: "bronze" | "silver" | "gold" }) {
  const cfg = VERIF[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 border border-black px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider",
        cfg.bg,
      )}
    >
      <cfg.Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

// ─── Appreciate Modal ────────────────────────────────────────────────────────

function AppreciateModal({
  message,
  onClose,
  onSend,
}: {
  message: ChatMessage;
  onClose: () => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const suggestions = [
    "Love this!",
    "This made my day 😊",
    "You're so thoughtful",
    "Tell me more!",
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t-[3px] border-black bg-white safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-label="Appreciate this message"
      >
        <div className="flex items-center justify-between border-b-[2px] border-black px-4 py-3">
          <h2 className="m-0 font-heading text-sm font-bold uppercase tracking-wide text-black">
            ❤️ Appreciate This
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8]"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-black" strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-4">
          {/* Referenced message preview */}
          <div className="mb-3 border border-[#E0E0E0] bg-[#F8F8F8] px-3 py-2">
            <p className="m-0 mb-0.5 text-[10px] uppercase tracking-wider text-[#9E9E9E]">
              Replying to:
            </p>
            <p className="m-0 line-clamp-2 text-xs text-[#424242]">
              {message.type === "text"
                ? message.content
                : message.type === "voice"
                  ? "🎤 Voice note"
                  : "📷 Photo"}
            </p>
          </div>

          {/* Quick suggestions */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setText(s)}
                className="cursor-pointer border border-[#E0E0E0] bg-[#F8F8F8] px-2 py-1 text-[10px] text-[#424242] transition-colors duration-100 hover:border-black"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input + Send */}
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 100))}
              placeholder="Write something nice…"
              maxLength={100}
              className="h-10 flex-1 border-[2px] border-black bg-white px-3 text-sm text-[#212121] placeholder:italic placeholder:text-[#9E9E9E] focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000] focus:outline-none"
            />
            <button
              onClick={() => {
                if (text.trim()) {
                  onSend(text.trim());
                  onClose();
                }
              }}
              disabled={!text.trim()}
              className={cn(
                "h-10 border-[2px] border-black px-4",
                "font-heading text-[10px] font-bold uppercase tracking-wider",
                "transition-all duration-100",
                text.trim()
                  ? "cursor-pointer bg-black text-white shadow-[2px_2px_0px_#000] hover:bg-[#424242]"
                  : "cursor-not-allowed bg-[#E0E0E0] text-[#9E9E9E]",
              )}
            >
              Send ❤️
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ChatDetailPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [appreciateMsg, setAppreciateMsg] = useState<ChatMessage | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing after load
  useEffect(() => {
    const t = setTimeout(() => setIsTyping(true), 3000);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `auto-${Date.now()}`,
          type: "text",
          content:
            "By the way, what are your thoughts on a vegetarian lifestyle? It's important to my family.",
          isFromMe: false,
          timestamp: new Date().toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          status: "read",
        },
      ]);
    }, 6000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  // ── Handlers ──

  const handleSendText = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: `sent-${Date.now()}`,
      type: "text",
      content: text,
      isFromMe: true,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "sending",
    };
    setMessages((prev) => [...prev, msg]);

    // Simulate status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "sent" } : m)),
      );
    }, 500);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "delivered" } : m)),
      );
    }, 1200);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m)),
      );
    }, 2500);
  }, []);

  const handleSendVoice = useCallback((durationSeconds: number) => {
    const msg: ChatMessage = {
      id: `voice-${Date.now()}`,
      type: "voice",
      content: "voice_note.webm",
      isFromMe: true,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "sent",
      duration: durationSeconds,
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSendPhoto = useCallback(() => {
    const msg: ChatMessage = {
      id: `photo-${Date.now()}`,
      type: "photo",
      content: "/photos/uploaded.jpg",
      isFromMe: true,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "sent",
      isBlurred: true,
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleAppreciate = useCallback((text: string) => {
    // Send as a special "appreciate" text message
    const msg: ChatMessage = {
      id: `appr-${Date.now()}`,
      type: "text",
      content: `❤️ ${text}`,
      isFromMe: true,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "sent",
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const profile = MOCK_PROFILE;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ══════════════════════════════════════════════════════════════
          HEADER
         ══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-[63px] z-30 border-b-[2px] border-black bg-white">
        <div className="flex items-center gap-2 px-2 py-2">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className={cn(
              "flex h-9 w-9 items-center justify-center",
              "cursor-pointer border-[2px] border-black bg-white",
              "shadow-[2px_2px_0px_#000000]",
              "hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#F8F8F8] hover:shadow-[1px_1px_0px_#000000]",
              "transition-all duration-100",
            )}
          >
            <ArrowLeft className="h-4 w-4 text-black" strokeWidth={2.5} />
          </button>

          {/* Avatar */}
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-[2px] border-black"
            style={{
              background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
            }}
          >
            <span className="select-none font-heading text-xs font-bold text-black">
              {profile.initials}
            </span>
          </div>

          {/* Name + badge + status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-heading text-sm font-bold text-black">
                {profile.name}
              </span>
              <VerifBadge level={profile.verificationLevel} />
            </div>
            <div className="flex items-center gap-1">
              {profile.isOnline && (
                <span className="h-1.5 w-1.5 bg-black" aria-hidden="true" />
              )}
              <span className="text-[8px] uppercase tracking-wider text-[#9E9E9E]">
                {profile.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Video call */}
          <button
            aria-label="Video call"
            className={cn(
              "flex h-9 w-9 items-center justify-center",
              "cursor-pointer border-[2px] border-black bg-white",
              "shadow-[2px_2px_0px_#000000]",
              "hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#F8F8F8] hover:shadow-[1px_1px_0px_#000000]",
              "transition-all duration-100",
            )}
          >
            <Video className="h-4 w-4 text-black" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          SAFETY TIP BANNER
         ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 border-b border-dashed border-[#E0E0E0] bg-[#FFFEF5] px-4 py-2">
        <Shield className="h-3.5 w-3.5 flex-shrink-0 text-[#FFD700]" strokeWidth={2} />
        <p className="m-0 text-[9px] text-[#9E9E9E]">
          <span className="font-bold text-[#424242]">Safety Tip:</span> Never share
          personal info like phone number or address until you trust this person.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MESSAGES AREA
         ══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {/* Match date banner */}
        <div className="mb-4 flex items-center justify-center">
          <div className="border border-[#E0E0E0] bg-[#F8F8F8] px-3 py-1">
            <span className="flex items-center gap-1 text-[8px] uppercase tracking-wider text-[#9E9E9E]">
              <Heart className="h-3 w-3" strokeWidth={2} />
              Matched 3 days ago
            </span>
          </div>
        </div>

        {/* Messages */}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onLongPress={(m) => setAppreciateMsg(m)}
            onPhotoReveal={(id) => {
              // Mark photo as revealed
              setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, isBlurred: false } : m)),
              );
            }}
          />
        ))}

        {/* Typing indicator */}
        <TypingIndicator name={profile.name.split(" ")[0]} visible={isTyping} />

        <div ref={endRef} />
      </main>

      {/* ══════════════════════════════════════════════════════════════
          INPUT BAR
         ══════════════════════════════════════════════════════════════ */}
      <div className="sticky bottom-0 z-20 safe-bottom">
        <ChatInput
          onSendText={handleSendText}
          onSendVoice={handleSendVoice}
          onSendPhoto={handleSendPhoto}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SAFETY FAB
         ══════════════════════════════════════════════════════════════ */}
      <SafetyButton
        otherPersonName={profile.name}
        onBlock={() => void 0}
        onReport={() => void 0}
        onShareDate={() => void 0}
        onEmergencySOS={() => {
          if (typeof window !== "undefined") {
            window.location.href = "tel:1091";
          }
        }}
      />

      {/* ══════════════════════════════════════════════════════════════
          APPRECIATE MODAL
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {appreciateMsg && (
          <AppreciateModal
            message={appreciateMsg}
            onClose={() => setAppreciateMsg(null)}
            onSend={handleAppreciate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
