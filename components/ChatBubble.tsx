/**
 * Bandhan AI — ChatBubble (Comic Book / 8-Bit)
 *
 * Sent:     white bg, 2px black border, radius 8px 8px 0 8px, right-aligned
 * Received: #F8F8F8 bg, 2px black border, radius 8px 8px 8px 0, left-aligned
 * Tail:     Sharp triangular pointer (comic speech bubble)
 * Padding:  16px (8px grid)
 */

"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck, Mic, Play, Pause } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatBubbleProps {
  message?: string;
  children?: ReactNode;
  isSender?: boolean;
  timestamp?: string;
  status?: MessageStatus;
  avatarUrl?: string;
  senderName?: string;
  showTail?: boolean;
  isVoiceNote?: boolean;
  voiceDuration?: number;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Read Receipt ────────────────────────────────────────────────────────
function ReadReceipt({ status }: { status?: MessageStatus }) {
  if (!status) return null;
  switch (status) {
    case "sending":
      return (
        <span className="inline-block w-3 h-3 bg-[#9E9E9E] animate-pixel-spin" />
      );
    case "sent":
      return <Check className="w-4 h-4 text-[#9E9E9E]" strokeWidth={2.5} />;
    case "delivered":
      return (
        <CheckCheck className="w-4 h-4 text-[#9E9E9E]" strokeWidth={2.5} />
      );
    case "read":
      return <CheckCheck className="w-4 h-4 text-black" strokeWidth={2.5} />;
    default:
      return null;
  }
}

// ─── Waveform (8-bit bars) ───────────────────────────────────────────────
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const barCount = 20;
  const heights = Array.from(
    { length: barCount },
    (_, i) => 20 + Math.sin(i * 0.8) * 15 + Math.cos(i * 1.5) * 10,
  );

  return (
    <div className="flex items-end gap-[2px] h-6 flex-1">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-black origin-bottom"
          style={{ height: `${h}%` }}
          animate={
            isPlaying
              ? {
                  scaleY: [0.3, 1, 0.5, 0.8, 0.3],
                  transition: {
                    duration: 0.4,
                    repeat: Infinity,
                    delay: i * 0.02,
                    ease: "linear",
                  },
                }
              : { scaleY: 1 }
          }
        />
      ))}
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────
export function ChatBubble({
  message,
  children,
  isSender = false,
  timestamp,
  status,
  avatarUrl,
  senderName,
  showTail = true,
  isVoiceNote = false,
  voiceDuration,
  isPlaying = false,
  onPlayToggle,
  className,
}: ChatBubbleProps) {
  const time = formatTime(timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex gap-2",
        isSender ? "ml-auto flex-row-reverse" : "mr-auto",
        className,
      )}
      style={{ maxWidth: "70%" }}
    >
      {/* Avatar: 32px = 4 × 8px, received only */}
      {!isSender && (
        <div className="flex-shrink-0 self-end">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={senderName || "User"}
              className="w-8 h-8 object-cover border-2 border-black"
            />
          ) : (
            <div className="w-8 h-8 bg-[#E0E0E0] border-2 border-black flex items-center justify-center">
              <span className="text-[9px] font-pixel font-bold text-black leading-none">
                {senderName?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div className="relative">
        {/* Sender name */}
        {!isSender && senderName && (
          <p className="text-[11px] text-[#9E9E9E] mb-1 ml-1 font-heading font-bold uppercase tracking-wider m-0 leading-none">
            {senderName}
          </p>
        )}

        <div
          className={cn(
            "relative p-4",
            // Border and shadow
            "border-2 border-black",
            "shadow-[2px_2px_0px_#000000]",
            // Asymmetric border radius (speech bubble)
            isSender
              ? "rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-none" // 8px 8px 0 8px
              : "rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-lg", // 8px 8px 8px 0
            // Colors
            isSender
              ? "bg-white text-[#212121]"
              : "bg-[#F8F8F8] text-[#212121]",
            // Voice note width
            isVoiceNote && "min-w-[200px] sm:min-w-[240px]",
          )}
        >
          {/* Speech bubble tail */}
          {showTail && (
            <>
              {/* Black outer triangle */}
              <div
                className={cn(
                  "absolute bottom-0 w-0 h-0",
                  isSender
                    ? "right-[-10px] border-l-[10px] border-l-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                    : "left-[-10px] border-r-[10px] border-r-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent",
                )}
                aria-hidden="true"
              />
              {/* Fill triangle (matches bg) */}
              <div
                className={cn(
                  "absolute bottom-[2px] w-0 h-0",
                  isSender
                    ? "right-[-7px] border-l-[7px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"
                    : "left-[-7px] border-r-[7px] border-r-[#F8F8F8] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent",
                )}
                aria-hidden="true"
              />
            </>
          )}

          {/* Voice note */}
          {isVoiceNote ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onPlayToggle}
                className={cn(
                  "flex-shrink-0 w-8 h-8 border-2 border-black flex items-center justify-center",
                  "bg-white hover:bg-[#E0E0E0]",
                  "shadow-[1px_1px_0px_#000000]",
                  "cursor-pointer",
                )}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause
                    className="w-4 h-4 text-black"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    className="w-4 h-4 text-black ml-0.5"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                )}
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <WaveformBars isPlaying={isPlaying} />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#9E9E9E] font-bold leading-none">
                    {formatDuration(voiceDuration)}
                  </span>
                  <Mic className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ) : (
            children || (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words m-0">
                {message}
              </p>
            )
          )}

          {/* Timestamp + Receipt */}
          <div
            className={cn(
              "flex items-center gap-2 mt-2",
              isSender ? "justify-end" : "justify-start",
            )}
          >
            {time && (
              <span className="text-[10px] text-[#9E9E9E] leading-none">
                {time}
              </span>
            )}
            {isSender && <ReadReceipt status={status} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────
export function TypingIndicator({
  senderName,
  avatarUrl,
}: {
  senderName?: string;
  avatarUrl?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-2 mr-auto"
      style={{ maxWidth: "70%" }}
    >
      <div className="flex-shrink-0 self-end">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={senderName || "User"}
            className="w-8 h-8 object-cover border-2 border-black"
          />
        ) : (
          <div className="w-8 h-8 bg-[#E0E0E0] border-2 border-black flex items-center justify-center">
            <span className="text-[9px] font-pixel font-bold text-black leading-none">
              {senderName?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#F8F8F8] border-2 border-black shadow-[2px_2px_0px_#000000] rounded-tl-lg rounded-tr-lg rounded-br-lg">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-[#9E9E9E] border border-black"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── System Message ──────────────────────────────────────────────────────
export function SystemMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center my-4"
    >
      <div className="px-4 py-2 bg-[#F8F8F8] border-2 border-dashed border-[#9E9E9E]">
        <p className="text-[11px] text-[#9E9E9E] text-center font-heading font-bold uppercase tracking-wider m-0 leading-none">
          {message}
        </p>
      </div>
    </motion.div>
  );
}

export default ChatBubble;
