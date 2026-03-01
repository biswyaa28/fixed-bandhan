/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Floating Feedback Button
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Fixed-position button on every screen (bottom-left).
 * Tap → opens FeedbackModal.
 *
 * Styled: Comic book aesthetic — thick border, hard shadow, square icon.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

interface FeedbackButtonProps {
  userId: string;
  userName: string;
}

export default function FeedbackButton({ userId, userName }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-20 left-4 z-40
          w-12 h-12
          flex items-center justify-center
          bg-white border-[3px] border-black
          shadow-[4px_4px_0px_#000]
          hover:translate-x-[2px] hover:translate-y-[2px]
          hover:shadow-[2px_2px_0px_#000]
          active:translate-x-[4px] active:translate-y-[4px]
          active:shadow-none
          transition-all duration-150
        "
        aria-label="Send feedback"
        title="Send us feedback"
      >
        <MessageCircle size={20} strokeWidth={2.5} className="text-[#212121]" />
      </button>

      {open && (
        <FeedbackModal
          userId={userId}
          userName={userName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
