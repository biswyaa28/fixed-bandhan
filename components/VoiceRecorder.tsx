/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Voice Recorder Component (Comic Book / 8-Bit)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Full-featured voice recording UI for chat voice notes:
 *   • Record up to 15 seconds via MediaRecorder (WebM/Opus)
 *   • Live waveform visualisation (blocky 8-bit bars)
 *   • Countdown timer with near-limit warning
 *   • Preview / re-record / send workflow
 *   • Upload with progress indicator via storage.ts
 *   • Mic permission handling with bilingual errors
 *   • Accessible: ARIA labels, keyboard support
 *
 * Two export modes:
 *   VoiceRecorder      — Full modal-style recorder
 *   VoiceRecorderInline — Compact inline trigger (for chat input)
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Pause,
  Send,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  uploadVoiceNote,
  compressAudio,
  type UploadResult,
  type UploadProgress,
  type StorageServiceError,
} from "@/lib/firebase/storage";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface VoiceRecorderProps {
  /** Whether the recorder modal is visible */
  isOpen: boolean;
  /** Close the recorder */
  onClose: () => void;
  /**
   * Called after a successful upload with the download URL + duration.
   * The parent can then call chat.sendMediaMessage() with this URL.
   */
  onSend: (result: UploadResult, durationSec: number) => void;
  /** Match ID for storage path organisation */
  matchId: string;
  /** Current user UID */
  senderId: string;
  /** Recipient name (shown in header) */
  recipientName?: string;
  /** Max recording duration in seconds (default 15) */
  maxDuration?: number;
}

type RecState = "idle" | "recording" | "paused" | "recorded" | "playing" | "uploading";

// ─── Constants ───────────────────────────────────────────────────────────

const DEFAULT_MAX_DURATION = 15;
const BAR_COUNT = 24;

// ─── Waveform (8-bit blocky bars) ────────────────────────────────────────

function Waveform({ isActive, audioLevel }: { isActive: boolean; audioLevel: number }) {
  return (
    <div className="flex items-end justify-center gap-[2px] h-16">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const base = 15 + Math.sin(i * 0.9) * 12 + Math.cos(i * 1.4) * 8;
        const height = isActive ? base + audioLevel * 40 : base;
        return (
          <motion.div
            key={i}
            className="w-[3px] bg-black origin-bottom"
            animate={
              isActive
                ? {
                    scaleY: [0.3, 1, 0.5, 0.8, 0.3],
                    transition: {
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.025,
                      ease: "linear",
                    },
                  }
                : { scaleY: 1 }
            }
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

// ─── Timer display ───────────────────────────────────────────────────────

function Timer({ seconds, max }: { seconds: number; max: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = (seconds / max) * 100;
  const isNear = max - seconds <= 3 && seconds > 0;

  return (
    <div className="text-center mb-4">
      <motion.span
        className={cn(
          "text-3xl font-bold font-mono",
          isNear ? "text-black" : "text-[#212121]",
        )}
        animate={isNear ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.35, repeat: isNear ? Infinity : 0 }}
      >
        {mm}:{ss}
      </motion.span>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-[#E0E0E0] border border-black max-w-[180px] mx-auto">
        <motion.div
          className="h-full bg-black"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <p className={cn("text-[9px] mt-1.5 font-bold uppercase tracking-wider", isNear ? "text-black" : "text-[#9E9E9E]")}>
        {isNear ? "Almost at limit!" : `Max ${max} seconds`}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function VoiceRecorder({
  isOpen,
  onClose,
  onSend,
  matchId,
  senderId,
  recipientName,
  maxDuration = DEFAULT_MAX_DURATION,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0.5);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadPct, setUploadPct] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // ── Reset on close ──
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setState("idle");
      setElapsed(0);
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setError(null);
      setUploadPct(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Cleanup helper ──
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (mediaRecorderRef.current) {
      try { mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop()); } catch { /* */ }
      mediaRecorderRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* */ }
      audioCtxRef.current = null;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
  }, []);

  // ── Start recording ──
  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      });

      // Audio analyser for waveform
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 64;

      // Prefer opus/webm for small file sizes (~24 kbps effective)
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 24_000, // 24 kbps target
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setState("recorded");
      };

      recorder.start();
      setState("recording");

      // Timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

      // Audio level loop
      const updateLevel = () => {
        if (analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setAudioLevel(avg / 255);
        }
        frameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch {
      setError("Microphone access denied. Please enable mic permissions in your browser settings.");
      setState("idle");
    }
  }, [maxDuration]);

  // ── Stop recording ──
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* */ }
      audioCtxRef.current = null;
    }
  }, []);

  // ── Playback ──
  const playPreview = useCallback(() => {
    if (!audioUrl) return;
    setState("playing");
    const audio = new Audio(audioUrl);
    audioElRef.current = audio;
    audio.onended = () => setState("recorded");
    audio.play().catch(() => setState("recorded"));
  }, [audioUrl]);

  const stopPlayback = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    setState("recorded");
  }, []);

  // ── Discard ──
  const discard = useCallback(() => {
    cleanup();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);
    setError(null);
    setState("idle");
  }, [cleanup, audioUrl]);

  // ── Upload + send ──
  const handleSend = useCallback(async () => {
    if (!audioBlob) return;

    setState("uploading");
    setUploadPct(0);

    try {
      // Validate duration
      compressAudio(audioBlob, elapsed);

      const result = await uploadVoiceNote(
        audioBlob,
        { matchId, senderId, durationSec: elapsed },
        { onProgress: (p: UploadProgress) => setUploadPct(p.percent) },
      );

      onSend(result, elapsed);
      onClose();
    } catch (err) {
      const e = err as StorageServiceError;
      setError(e.en || "Upload failed. Please try again.");
      setState("recorded");
    }
  }, [audioBlob, elapsed, matchId, senderId, onSend, onClose]);

  // ── Render ──

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="voice-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-40"
      />

      {/* Modal */}
      <motion.div
        key="voice-modal"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-6 relative">

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                  Voice Note
                </h3>
                {recipientName && (
                  <p className="text-[10px] text-[#9E9E9E] mt-0.5">
                    To: {recipientName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-[#E0E0E0] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-black" strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-3 border-2 border-dashed border-black bg-[#F8F8F8] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-black flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <p className="text-[10px] text-[#212121] font-medium leading-snug">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Waveform ── */}
            <div className="mb-4 px-2">
              <Waveform
                isActive={state === "recording"}
                audioLevel={audioLevel}
              />
            </div>

            {/* ── Timer ── */}
            {(state === "recording" || state === "paused" || state === "recorded" || state === "playing" || state === "uploading") && (
              <Timer seconds={elapsed} max={maxDuration} />
            )}

            {/* ── Upload progress ── */}
            {state === "uploading" && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Loader2 className="w-4 h-4 text-black animate-spin" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                    Uploading… {uploadPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#E0E0E0] border border-black">
                  <motion.div
                    className="h-full bg-black"
                    animate={{ width: `${uploadPct}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            )}

            {/* ── Instruction ── */}
            {state === "idle" && (
              <p className="text-center text-[10px] text-[#9E9E9E] font-bold uppercase tracking-wider mb-4">
                Tap the mic to start recording
              </p>
            )}

            {/* ── Controls ── */}
            <div className="flex items-center justify-center gap-3">
              {/* Discard */}
              {(state === "recorded" || state === "recording" || state === "paused" || state === "playing") && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={discard}
                  disabled={state === "uploading"}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center",
                    "border-2 border-black bg-white cursor-pointer",
                    "shadow-[2px_2px_0px_#000000]",
                    "hover:bg-[#E0E0E0] transition-colors",
                  )}
                  aria-label="Discard recording"
                >
                  <Trash2 className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
                </motion.button>
              )}

              {/* Main button: Record / Stop / Send */}
              {state === "idle" && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={startRecording}
                  className={cn(
                    "w-16 h-16 flex items-center justify-center",
                    "border-[3px] border-black bg-black text-white cursor-pointer",
                    "shadow-[4px_4px_0px_#000000]",
                    "hover:bg-[#424242] transition-colors",
                  )}
                  aria-label="Start recording"
                >
                  <Mic className="w-7 h-7" strokeWidth={2.5} />
                </motion.button>
              )}

              {state === "recording" && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={stopRecording}
                  className={cn(
                    "w-16 h-16 flex items-center justify-center",
                    "border-[3px] border-black bg-black text-white cursor-pointer",
                    "shadow-[4px_4px_0px_#000000]",
                    "hover:bg-[#424242] transition-colors",
                  )}
                  aria-label="Stop recording"
                >
                  <Square className="w-6 h-6" strokeWidth={2.5} fill="white" />
                </motion.button>
              )}

              {state === "recorded" && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSend}
                  className={cn(
                    "w-16 h-16 flex items-center justify-center",
                    "border-[3px] border-black bg-black text-white cursor-pointer",
                    "shadow-[4px_4px_0px_#000000]",
                    "hover:bg-[#424242] transition-colors",
                  )}
                  aria-label="Send voice note"
                >
                  <Send className="w-6 h-6 -rotate-12" strokeWidth={2.5} />
                </motion.button>
              )}

              {state === "uploading" && (
                <div className="w-16 h-16 flex items-center justify-center border-[3px] border-[#9E9E9E] bg-[#F8F8F8]">
                  <Loader2 className="w-6 h-6 text-[#9E9E9E] animate-spin" strokeWidth={2.5} />
                </div>
              )}

              {state === "playing" && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={stopPlayback}
                  className={cn(
                    "w-16 h-16 flex items-center justify-center",
                    "border-[3px] border-black bg-white text-black cursor-pointer",
                    "shadow-[4px_4px_0px_#000000]",
                    "hover:bg-[#E0E0E0] transition-colors",
                  )}
                  aria-label="Stop playback"
                >
                  <Pause className="w-6 h-6" strokeWidth={2.5} fill="black" />
                </motion.button>
              )}

              {/* Preview play button */}
              {state === "recorded" && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={playPreview}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center",
                    "border-2 border-black bg-white cursor-pointer",
                    "shadow-[2px_2px_0px_#000000]",
                    "hover:bg-[#E0E0E0] transition-colors",
                  )}
                  aria-label="Play preview"
                >
                  <Play className="w-4 h-4 text-black ml-0.5" strokeWidth={2.5} fill="black" />
                </motion.button>
              )}
            </div>

            {/* ── Recording pulse indicator ── */}
            {state === "recording" && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <motion.div
                  className="w-2 h-2 bg-black"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[9px] font-bold text-black uppercase tracking-wider">
                  Recording…
                </span>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-3 p-3 bg-[#F8F8F8] border-2 border-black">
            <p className="text-[9px] text-[#424242] leading-relaxed">
              <span className="font-bold text-black">Tip: </span>
              Speak clearly in a quiet place. Mention your name and interests.
            </p>
            <p className="text-[9px] text-[#9E9E9E] mt-0.5">
              शांत जगह पर साफ़ बोलें। अपना नाम और रुचियां बताएं।
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE VOICE TRIGGER (compact, for chat input bar)
// ═══════════════════════════════════════════════════════════════════════════

export interface VoiceRecorderInlineProps {
  /** Called when the user wants to open the full recorder */
  onOpenRecorder: () => void;
  /** Whether a recording session is in progress */
  isRecording?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * Small mic button for the chat input bar.
 * Tapping opens the full VoiceRecorder modal.
 */
export function VoiceRecorderInline({
  onOpenRecorder,
  isRecording = false,
  disabled = false,
}: VoiceRecorderInlineProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.92 }}
      onClick={disabled ? undefined : onOpenRecorder}
      disabled={disabled}
      aria-label="Record voice note"
      className={cn(
        "w-10 h-10 flex items-center justify-center",
        "border-2 border-black cursor-pointer",
        "transition-all duration-100",
        isRecording
          ? "bg-black text-white"
          : "bg-white text-[#424242] shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] hover:bg-[#F8F8F8]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Mic className="w-4 h-4" strokeWidth={2.5} />
      {isRecording && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-white border border-black"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

export default VoiceRecorder;
