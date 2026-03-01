/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Chat Bubble (Comic Book Speech Bubble)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sent: right-aligned, 2px black border, white bg, tail bottom-right
 * Received: left-aligned, 1px #E0E0E0 border, #F8F8F8 bg, tail bottom-left
 *
 * Supports: text, photo (blurred), voice (blocky waveform)
 * Read receipts: ✓ sent, ✓✓ delivered, ✓✓ black = read
 * Long-press: triggers "Appreciate This" callback
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type MessageType = "text" | "photo" | "voice";
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  isFromMe: boolean;
  timestamp: string;
  status?: MessageStatus;
  /** Voice note duration in seconds */
  duration?: number;
  /** Whether photo is blurred until consent */
  isBlurred?: boolean;
}

export interface ChatBubbleProps {
  message: ChatMessage;
  /** Long-press on message → appreciate / context menu */
  onLongPress?: (message: ChatMessage) => void;
  /** Photo consent tap */
  onPhotoReveal?: (messageId: string) => void;
  className?: string;
}

// ─── Read Receipt Icon ───────────────────────────────────────────────────────

function ReadReceipt({ status }: { status?: MessageStatus }) {
  if (!status) return null;
  switch (status) {
    case "sending":
      return (
        <span className="text-[8px] text-[#9E9E9E] font-bold" aria-label="Sending">
          ···
        </span>
      );
    case "sent":
      return (
        <Check
          className="w-3 h-3 text-[#9E9E9E]"
          strokeWidth={3}
          aria-label="Sent"
        />
      );
    case "delivered":
      return (
        <CheckCheck
          className="w-3 h-3 text-[#9E9E9E]"
          strokeWidth={2.5}
          aria-label="Delivered"
        />
      );
    case "read":
      return (
        <CheckCheck
          className="w-3 h-3 text-black"
          strokeWidth={2.5}
          aria-label="Read"
        />
      );
  }
}

// ─── Blocky 8-bit Waveform ───────────────────────────────────────────────────

function BlockyWaveform({
  isPlaying,
  duration,
  progress,
  isFromMe,
}: {
  isPlaying: boolean;
  duration: number;
  progress: number;
  isFromMe: boolean;
}) {
  // Generate deterministic "random" bar heights from duration
  const barCount = 20;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const seed = ((i * 7 + 3) * (duration || 5)) % 100;
    return 4 + (seed % 20); // 4px to 24px
  });

  const filledBars = Math.floor((progress / 100) * barCount);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-1 min-w-[160px]">
      <div className="flex items-end gap-[2px] h-6">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-[4px] transition-colors duration-75",
              i < filledBars
                ? isFromMe
                  ? "bg-black"
                  : "bg-[#424242]"
                : isFromMe
                  ? "bg-[#9E9E9E]"
                  : "bg-[#E0E0E0]",
            )}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <span className={cn("text-[8px] tabular-nums", isFromMe ? "text-[#9E9E9E]" : "text-[#9E9E9E]")}>
        {isPlaying ? formatTime((progress / 100) * (duration || 0)) : formatTime(duration || 0)}
      </span>
    </div>
  );
}

// ─── Voice Note Sub-component ────────────────────────────────────────────────

function VoiceNote({
  message,
  isFromMe,
}: {
  message: ChatMessage;
  isFromMe: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / ((message.duration || 10) * 10);
        });
      }, 100);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePlay}
        className={cn(
          "w-8 h-8 flex items-center justify-center border-[2px] border-black flex-shrink-0 cursor-pointer",
          isPlaying ? "bg-black text-white" : "bg-white text-black",
          "transition-colors duration-100",
        )}
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" strokeWidth={2.5} />
        ) : (
          <Play className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
        )}
      </button>
      <BlockyWaveform
        isPlaying={isPlaying}
        duration={message.duration || 0}
        progress={progress}
        isFromMe={isFromMe}
      />
    </div>
  );
}

// ─── Photo Sub-component ─────────────────────────────────────────────────────

function PhotoBubble({
  message,
  onReveal,
}: {
  message: ChatMessage;
  onReveal?: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const isBlurred = message.isBlurred && !revealed;

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBlurred) {
      onReveal?.();
      setRevealed(true);
    }
  };

  return (
    <div
      onClick={handleTap}
      className={cn(
        "w-44 h-36 border-[2px] border-black bg-[#E0E0E0] flex items-center justify-center cursor-pointer relative overflow-hidden",
        isBlurred && "cursor-pointer",
      )}
    >
      <ImageIcon className="w-8 h-8 text-[#9E9E9E]" strokeWidth={1.5} />
      {isBlurred && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-1">
          <Lock className="w-5 h-5 text-black" strokeWidth={2} />
          <span className="text-[8px] font-bold uppercase tracking-wider text-black">
            Tap to reveal
          </span>
        </div>
      )}
      {!isBlurred && (
        <div className="absolute top-1 right-1">
          <Eye className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

// ─── Main Chat Bubble ────────────────────────────────────────────────────────

export function ChatBubble({
  message,
  onLongPress,
  onPhotoReveal,
  className,
}: ChatBubbleProps) {
  const { isFromMe } = message;
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLong = useRef(false);

  const handlePointerDown = useCallback(() => {
    didLong.current = false;
    longPressRef.current = setTimeout(() => {
      didLong.current = true;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(20);
      }
      onLongPress?.(message);
    }, 500);
  }, [message, onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  return (
    <div
      className={cn(
        "flex mb-3",
        isFromMe ? "justify-end" : "justify-start",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className={cn(
          "relative max-w-[75%] px-3 py-2",
          isFromMe
            ? "bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000]"
            : "bg-[#F8F8F8] border border-[#E0E0E0]",
        )}
        style={{
          // Comic speech bubble tail via CSS
          clipPath: undefined,
        }}
      >
        {/* Text content */}
        {message.type === "text" && (
          <p className="text-sm leading-relaxed text-[#212121] m-0">
            {message.content}
          </p>
        )}

        {/* Photo content */}
        {message.type === "photo" && (
          <PhotoBubble
            message={message}
            onReveal={() => onPhotoReveal?.(message.id)}
          />
        )}

        {/* Voice note content */}
        {message.type === "voice" && (
          <VoiceNote message={message} isFromMe={isFromMe} />
        )}

        {/* Timestamp + Read receipt */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isFromMe ? "justify-end" : "justify-start",
          )}
        >
          <span className="text-[8px] text-[#9E9E9E] tabular-nums">
            {message.timestamp}
          </span>
          {isFromMe && <ReadReceipt status={message.status} />}
        </div>

        {/* Speech bubble tail */}
        {isFromMe ? (
          <div
            className="absolute -bottom-[2px] -right-[8px] w-0 h-0 border-t-[6px] border-t-black border-l-[8px] border-l-transparent"
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute -bottom-[1px] -left-[6px] w-0 h-0 border-t-[5px] border-t-[#E0E0E0] border-r-[6px] border-r-transparent"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default ChatBubble;
