"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  FlaskConical,
  Building2,
} from "lucide-react";
import { verifyOTP } from "@/lib/auth";
import {
  getMockCurrentUser,
  enableDemoMode,
  getDemoOTP,
} from "@/lib/mock-auth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

function OTPVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const demoMode = useDemoMode();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showDigiLocker, setShowDigiLocker] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneNumber =
    typeof window !== "undefined"
      ? localStorage.getItem("pending_phone")
      : null;
  const maskedPhone = phoneNumber
    ? phoneNumber.replace(/(\+91)(\d{5})(\d{5})/, "$1 ••••• $3")
    : "your number";

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((ch, i) => {
      if (i < 6) next[i] = ch;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6)
      return setError("Please enter the complete 6-digit OTP.");

    if (demoMode.isActive) {
      const demoOTP = localStorage.getItem("demo_otp") || getDemoOTP();
      if (code !== demoOTP) return setError(`In demo mode use: ${demoOTP}`);
    }

    setIsLoading(true);
    setError(null);

    try {
      const phone = localStorage.getItem("pending_phone");
      if (!phone)
        throw new Error("Phone number not found. Please login again.");

      if (demoMode.isActive) {
        await new Promise((r) => setTimeout(r, 900));
        const { DEMO_USERS } = await import("@/data/demo-users");
        const user = {
          ...DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)],
          phone,
          demoMode: true,
        };
        localStorage.setItem("mock_user", JSON.stringify(user));
        localStorage.setItem("mock_auth_token", `mock_${Date.now()}`);
        localStorage.setItem("demo_mode", "true");
        localStorage.removeItem("pending_phone");
        localStorage.removeItem("demo_otp");
        router.push(callbackUrl);
        return;
      }

      const confirmationResult = (window as any).confirmationResult;
      if (!confirmationResult) {
        await new Promise((r) => setTimeout(r, 1200));
        localStorage.setItem("auth_token", `jwt_${Date.now()}`);
        localStorage.setItem(
          "user",
          JSON.stringify({ phoneNumber: phone, uid: `user_${Date.now()}` }),
        );
        localStorage.removeItem("pending_phone");
        router.push(callbackUrl);
        return;
      }

      const result = await verifyOTP(confirmationResult, code);
      const idToken = await result.user.getIdToken();
      localStorage.setItem("auth_token", idToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          phoneNumber: result.user.phoneNumber,
          uid: result.user.uid,
        }),
      );
      localStorage.removeItem("pending_phone");
      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsResending(true);
    setError(null);
    try {
      const phone = localStorage.getItem("pending_phone");
      if (!phone) throw new Error("Phone number not found.");
      await import("@/lib/auth").then(({ sendOTP }) => sendOTP(phone));
      setResendTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      const timer = setInterval(() => {
        setResendTimer((p) => {
          if (p <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const otpFilled = otp.join("").length === 6;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      {/* Soft background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lavender-100 rounded-full blur-3xl opacity-30 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blush-100 rounded-full blur-3xl opacity-25 translate-y-1/3 -translate-x-1/3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Demo banner */}
        {demoMode.isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-3 rounded-xl bg-lavender-50 border border-lavender-200"
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-lavender-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-lavender-700">
                  Demo Mode
                </p>
                <p className="text-xs text-lavender-600">
                  Use OTP:{" "}
                  <code className="font-mono font-bold">{getDemoOTP()}</code>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Heading */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center mb-5">
            <ShieldCheck
              className="w-6 h-6 text-lavender-600"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 mb-1">
            Enter OTP
          </h1>
          <p className="text-sm text-ink-500">
            Sent to{" "}
            <span className="font-medium text-ink-700">{maskedPhone}</span>
          </p>
        </div>

        {/* OTP boxes */}
        <div className="flex justify-between gap-2 mb-5">
          {otp.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "w-12 h-14 text-center text-xl font-bold rounded-xl border bg-white",
                "transition-all duration-150 outline-none",
                digit
                  ? "border-lavender-400 bg-lavender-50 text-lavender-700"
                  : "border-ink-200 text-ink-900",
                "focus:border-lavender-500 focus:ring-2 focus:ring-lavender-100",
              )}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
          >
            {error}
          </motion.div>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || !otpFilled}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
            </>
          ) : (
            "Verify & Continue"
          )}
        </button>

        {/* Resend */}
        <div className="text-center text-sm text-ink-400 mb-8">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 text-ink-700 font-medium hover:underline disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                </>
              )}
            </button>
          ) : (
            <span>
              Resend in{" "}
              <span className="font-medium text-ink-600">{resendTimer}s</span>
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-ink-100" />
          <span className="text-xs text-ink-400">or verify with</span>
          <div className="flex-1 h-px bg-ink-100" />
        </div>

        {/* DigiLocker */}
        <AnimatePresence>
          {!showDigiLocker ? (
            <motion.button
              key="digilocker-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setShowDigiLocker(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-ink-200 text-sm text-ink-500 hover:border-ink-400 hover:text-ink-700 transition-colors"
            >
              <Building2 className="w-4 h-4" strokeWidth={1.5} />
              DigiLocker Identity Verification
            </motion.button>
          ) : (
            <motion.div
              key="digilocker-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-sky-50 border border-sky-200"
            >
              <p className="text-sm font-semibold text-sky-800 mb-1">
                DigiLocker Verification
              </p>
              <p className="text-xs text-sky-600 mb-3">
                Verify via government-issued Aadhaar for gold-tier marriage
                profiles.
              </p>
              <button
                onClick={() => {
                  const url = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_DIGILOCKER_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DIGILOCKER_REDIRECT_URI || "")}&scope=profile`;
                  window.location.href = url;
                }}
                className="w-full py-2 rounded-lg bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800 transition-colors"
              >
                Connect DigiLocker
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function OTPVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
          <div className="text-ink-400">Loading...</div>
        </div>
      }
    >
      <OTPVerifyContent />
    </Suspense>
  );
}
