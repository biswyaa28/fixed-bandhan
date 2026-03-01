/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Appreciate Modal ("Appreciate This" Comment)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Slide-up modal for sending an appreciation message on a specific
 * profile element (photo, prompt, bio):
 *   • "Appreciate this photo/prompt" header
 *   • Quick-reply chips
 *   • Custom comment input (max 100 chars)
 *   • Preview of message as it will appear
 *   • Send button with heart icon
 *
 * Comic-book aesthetic: 4px border, black header, hard shadow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface AppreciateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which element is being appreciated, e.g. "Travel Photo" or "Bio" */
  targetLabel: string;
  /** Profile name this appreciation goes to */
  recipientName: string;
  onSend: (message: string) => void;
}

// ─── Quick Message Chips ─────────────────────────────────────────────────

const QUICK_MSGS = [
  "Love this! 😊",
  "This resonates with me",
  "We have this in common!",
  "Great taste! 👏",
  "Tell me more!",
  "बहुत अच्छा! 🙏",
];

// ─── Component ───────────────────────────────────────────────────────────

export function AppreciateModal({
  isOpen,
  onClose,
  targetLabel,
  recipientName,
  onSend,
}: AppreciateModalProps) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setSent(false);
      // Auto-focus with small delay for animation
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setSent(true);
    // Auto-close after success animation
    setTimeout(onClose, 1200);
  }, [message, onSend, onClose]);

  const handleQuick = useCallback(
    (text: string) => {
      onSend(text);
      setSent(true);
      setTimeout(onClose, 1200);
    },
    [onSend, onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Appreciate ${targetLabel}`}
            className="relative w-full max-w-[420px] sm:mx-4 bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black text-white border-b-[2px] border-black">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider">
                  Appreciate This
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer border-none"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
              {!sent ? (
                <>
                  {/* Target label */}
                  <p className="text-[9px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest m-0 mb-3">
                    Appreciating: <span className="text-black">{targetLabel}</span> · To {recipientName}
                  </p>

                  {/* Quick message chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {QUICK_MSGS.map((msg) => (
                      <button
                        key={msg}
                        onClick={() => handleQuick(msg)}
                        className={cn(
                          "px-2.5 py-1.5 text-[10px] font-bold",
                          "border-[2px] border-black bg-[#F8F8F8] text-[#424242]",
                          "cursor-pointer hover:bg-black hover:text-white",
                          "transition-colors duration-100",
                        )}
                      >
                        {msg}
                      </button>
                    ))}
                  </div>

                  {/* Custom message input */}
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Write something specific..."
                      className="flex-1 px-3 py-2.5 text-sm border-[2px] border-black bg-white text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic outline-none focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]"
                      maxLength={100}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center border-[3px] border-black cursor-pointer",
                        message.trim()
                          ? "bg-black text-white shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]"
                          : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-not-allowed",
                        "transition-[transform,box-shadow] duration-150",
                      )}
                      aria-label="Send appreciation"
                    >
                      <Send className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[8px] text-[#9E9E9E] m-0">{message.length}/100</p>
                  </div>

                  {/* Live preview */}
                  {message.trim() && (
                    <div className="mt-3 border-[2px] border-dashed border-[#E0E0E0] bg-[#F8F8F8] px-3 py-2">
                      <p className="text-[7px] font-bold text-[#9E9E9E] uppercase tracking-widest m-0 mb-1">
                        Preview
                      </p>
                      <p className="text-xs text-[#424242] m-0">
                        <Heart className="w-3 h-3 inline text-[#EF476F] mr-1" strokeWidth={2} fill="#EF476F" />
                        <span className="font-bold">Appreciated your {targetLabel.toLowerCase()}:</span>{" "}
                        &ldquo;{message.trim()}&rdquo;
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Success state */
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="w-14 h-14 mx-auto mb-3 bg-[#F8F8F8] border-[2px] border-black flex items-center justify-center"
                  >
                    <Heart className="w-7 h-7 text-[#EF476F]" strokeWidth={2} fill="#EF476F" />
                  </motion.div>
                  <p className="text-sm font-heading font-bold text-black uppercase m-0">
                    Appreciation Sent!
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mt-1">
                    {recipientName} will see your message with interest
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AppreciateModal;
