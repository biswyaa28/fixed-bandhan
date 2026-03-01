/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Photo Verification Modal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Step-by-step comic-panel verification flow:
 *   Step 1: Intro — explain the process (3 steps, 60s)
 *   Step 2: Selfie — capture a clear selfie
 *   Step 3: Pose — match a random pose ("Hold up 2 fingers ✌️")
 *   Step 4: Reviewing — AI spinner
 *   Step 5: Success — badge animation + confetti
 *
 * Each step rendered as a "comic panel" with thick borders.
 * Progress indicator at top. Camera capture via file input.
 *
 * Comic-book aesthetic: 4px black border, black header, hard shadow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  User,
  Shield,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

type Step = "intro" | "selfie" | "pose" | "reviewing" | "success" | "failed";

export interface PhotoVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

// ─── Pose Bank ───────────────────────────────────────────────────────────

const POSES = [
  { en: "Hold up 2 fingers ✌️", hi: "2 उंगलियां दिखाएं ✌️", emoji: "✌️" },
  { en: "Show a thumbs up 👍", hi: "अंगूठा दिखाएं 👍", emoji: "👍" },
  { en: "Place hand on chin 🤔", hi: "हाथ ठोड़ी पर रखें 🤔", emoji: "🤔" },
  { en: "Wave at the camera 👋", hi: "कैमरे को हाथ हिलाएं 👋", emoji: "👋" },
];

// ─── Progress Bar ────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="border-b border-dashed border-[#E0E0E0] px-4 py-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-heading text-[8px] font-bold uppercase tracking-widest text-[#9E9E9E]">
          Step {current} of {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden border border-black bg-[#E0E0E0]">
        <motion.div
          className="h-full bg-black"
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Comic Panel Wrapper ─────────────────────────────────────────────────

function ComicPanel({
  panelNumber,
  title,
  children,
}: {
  panelNumber: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-4">
      {/* Panel label */}
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center border-[2px] border-black bg-black text-[9px] font-bold text-white">
          {panelNumber}
        </span>
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-black">
          {title}
        </span>
      </div>
      {/* Panel content */}
      <div className="border-[2px] border-black bg-[#F8F8F8] p-4">{children}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function PhotoVerificationModal({
  isOpen,
  onClose,
  onComplete,
}: PhotoVerificationModalProps) {
  const [step, setStep] = useState<Step>("intro");
  const [pose] = useState(() => POSES[Math.floor(Math.random() * POSES.length)]);
  const selfieRef = useRef<HTMLInputElement>(null);
  const poseRef = useRef<HTMLInputElement>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [posePreview, setPosePreview] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep("intro");
      setSelfiePreview(null);
      setPosePreview(null);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleFile = useCallback(
    (target: "selfie" | "pose") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (target === "selfie") {
        setSelfiePreview(url);
        setStep("pose");
      } else {
        setPosePreview(url);
        setStep("reviewing");
        // Simulate AI review
        setTimeout(() => {
          // 90% success rate simulation
          setStep(Math.random() > 0.1 ? "success" : "failed");
        }, 2500);
      }
    },
    [],
  );

  const handleDone = useCallback(() => {
    onComplete?.();
    onClose();
  }, [onComplete, onClose]);

  const handleRetry = useCallback(() => {
    setSelfiePreview(null);
    setPosePreview(null);
    setStep("selfie");
  }, []);

  const stepNum = step === "intro" ? 0 : step === "selfie" ? 1 : step === "pose" ? 2 : 3;
  const totalSteps = 3;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo Verification"
            className="relative max-h-[90vh] w-[90%] max-w-[420px] overflow-hidden overflow-y-auto border-4 border-black bg-white shadow-[8px_8px_0px_#000000]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-[2px] border-black bg-black px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" strokeWidth={2.5} />
                <span className="font-heading text-xs font-bold uppercase tracking-wider">
                  Photo Verification
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-6 w-6 cursor-pointer items-center justify-center border-none bg-white text-black"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </div>

            {/* Progress */}
            {stepNum > 0 && stepNum <= totalSteps && (
              <ProgressBar current={stepNum} total={totalSteps} />
            )}

            {/* Hidden file inputs */}
            <input
              ref={selfieRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFile("selfie")}
              className="hidden"
            />
            <input
              ref={poseRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFile("pose")}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {/* ── Intro ──────────────────────────────────── */}
              {step === "intro" && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="px-4 py-4 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border-[2px] border-black bg-[#F8F8F8] shadow-[2px_2px_0px_#000000]">
                      <Camera className="h-8 w-8 text-[#424242]" strokeWidth={1.5} />
                    </div>
                    <h3 className="m-0 mb-1 font-heading text-sm font-bold uppercase text-black">
                      Get Verified
                    </h3>
                    <p className="m-0 mx-auto mb-4 max-w-[260px] text-xs leading-relaxed text-[#424242]">
                      Verify your photos to earn a trusted badge. It takes just 60
                      seconds.
                    </p>

                    {/* Steps preview as comic panels */}
                    <div className="mb-4 space-y-1.5 text-left">
                      {[
                        { num: 1, label: "Take a clear selfie", icon: User },
                        { num: 2, label: "Match a random pose", icon: Camera },
                        { num: 3, label: "AI verifies your identity", icon: ShieldCheck },
                      ].map((s) => (
                        <div
                          key={s.num}
                          className="flex items-center gap-2 border-[2px] border-black bg-white px-3 py-2"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center border-[2px] border-black bg-black text-[7px] font-bold text-white">
                            {s.num}
                          </span>
                          <s.icon
                            className="h-3.5 w-3.5 text-[#9E9E9E]"
                            strokeWidth={2}
                          />
                          <span className="text-[10px] font-bold text-[#424242]">
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setStep("selfie")}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 py-3",
                        "border-[3px] border-black bg-black text-white",
                        "shadow-[4px_4px_0px_#000000]",
                        "cursor-pointer font-heading text-xs font-bold uppercase tracking-wider",
                        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
                        "transition-[transform,box-shadow] duration-150",
                      )}
                    >
                      <Camera className="h-4 w-4" strokeWidth={2} />
                      Start Verification
                    </button>
                    <p className="m-0 mt-2 text-[8px] text-[#9E9E9E]">
                      सत्यापन शुरू करें · बस 60 सेकंड
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Selfie ─────────────────────────────────── */}
              {step === "selfie" && (
                <motion.div
                  key="selfie"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ComicPanel panelNumber={1} title="Take a Selfie">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center border-[2px] border-dashed border-black bg-white">
                        {selfiePreview ? (
                          <img
                            src={selfiePreview}
                            alt="Selfie preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-[#E0E0E0]" strokeWidth={1.5} />
                        )}
                      </div>
                      <p className="m-0 mb-0.5 text-xs font-bold text-[#212121]">
                        Take a clear selfie
                      </p>
                      <p className="m-0 mb-3 text-[9px] text-[#9E9E9E]">
                        Good lighting · Face centered · No sunglasses
                      </p>
                      <button
                        onClick={() => selfieRef.current?.click()}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 py-2.5",
                          "border-[3px] border-black bg-white text-black",
                          "shadow-[4px_4px_0px_#000000]",
                          "cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider",
                          "hover:bg-black hover:text-white",
                          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
                          "transition-all duration-150",
                        )}
                      >
                        <Camera className="h-4 w-4" strokeWidth={2} />
                        Open Camera
                      </button>
                    </div>
                  </ComicPanel>
                </motion.div>
              )}

              {/* ── Pose ───────────────────────────────────── */}
              {step === "pose" && (
                <motion.div
                  key="pose"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ComicPanel panelNumber={2} title="Match This Pose">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center border-[2px] border-dashed border-black bg-white">
                        {posePreview ? (
                          <img
                            src={posePreview}
                            alt="Pose preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-5xl leading-none">{pose.emoji}</span>
                        )}
                      </div>
                      <p className="m-0 mb-0.5 font-heading text-sm font-bold text-black">
                        {pose.en}
                      </p>
                      <p className="m-0 mb-0.5 text-[9px] text-[#9E9E9E]">{pose.hi}</p>
                      <p className="m-0 mb-3 text-[8px] text-[#9E9E9E]">
                        This proves you&apos;re a real person
                      </p>
                      <button
                        onClick={() => poseRef.current?.click()}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 py-2.5",
                          "border-[3px] border-black bg-white text-black",
                          "shadow-[4px_4px_0px_#000000]",
                          "cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider",
                          "hover:bg-black hover:text-white",
                          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
                          "transition-all duration-150",
                        )}
                      >
                        <Camera className="h-4 w-4" strokeWidth={2} />
                        Take Pose Photo
                      </button>
                    </div>
                  </ComicPanel>
                </motion.div>
              )}

              {/* ── Reviewing ──────────────────────────────── */}
              {step === "reviewing" && (
                <motion.div
                  key="reviewing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ComicPanel panelNumber={3} title="Verifying...">
                    <div className="py-4 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mx-auto mb-4 h-12 w-12 border-[2px] border-black border-t-transparent"
                      />
                      <p className="m-0 font-heading text-sm font-bold uppercase text-black">
                        AI is comparing your photos
                      </p>
                      <p className="m-0 mt-1 text-[9px] text-[#9E9E9E]">
                        AI आपकी फ़ोटो की तुलना कर रहा है
                      </p>
                    </div>
                  </ComicPanel>
                </motion.div>
              )}

              {/* ── Success ────────────────────────────────── */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="px-4 py-6 text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border-[2px] border-black bg-[#424242] shadow-[4px_4px_0px_#000000]"
                    >
                      <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2} />
                    </motion.div>
                    <h3 className="m-0 flex items-center justify-center gap-1 font-heading text-base font-bold uppercase text-black">
                      <Sparkles className="h-4 w-4" strokeWidth={2} />
                      Verified!
                    </h3>
                    <p className="m-0 mx-auto mt-1.5 max-w-[260px] text-xs leading-relaxed text-[#424242]">
                      Your{" "}
                      <span className="font-bold">&quot;Verified Authentic&quot;</span>{" "}
                      badge is now active. Re-verification needed in 6 months.
                    </p>
                    <p className="m-0 mt-1 text-[9px] text-[#9E9E9E]">
                      सत्यापित! · आपका बैज अब सक्रिय है
                    </p>
                    <button
                      onClick={handleDone}
                      className={cn(
                        "mt-4 px-8 py-2.5",
                        "border-[3px] border-black bg-black text-white",
                        "shadow-[4px_4px_0px_#000000]",
                        "cursor-pointer font-heading text-xs font-bold uppercase tracking-wider",
                        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
                        "transition-[transform,box-shadow] duration-150",
                      )}
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Failed ─────────────────────────────────── */}
              {step === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="px-4 py-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-[2px] border-black bg-[#FFF0F3] shadow-[2px_2px_0px_#000000]">
                      <AlertCircle className="h-7 w-7 text-[#EF476F]" strokeWidth={1.5} />
                    </div>
                    <h3 className="m-0 mb-1 font-heading text-sm font-bold uppercase text-black">
                      Verification Failed
                    </h3>
                    <p className="m-0 mx-auto mb-4 max-w-[260px] text-xs leading-relaxed text-[#424242]">
                      We couldn&apos;t match your photos. Please try again with better
                      lighting.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={onClose}
                        className="cursor-pointer border-[2px] border-black bg-white px-4 py-2 font-heading text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-[#F8F8F8]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRetry}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2",
                          "border-[3px] border-black bg-black text-white",
                          "shadow-[2px_2px_0px_#000000]",
                          "cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider",
                          "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                          "transition-[transform,box-shadow] duration-150",
                        )}
                      >
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                        Retry
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default PhotoVerificationModal;
