/**
 * Bandhan AI — Voice Note Preview & Trim
 * Modal for reviewing a recorded voice note before sending.
 * 8-bit waveform visualization, play/pause, re-record, send.
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Send, X, Mic } from "lucide-react";
import { formatDuration, createWaveformData } from "@/lib/audio-utils";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

export interface VoiceNotePreviewProps {
  isOpen: boolean;
  audioBlob: Blob | null;
  duration: number;
  onSend: () => void;
  onReRecord: () => void;
  onClose: () => void;
  recipientName?: string;
}

export function VoiceNotePreview({
  isOpen,
  audioBlob,
  duration,
  onSend,
  onReRecord,
  onClose,
  recipientName,
}: VoiceNotePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData] = useState(() => createWaveformData(null, 32));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Create audio element from blob
  useEffect(() => {
    if (audioBlob && isOpen) {
      const url = URL.createObjectURL(audioBlob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      return () => {
        audio.pause();
        URL.revokeObjectURL(url);
        audioRef.current = null;
        audioUrlRef.current = null;
      };
    }
  }, [audioBlob, isOpen]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Auto-play on open
  useEffect(() => {
    if (isOpen && audioRef.current) {
      const timer = setTimeout(() => {
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Voice note preview"
            className="relative w-full max-w-[400px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-black text-white">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-xs font-heading font-bold uppercase tracking-wider">
                  Voice Note Preview
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer hover:bg-[#E0E0E0]"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            {/* Waveform + Play */}
            <div className="px-6 py-6">
              {recipientName && (
                <p className="text-[10px] text-[#9E9E9E] font-heading font-bold uppercase tracking-wider mb-4 m-0">
                  Sending to {recipientName}
                </p>
              )}

              {/* Waveform container */}
              <div className="flex items-center gap-4">
                {/* Play/Pause button */}
                <button
                  onClick={togglePlay}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 border-[3px] border-black",
                    "flex items-center justify-center cursor-pointer",
                    "shadow-[2px_2px_0px_#000000]",
                    "transition-[transform,box-shadow] duration-150",
                    "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                    isPlaying ? "bg-black text-white" : "bg-white text-black",
                  )}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" strokeWidth={2.5} fill="currentColor" />
                  )}
                </button>

                {/* Waveform bars */}
                <div className="flex-1">
                  <div className="flex items-end gap-[2px] h-10">
                    {waveformData.map((height, i) => {
                      const barProgress = (i / waveformData.length) * 100;
                      const isPlayed = barProgress <= progress;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 min-w-[3px] origin-bottom",
                            isPlayed ? "bg-black" : "bg-[#E0E0E0]",
                          )}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Time display */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[#9E9E9E] font-bold">
                      {formatDuration(currentTime)}
                    </span>
                    <span className="text-[10px] text-[#9E9E9E] font-bold">
                      {formatDuration(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-6 py-4 border-t-2 border-black">
              {/* Re-record */}
              <button
                onClick={onReRecord}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "px-4 py-3 border-2 border-black bg-transparent",
                  "text-xs font-heading font-bold uppercase text-[#424242]",
                  "cursor-pointer hover:bg-[#F8F8F8]",
                )}
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2} />
                Re-record
              </button>

              {/* Send */}
              <button
                onClick={onSend}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "px-4 py-3 border-[3px] border-black bg-black text-white",
                  "shadow-[4px_4px_0px_#000000]",
                  "text-xs font-heading font-bold uppercase",
                  "cursor-pointer",
                  "transition-[transform,box-shadow] duration-150",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
                )}
              >
                <Send className="w-4 h-4" strokeWidth={2} />
                Send
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default VoiceNotePreview;
