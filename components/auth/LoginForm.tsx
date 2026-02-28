/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Login Form
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Unified login experience with two steps:
 *   Step 1 — Enter Indian phone number → Send OTP
 *   Step 2 — Enter OTP → Verify
 *
 * Also supports Google Sign-In as an alternative.
 *
 * Features
 * ────────
 *   • Phone input with +91 prefix, carrier detection
 *   • Invisible reCAPTCHA (handled internally by auth service)
 *   • Google OAuth popup
 *   • Demo-mode banner with mock OTP hint
 *   • Bilingual (English / Hindi)
 *   • All loading + error states handled
 *   • TRAI compliance via OTPInput sub-component
 *   • Comic book monochrome aesthetic
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Smartphone,
  ArrowLeft,
  Loader2,
  FlaskConical,
  Globe,
  Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OTPInput } from "@/components/auth/OTPInput";
import { validatePhone } from "@/lib/firebase/auth";
import { getDemoOTP } from "@/lib/mock-auth";
import {
  detectCarrier,
  type IndianCarrier,
} from "@/lib/carrier-detection";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginFormProps {
  /** Called after successful authentication */
  onSuccess?: () => void;
  /** Initial language */
  language?: "en" | "hi";
  /** Additional CSS class */
  className?: string;
}

type Step = "phone" | "otp";

// ─────────────────────────────────────────────────────────────────────────────
// Strings
// ─────────────────────────────────────────────────────────────────────────────

const STR = {
  heading: {
    en: "Sign in to Bandhan",
    hi: "बंधन में साइन इन करें",
  },
  subheading: {
    en: "Enter your Indian mobile number",
    hi: "अपना भारतीय मोबाइल नंबर दर्ज करें",
  },
  label: { en: "Mobile Number", hi: "मोबाइल नंबर" },
  placeholder: { en: "9876543210", hi: "9876543210" },
  continue: { en: "Continue", hi: "जारी रखें" },
  sending: { en: "Sending OTP…", hi: "OTP भेज रहे हैं…" },
  or: { en: "or", hi: "या" },
  google: { en: "Continue with Google", hi: "Google से जारी रखें" },
  back: { en: "Change number", hi: "नंबर बदलें" },
  demo: {
    en: (otp: string) => `Demo mode — use OTP ${otp} for any number`,
    hi: (otp: string) => `डेमो मोड — किसी भी नंबर के लिए OTP ${otp} उपयोग करें`,
  },
  secured: { en: "Secured by Firebase", hi: "Firebase द्वारा सुरक्षित" },
  dpdp: { en: "DPDP 2023 Compliant", hi: "DPDP 2023 अनुरूप" },
  terms: {
    en: "By continuing you agree to our Terms & Privacy Policy",
    hi: "जारी रखकर आप हमारी शर्तें और गोपनीयता नीति स्वीकार करते हैं",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LoginForm({
  onSuccess,
  language: langProp = "en",
  className,
}: LoginFormProps) {
  // ── AuthContext ──
  const {
    sendOTP,
    verifyOTP,
    resendOTP,
    signInWithGoogle,
    isSubmitting,
    isDemoMode,
    error,
    clearError,
    otpAttempts,
  } = useAuth();

  // ── Local state ──
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState<"en" | "hi">(langProp);
  const [carrier, setCarrier] = useState<IndianCarrier | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const fullPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/^0+/, "")}`;

  // Carrier detection as user types
  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 4) {
      const info = detectCarrier(`+91${digits}`);
      setCarrier(info.name !== "Unknown" ? info.name : null);
    } else {
      setCarrier(null);
    }
  }, [phone]);

  // Focus phone input on mount
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  // ── Send OTP ──
  const handleSendOTP = useCallback(async () => {
    setLocalError(null);
    clearError();

    const v = validatePhone(fullPhone);
    if (!v.valid) {
      setLocalError(v.error?.[lang] ?? "Invalid number");
      return;
    }

    try {
      await sendOTP(fullPhone);
      setStep("otp");
    } catch {
      // error is set in AuthContext, but we might want local display too
    }
  }, [fullPhone, lang, sendOTP, clearError]);

  // ── Verify OTP (called by OTPInput) ──
  const handleVerifyOTP = useCallback(
    async (otp: string) => {
      await verifyOTP(otp);
      onSuccess?.();
    },
    [verifyOTP, onSuccess],
  );

  // ── Resend OTP (called by OTPInput) ──
  const handleResendOTP = useCallback(async () => {
    await resendOTP(fullPhone);
  }, [resendOTP, fullPhone]);

  // ── Google Sign-In ──
  const handleGoogle = useCallback(async () => {
    setLocalError(null);
    clearError();
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch {
      // error set by AuthContext
    }
  }, [signInWithGoogle, onSuccess, clearError]);

  // ── Go back to phone step ──
  const handleBack = useCallback(() => {
    setStep("phone");
    clearError();
    setLocalError(null);
  }, [clearError]);

  // ── Combined error for phone step ──
  const phoneError = localError ?? (error?.[lang] ?? null);

  // ── Render ──

  return (
    <div className={`w-full max-w-md mx-auto ${className ?? ""}`}>
      {/* ── Header ── */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-14 h-14 mx-auto mb-4 border-[3px] border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_#000000]"
        >
          <Heart className="w-7 h-7 text-black" strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
        </motion.div>

        <h1 className="text-xl font-bold text-[#212121] uppercase tracking-wide font-heading">
          {STR.heading[lang]}
        </h1>

        {step === "phone" && (
          <p className="text-xs text-[#9E9E9E] mt-1">{STR.subheading[lang]}</p>
        )}

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

      {/* ── Demo banner ── */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3 bg-[#F8F8F8] border-2 border-dashed border-black"
        >
          <div className="flex items-start gap-2">
            <FlaskConical className="w-4 h-4 text-black flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[11px] text-[#212121] font-medium">
              {STR.demo[lang](getDemoOTP())}
            </p>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1 — PHONE INPUT                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {step === "phone" && (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Card */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000000] p-6 mb-5">
              <label className="block text-xs font-bold text-[#212121] uppercase tracking-wider mb-2">
                {STR.label[lang]}
              </label>

              <div className="flex items-stretch border-2 border-black focus-within:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000] transition-shadow">
                {/* +91 prefix */}
                <div className="flex items-center px-3 bg-[#F8F8F8] border-r-2 border-black text-sm font-bold text-[#212121] select-none">
                  +91
                </div>

                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone.replace(/^\+?91/, "")}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                    setLocalError(null);
                    clearError();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendOTP();
                  }}
                  placeholder={STR.placeholder[lang]}
                  className="flex-1 px-3 py-3 text-sm text-[#212121] placeholder-[#9E9E9E] bg-white outline-none border-none font-medium"
                  aria-label="Phone number"
                />
              </div>

              {/* Carrier hint */}
              {carrier && (
                <p className="mt-2 text-[10px] text-[#9E9E9E] flex items-center gap-1">
                  <Smartphone className="w-3 h-3" strokeWidth={2} />
                  {lang === "en" ? "Detected:" : "पहचाना:"} {carrier}
                </p>
              )}

              {/* Error */}
              {phoneError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-[11px] text-[#212121] font-medium p-2 bg-[#F8F8F8] border border-dashed border-black"
                >
                  {phoneError}
                </motion.p>
              )}

              {/* Send OTP button */}
              <motion.button
                whileTap={!isSubmitting ? { scale: 0.97 } : undefined}
                onClick={handleSendOTP}
                disabled={phone.replace(/\D/g, "").length < 10 || isSubmitting}
                className={[
                  "w-full mt-4 py-3 font-bold text-sm uppercase tracking-wider border-[3px] border-black transition-all duration-150",
                  phone.replace(/\D/g, "").length >= 10 && !isSubmitting
                    ? "bg-black text-white shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] cursor-pointer"
                    : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-not-allowed",
                ].join(" ")}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {STR.sending[lang]}
                  </span>
                ) : (
                  STR.continue[lang]
                )}
              </motion.button>
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-0 border-t-2 border-dashed border-[#E0E0E0]" />
              <span className="text-[10px] font-bold text-[#9E9E9E] uppercase">
                {STR.or[lang]}
              </span>
              <div className="flex-1 h-0 border-t-2 border-dashed border-[#E0E0E0]" />
            </div>

            {/* ── Google Sign-In ── */}
            <motion.button
              whileTap={!isSubmitting ? { scale: 0.97 } : undefined}
              onClick={handleGoogle}
              disabled={isSubmitting}
              className={[
                "w-full py-3 font-bold text-sm uppercase tracking-wider",
                "bg-white text-[#212121] border-[3px] border-black",
                "shadow-[4px_4px_0px_#000000] transition-all duration-150",
                !isSubmitting
                  ? "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] cursor-pointer"
                  : "opacity-50 cursor-not-allowed",
              ].join(" ")}
            >
              <span className="flex items-center justify-center gap-2">
                {/* Google "G" icon — simple monochrome */}
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                {STR.google[lang]}
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* STEP 2 — OTP VERIFICATION                                         */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {step === "otp" && (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-[#424242] bg-transparent border-none cursor-pointer hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              {STR.back[lang]}
            </button>

            <OTPInput
              phoneNumber={fullPhone}
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              attempts={otpAttempts}
              externalError={error}
              language={lang}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trust badges ── */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 border border-[#E0E0E0] text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
            <Shield className="w-3 h-3" strokeWidth={2} />
            {STR.secured[lang]}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 border border-[#E0E0E0] text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
            <Shield className="w-3 h-3" strokeWidth={2} />
            {STR.dpdp[lang]}
          </span>
        </div>

        <p className="text-[10px] text-[#9E9E9E] text-center max-w-xs">
          {STR.terms[lang]}
        </p>
      </div>

      {/* ── reCAPTCHA container (invisible, injected by auth service) ── */}
      <div id="recaptcha-container" className="sr-only" />
    </div>
  );
}

export default LoginForm;
