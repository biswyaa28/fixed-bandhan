/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Chat Input Bar (Comic Book Style)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Fixed bottom input area with:
 *   • Paperclip (attach photo)
 *   • Text input with 2px black border
 *   • Mic button (opens voice recording modal, max 15s)
 *   • Send button (appears when text is entered)
 *
 * Voice recording modal: blocky timer, red pulsing dot, cancel/send.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Mic, Send, X, Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ChatInputProps {
  onSendText?: (text: string) => void;
  onSendVoice?: (durationSeconds: number) => void;
  onSendPhoto?: () => void;
  /** Disable input (e.g. blocked user) */
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_VOICE_SECONDS = 15;

// ─── Component ───────────────────────────────────────────────────────────────

export function ChatInput({
  onSendText,
  onSendVoice,
  onSendPhoto,
  disabled = false,
  placeholder = "Type a message…",
  className,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Send text ──
  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText?.(trimmed);
    setText("");
    inputRef.current?.focus();
  }, [text, onSendText]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ── Voice recording ──
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= MAX_VOICE_SECONDS - 1) {
          // Auto-stop at 15s
          stopRecording(prev + 1);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  const stopRecording = useCallback(
    (finalSeconds?: number) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const dur = finalSeconds ?? recordSeconds;
      setIsRecording(false);
      if (dur > 0) {
        onSendVoice?.(dur);
      }
      setRecordSeconds(0);
    },
    [recordSeconds, onSendVoice],
  );

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordSeconds(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const hasText = text.trim().length > 0;

  return (
    <>
      {/* ── Main Input Bar ── */}
      <div
        className={cn(
          "bg-white border-t-[2px] border-black px-3 py-2",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
      >
        {/* Attachment menu */}
        <AnimatePresence>
          {showAttach && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-2"
            >
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAttach(false);
                    onSendPhoto?.();
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2",
                    "border-[2px] border-black bg-white text-[10px] font-heading font-bold uppercase tracking-wider text-black",
                    "shadow-[2px_2px_0px_#000000] cursor-pointer",
                    "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                    "transition-all duration-100",
                  )}
                >
                  <ImageIcon className="w-4 h-4" strokeWidth={2} />
                  Photo
                </button>
                <button
                  onClick={() => {
                    setShowAttach(false);
                    startRecording();
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2",
                    "border-[2px] border-black bg-white text-[10px] font-heading font-bold uppercase tracking-wider text-black",
                    "shadow-[2px_2px_0px_#000000] cursor-pointer",
                    "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                    "transition-all duration-100",
                  )}
                >
                  <Mic className="w-4 h-4" strokeWidth={2} />
                  Voice
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* Attach */}
          <button
            onClick={() => setShowAttach((p) => !p)}
            aria-label="Attach file"
            aria-expanded={showAttach}
            className={cn(
              "w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center",
              "border-[2px] border-black bg-white cursor-pointer",
              "transition-all duration-100",
              showAttach
                ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]"
                : "shadow-[2px_2px_0px_#000000] hover:bg-[#F8F8F8]",
            )}
          >
            <Paperclip className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Message input"
            className={cn(
              "flex-1 h-10 px-3 text-sm",
              "border-[2px] border-black bg-white text-[#212121]",
              "placeholder:text-[#9E9E9E] placeholder:italic",
              "focus:outline-none focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]",
            )}
          />

          {/* Send or Mic */}
          {hasText ? (
            <button
              onClick={handleSend}
              aria-label="Send message"
              className={cn(
                "w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center",
                "border-[2px] border-black bg-black text-white cursor-pointer",
                "shadow-[2px_2px_0px_#000000]",
                "transition-all duration-100",
                "hover:bg-[#424242]",
                "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
              )}
            >
              <Send className="w-4 h-4" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={startRecording}
              aria-label="Record voice note"
              className={cn(
                "w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center",
                "border-[2px] border-black bg-white text-black cursor-pointer",
                "shadow-[2px_2px_0px_#000000]",
                "transition-all duration-100",
                "hover:bg-[#F8F8F8]",
                "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
              )}
            >
              <Mic className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── Voice Recording Modal ── */}
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-8"
              role="dialog"
              aria-modal="true"
              aria-label="Recording voice note"
            >
              <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 w-full max-w-xs text-center">
                {/* Recording dot + timer */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="w-3 h-3 bg-[#EF476F] safety-pulse-btn" aria-hidden="true" />
                  <span className="text-2xl font-heading font-bold text-black tabular-nums">
                    {formatTime(recordSeconds)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#E0E0E0] border border-black mb-1">
                  <div
                    className="h-full bg-black transition-[width] duration-1000 linear"
                    style={{ width: `${(recordSeconds / MAX_VOICE_SECONDS) * 100}%` }}
                  />
                </div>
                <p className="text-[8px] text-[#9E9E9E] uppercase tracking-wider mb-4 m-0">
                  Max {MAX_VOICE_SECONDS}s
                </p>

                {/* Waveform preview (fake) */}
                <div className="flex items-end justify-center gap-[2px] h-8 mb-6" aria-hidden="true">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const active = i < Math.floor((recordSeconds / MAX_VOICE_SECONDS) * 24);
                    const h = 4 + ((i * 7 + 3) % 20);
                    return (
                      <div
                        key={i}
                        className={cn(
                          "w-[4px] transition-colors duration-75",
                          active ? "bg-black" : "bg-[#E0E0E0]",
                        )}
                        style={{ height: `${h}px` }}
                      />
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelRecording}
                    className={cn(
                      "flex-1 py-2.5 border-[2px] border-black bg-white text-black",
                      "text-[10px] font-heading font-bold uppercase tracking-wider cursor-pointer",
                      "shadow-[2px_2px_0px_#000000]",
                      "hover:bg-[#F8F8F8] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                      "transition-all duration-100",
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => stopRecording()}
                    className={cn(
                      "flex-1 py-2.5 border-[2px] border-black bg-black text-white",
                      "text-[10px] font-heading font-bold uppercase tracking-wider cursor-pointer",
                      "shadow-[2px_2px_0px_#000000]",
                      "hover:bg-[#424242] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                      "transition-all duration-100",
                    )}
                  >
                    Send ✓
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatInput;
