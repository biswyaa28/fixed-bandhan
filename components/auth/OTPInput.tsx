/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — OTP Input Component
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Production-grade 6-digit OTP input with:
 *   • Auto-focus, auto-tab, paste support
 *   • Indian carrier detection + SMS tips
 *   • Bilingual error messages (English / Hindi)
 *   • Retry tracking (max 3 attempts, then lockout)
 *   • Persistent resend countdown timer
 *   • TRAI compliance disclaimer
 *   • Phishing warning
 *   • Accessible (aria labels, keyboard nav)
 *   • Comic book monochrome aesthetic
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  Info,
  Lock,
  Timer,
  RefreshCw,
  Globe,
} from "lucide-react";
import { detectCarrier, TRAI_DISCLAIMER } from "@/lib/carrier-detection";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { MAX_OTP_ATTEMPTS, OTP_LENGTH } from "@/lib/firebase/auth";
import type { AuthError } from "@/lib/firebase/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OTPInputProps {
  /** Phone number the OTP was sent to (for display + carrier detection) */
  phoneNumber: string;
  /** Called when the user submits the OTP */
  onVerify: (otp: string) => Promise<void>;
  /** Called when the user taps "Resend" */
  onResend: () => Promise<void>;
  /** Current attempt count (from AuthContext.otpAttempts) */
  attempts?: number;
  /** External error from AuthContext */
  externalError?: AuthError | null;
  /** Initial UI language */
  language?: "en" | "hi";
  /** Resend cooldown in seconds (default 30) */
  resendCooldown?: number;
  /** OTP expiry display in minutes (default 5) */
  expiryMinutes?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Strings
// ─────────────────────────────────────────────────────────────────────────────

const STR = {
  title: { en: "Verify OTP", hi: "OTP सत्यापित करें" },
  subtitle: {
    en: (ph: string) => `Enter the 6-digit code sent to ${ph}`,
    hi: (ph: string) => `${ph} पर भेजा गया 6-अंकीय कोड दर्ज करें`,
  },
  verify: { en: "Verify OTP", hi: "OTP सत्यापित करें" },
  verifying: { en: "Verifying…", hi: "सत्यापित हो रहा है…" },
  verified: { en: "Verified!", hi: "सत्यापित!" },
  noCode: { en: "Didn't receive the code?", hi: "कोड नहीं मिला?" },
  resend: { en: "Resend OTP", hi: "OTP पुनः भेजें" },
  resendIn: { en: "Resend in", hi: "में पुनः भेजें" },
  troubleshoot: {
    en: "Troubleshooting tips",
    hi: "ट्रबलशूटिंग टिप्स",
  },
  phishing: {
    en: "⚠️ Bandhan NEVER asks for your OTP. Never share with anyone.",
    hi: "⚠️ बंधन कभी भी आपका OTP नहीं माँगता। किसी के साथ साझा न करें।",
  },
  expiry: {
    en: (m: number) => `OTP expires in ${m} minutes`,
    hi: (m: number) => `OTP ${m} मिनट में समाप्त होगा`,
  },
  locked: {
    en: "Too many failed attempts. Please resend a new OTP.",
    hi: "बहुत सारे विफल प्रयास। कृपया नया OTP भेजें।",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function OTPInput({
  phoneNumber,
  onVerify,
  onResend,
  attempts = 0,
  externalError,
  language: langProp = "en",
  resendCooldown = 30,
  expiryMinutes = 5,
}: OTPInputProps) {
  // ── State ──
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">(langProp);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isLocked = attempts >= MAX_OTP_ATTEMPTS;
  const isComplete = digits.every((d) => d !== "");

  // ── Carrier detection ──
  const carrier = detectCarrier(phoneNumber);
  const smsTip = carrier.smsTips[lang];
  const troubleSteps = carrier.troubleshooting[lang];

  // ── Resend timer ──
  const {
    remaining: timerRemaining,
    isActive: timerActive,
    formatted: timerFormatted,
    reset: resetTimer,
  } = useCountdownTimer({
    duration: resendCooldown,
    storageKey: `otp-resend-${phoneNumber}`,
    autoStart: true,
  });

  // ── Display error (prefer external from AuthContext) ──
  const displayError = externalError?.[lang] ?? internalError ?? null;

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Handlers ──

  const handleChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setInternalError(null);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    // Auto-tab forward
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      // Paste support (Ctrl/Cmd+V)
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          const otpChars = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
          if (!otpChars) return;
          setDigits((prev) => {
            const next = [...prev];
            otpChars.split("").forEach((ch, i) => {
              if (i < OTP_LENGTH) next[i] = ch;
            });
            return next;
          });
          const focusIdx = Math.min(otpChars.length, OTP_LENGTH - 1);
          inputRefs.current[focusIdx]?.focus();
        });
      }
    },
    [digits],
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const otp = digits.join("");

      if (otp.length !== OTP_LENGTH) {
        setInternalError(
          lang === "en"
            ? "Please enter all 6 digits."
            : "कृपया सभी 6 अंक दर्ज करें।",
        );
        return;
      }

      if (isLocked) {
        setInternalError(STR.locked[lang]);
        return;
      }

      setIsLoading(true);
      setInternalError(null);

      try {
        await onVerify(otp);
        setIsVerified(true);
      } catch {
        // Error is set by AuthContext via externalError prop.
        // Reset digits for retry.
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [digits, isLocked, lang, onVerify],
  );

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (
      digits.every((d) => d !== "") &&
      !isLoading &&
      !isVerified &&
      !isLocked
    ) {
      const timer = setTimeout(() => handleSubmit(), 200);
      return () => clearTimeout(timer);
    }
  }, [digits, isLoading, isVerified, isLocked, handleSubmit]);

  const handleResend = useCallback(async () => {
    if (timerActive || isLoading) return;
    setIsLoading(true);
    setInternalError(null);
    try {
      await onResend();
      resetTimer();
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setShowTips(false);
    } catch {
      // Error from AuthContext
    } finally {
      setIsLoading(false);
    }
  }, [timerActive, isLoading, onResend, resetTimer]);

  // ── Render ──

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-12 h-12 mx-auto mb-3 border-2 border-black bg-[#F8F8F8] flex items-center justify-center shadow-[3px_3px_0px_#000000]"
        >
          <Shield className="w-6 h-6 text-black" strokeWidth={2} />
        </motion.div>

        <h2 className="text-lg font-bold text-[#212121] uppercase tracking-wide font-heading">
          {STR.title[lang]}
        </h2>
        <p className="text-xs text-[#9E9E9E] mt-1">
          {STR.subtitle[lang](phoneNumber)}
        </p>

        {/* Language toggle */}
        <button
          onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
          className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#9E9E9E] hover:text-[#424242] bg-transparent border-none cursor-pointer"
          aria-label="Toggle language"
        >
          <Globe className="w-3 h-3" />
          {lang === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      {/* ── Carrier SMS tip ── */}
      <div className="mb-4 p-3 bg-[#F8F8F8] border-2 border-black">
        <div className="flex items-start gap-2">
          <MessageSquare
            className="w-4 h-4 text-[#424242] flex-shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <p className="text-[11px] text-[#424242] leading-relaxed">{smsTip}</p>
        </div>
      </div>

      {/* ── OTP digit inputs ── */}
      <form onSubmit={handleSubmit}>
        <div
          className="flex justify-center gap-2 sm:gap-3 mb-5"
          role="group"
          aria-label="OTP input"
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isLoading || isVerified || isLocked}
              aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
              className={[
                "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold",
                "border-2 transition-all duration-150 outline-none",
                "bg-white text-[#212121] placeholder-[#E0E0E0]",
                isVerified
                  ? "border-black bg-[#F8F8F8]"
                  : displayError
                    ? "border-black border-dashed"
                    : "border-black focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
                (isLoading || isLocked) && "opacity-50 cursor-not-allowed",
              ].join(" ")}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
            />
          ))}
        </div>

        {/* ── Loading ── */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="flex items-center gap-2 text-[#424242]">
                <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {STR.verifying[lang]}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Success ── */}
        <AnimatePresence>
          {isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="flex items-center gap-2 text-[#212121]">
                <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {STR.verified[lang]}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ── */}
        <AnimatePresence>
          {displayError && !isVerified && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3 bg-white border-2 border-dashed border-black"
            >
              <div className="flex items-start gap-2">
                <XCircle
                  className="w-4 h-4 text-black flex-shrink-0 mt-0.5"
                  strokeWidth={2.5}
                />
                <p className="text-xs text-[#212121] font-medium leading-relaxed">
                  {displayError}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Submit button ── */}
        <motion.button
          type="submit"
          disabled={!isComplete || isLoading || isVerified || isLocked}
          whileTap={isComplete && !isLoading ? { scale: 0.97 } : undefined}
          className={[
            "w-full py-3 font-bold text-sm uppercase tracking-wider border-[3px] border-black transition-all duration-150",
            isComplete && !isLoading && !isVerified && !isLocked
              ? "bg-black text-white shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] cursor-pointer"
              : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-not-allowed",
          ].join(" ")}
        >
          {isLoading
            ? STR.verifying[lang]
            : isVerified
              ? STR.verified[lang]
              : STR.verify[lang]}
        </motion.button>
      </form>

      {/* ── Resend section ── */}
      <div className="text-center mt-5 mb-4">
        <p className="text-xs text-[#9E9E9E] mb-1">{STR.noCode[lang]}</p>

        {timerActive ? (
          <span className="text-xs text-[#9E9E9E]">
            {STR.resendIn[lang]} {timerFormatted}
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-xs font-bold text-black bg-transparent border-none cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            {STR.resend[lang]}
          </button>
        )}

        {/* Troubleshooting toggle */}
        <div className="mt-2">
          <button
            onClick={() => setShowTips((s) => !s)}
            className="text-[10px] text-[#9E9E9E] hover:text-[#424242] bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            {STR.troubleshoot[lang]} {showTips ? "▲" : "▼"}
          </button>
        </div>

        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 bg-[#F8F8F8] border-2 border-black text-left"
            >
              <ul className="space-y-1">
                {troubleSteps.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-black mt-0.5 text-[10px]">•</span>
                    <span className="text-[10px] text-[#424242]">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Phishing warning ── */}
      <div className="p-3 bg-[#F8F8F8] border-2 border-black mb-3">
        <div className="flex items-start gap-2">
          <ShieldAlert
            className="w-4 h-4 text-black flex-shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <div>
            <p className="text-[10px] text-[#212121] font-bold leading-relaxed">
              {STR.phishing.en}
            </p>
            <p className="text-[10px] text-[#424242] mt-0.5 leading-relaxed">
              {STR.phishing.hi}
            </p>
          </div>
        </div>
      </div>

      {/* ── TRAI disclaimer ── */}
      <div className="p-3 bg-white border border-[#E0E0E0] text-[10px] text-[#9E9E9E]">
        <div className="flex items-start gap-2">
          <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="font-bold text-[#424242]">
              {TRAI_DISCLAIMER.en.heading}
            </p>
            <p className="mt-1 leading-relaxed">
              {TRAI_DISCLAIMER[lang].content}
            </p>
          </div>
        </div>
      </div>

      {/* ── Expiry notice ── */}
      <div className="mt-3 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] text-[#9E9E9E]">
          <Timer className="w-3 h-3" />
          {STR.expiry[lang](expiryMinutes)}
        </span>
      </div>
    </div>
  );
}

export default OTPInput;
