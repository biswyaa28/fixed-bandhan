/**
 * Bandhan AI - Verification Wizard Page
 * Step-by-step verification flow for all tiers
 *
 * Flow:
 * 1. Phone OTP → Bronze badge
 * 2. DigiLocker OAuth → Silver badge
 * 3. Video selfie (liveness) → Gold badge
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  BadgeCheck,
  Video,
  Shield,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Camera,
  Mic,
  AlertCircle,
  Info,
  Sparkles,
  Crown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  VerificationTier,
  VerificationBadgeLarge,
} from "@/components/VerificationBadge";
import { VerificationProgress } from "@/components/VerificationProgress";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type VerificationStep = "intro" | "phone" | "digilocker" | "video" | "complete";

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    title: "Get Verified",
    subtitle: "Build trust and unlock premium benefits",
    steps: "Verification Steps",
    skip: "Skip for now",
    back: "Back",
    continue: "Continue",
    completeAction: "Complete Verification",
    phone: {
      title: "Verify Phone Number",
      subtitle: "Enter the OTP sent to your phone",
      enterPhone: "Enter phone number",
      sendOtp: "Send OTP",
      enterOtp: "Enter 6-digit OTP",
      verifyOtp: "Verify OTP",
      benefit: "Get Bronze badge + 5 bonus profile views",
    },
    digilocker: {
      title: "Connect DigiLocker",
      subtitle: "Verify your identity with government ID",
      description: "DigiLocker is a secure platform by Government of India",
      connect: "Connect with DigiLocker",
      benefit: "Get Silver badge + 10% premium discount",
      supported: "Supported IDs: Aadhaar, PAN, Passport, Driving License",
    },
    video: {
      title: "Video Selfie",
      subtitle: "Quick selfie to verify you are real",
      description: "This helps prevent fake profiles and catfishing",
      record: "Record Selfie",
      retake: "Retake",
      use: "Use This Photo",
      instructions: [
        "Look directly at the camera",
        "Ensure good lighting",
        "Remove glasses or face coverings",
        "Smile naturally",
      ],
      benefit: "Get Gold badge + Priority matching",
    },
    complete: {
      title: "Verification Complete! 🎉",
      subtitle: "You now have maximum verification",
      benefits: "Your Benefits:",
      priorityMatching: "Priority in match suggestions",
      premiumDiscount: "15% off on Premium plans",
      trustBadge: "Gold trust badge on profile",
      startExploring: "Start Exploring",
    },
  },
  hi: {
    title: "सत्यापित हों",
    subtitle: "विश्वास बनाएं और प्रीमियम लाभ अनलॉक करें",
    steps: "सत्यापन चरण",
    skip: "अभी के लिए छोड़ें",
    back: "वापस",
    continue: "जारी रखें",
    completeAction: "सत्यापन पूरा करें",
    phone: {
      title: "फ़ोन नंबर सत्यापित करें",
      subtitle: "अपने फ़ोन पर भेजे गए OTP को दर्ज करें",
      enterPhone: "फ़ोन नंबर दर्ज करें",
      sendOtp: "OTP भेजें",
      enterOtp: "6-अंकीय OTP दर्ज करें",
      verifyOtp: "OTP सत्यापित करें",
      benefit: "ब्रॉन्ज बैज + 5 बोनस प्रोफ़ाइल दृश्य प्राप्त करें",
    },
    digilocker: {
      title: "DigiLocker कनेक्ट करें",
      subtitle: "सरकारी ID के साथ अपनी पहचान सत्यापित करें",
      description: "DigiLocker भारत सरकार का सुरक्षित प्लेटफॉर्म है",
      connect: "DigiLocker से कनेक्ट करें",
      benefit: "सिल्वर बैज + 10% प्रीमियम छूट प्राप्त करें",
      supported: "समर्थित ID: आधार, पैन, पासपोर्ट, ड्राइविंग लाइसेंस",
    },
    video: {
      title: "वीडियो सेल्फी",
      subtitle: "यह सत्यापित करने के लिए त्वरित सेल्फी कि आप वास्तविक हैं",
      description: "यह नकली प्रोफ़ाइल और कैटफिशिंग को रोकने में मदद करता है",
      record: "सेल्फी रिकॉर्ड करें",
      retake: "पुनः लें",
      use: "यह फ़ोटो उपयोग करें",
      instructions: [
        "कैमरे की ओर सीधे देखें",
        "अच्छी रोशनी सुनिश्चित करें",
        "चश्मा या चेहरा कवर हटाएं",
        "प्राकृतिक रूप से मुस्कुराएं",
      ],
      benefit: "गोल्ड बैज + प्राथमिकता मिलान प्राप्त करें",
    },
    complete: {
      title: "सत्यापन पूर्ण! 🎉",
      subtitle: "अब आपके पास अधिकतम सत्यापन है",
      benefits: "आपके लाभ:",
      priorityMatching: "मैच सुझावों में प्राथमिकता",
      premiumDiscount: "प्रीमियम योजनाओं पर 15% छूट",
      trustBadge: "प्रोफ़ाइल पर गोल्ड ट्रस्ट बैज",
      startExploring: "खोजना शुरू करें",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Phone Verification Step
// ─────────────────────────────────────────────────────────────────────────────
function PhoneVerificationStep({
  onComplete,
  language,
}: {
  onComplete: () => void;
  language: "en" | "hi";
}) {
  const t = TRANSLATIONS[language].phone;
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    setIsLoading(true);
    // Simulate OTP send
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setOtpSent(true);
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    // Simulate OTP verify
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 mb-4">
          <Smartphone className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{t.title}</h2>
        <p className="text-sm text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {!otpSent ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              {t.enterPhone}
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 XXXXXXXXXX"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendOtp}
            disabled={!phoneNumber || isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : t.sendOtp}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[index] = e.target.value.replace(/\D/g, "");
                  setOtp(newOtp);
                  if (e.target.value && index < 5) {
                    // Auto-focus next input
                  }
                }}
                className="w-10 h-12 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerifyOtp}
            disabled={otp.join("").length !== 6 || isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : t.verifyOtp}
          </motion.button>
        </div>
      )}

      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <p className="text-xs text-amber-200">{t.benefit}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DigiLocker Verification Step
// ─────────────────────────────────────────────────────────────────────────────
function DigiLockerVerificationStep({
  onComplete,
  language,
}: {
  onComplete: () => void;
  language: "en" | "hi";
}) {
  const t = TRANSLATIONS[language].digilocker;
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    // Simulate DigiLocker OAuth
    // In production: window.location.href = digilockerAuthUrl;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-400/20 to-gray-500/20 border border-gray-400/30 mb-4">
          <BadgeCheck className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-white">{t.title}</h2>
        <p className="text-sm text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-200">{t.description}</p>
            <p className="text-xs text-blue-300/70 mt-2">{t.supported}</p>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-5 h-5" />
            </motion.div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <BadgeCheck className="w-5 h-5" />
            <span>{t.connect}</span>
          </>
        )}
      </motion.button>

      <div className="p-3 rounded-xl bg-gray-400/10 border border-gray-400/20">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gray-300" />
          <p className="text-xs text-gray-200">{t.benefit}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Selfie Verification Step
// ─────────────────────────────────────────────────────────────────────────────
function VideoSelfieVerificationStep({
  onComplete,
  language,
}: {
  onComplete: () => void;
  language: "en" | "hi";
}) {
  const t = TRANSLATIONS[language].video;
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleRecord = () => {
    setIsRecording(true);
    // Countdown before recording
    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        // Simulate 3-second recording
        setTimeout(() => {
          setIsRecording(false);
          setHasRecorded(true);
        }, 3000);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 mb-4">
          <Video className="w-8 h-8 text-yellow-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{t.title}</h2>
        <p className="text-sm text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        {t.instructions.map((instruction, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-gray-300">{instruction}</span>
          </div>
        ))}
      </div>

      {/* Camera Preview */}
      <div className="relative aspect-[3/4] rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 overflow-hidden">
        {isRecording ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-red-500/30 border-2 border-red-500 flex items-center justify-center mb-4"
              >
                <div className="w-6 h-6 rounded-full bg-red-500" />
              </motion.div>
              {countdown > 0 && (
                <motion.span
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold text-white"
                >
                  {countdown}
                </motion.span>
              )}
            </div>
          </div>
        ) : hasRecorded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
            <CheckCircle2 className="w-20 h-20 text-yellow-400" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-gray-600" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!hasRecorded ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRecord}
          disabled={isRecording}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Camera className="w-5 h-5" />
          <span>{isRecording ? "Recording..." : t.record}</span>
        </motion.button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setHasRecorded(false)}
            className="py-3.5 rounded-xl glass-sm border border-white/10 text-gray-300 font-medium hover:bg-white/5"
          >
            {t.retake}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold"
          >
            {t.use}
          </motion.button>
        </div>
      )}

      <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <p className="text-xs text-yellow-200">{t.benefit}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Completion Screen
// ─────────────────────────────────────────────────────────────────────────────
function CompletionScreen({
  language,
  onContinue,
}: {
  language: "en" | "hi";
  onContinue: () => void;
}) {
  const t = TRANSLATIONS[language].complete;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500/20 to-yellow-500/20 border border-gold-500/30 mb-4"
        >
          <Crown className="w-10 h-10 text-gold-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">{t.title}</h2>
        <p className="text-sm text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {/* Gold Badge Display */}
      <div className="flex justify-center">
        <VerificationBadgeLarge tier="gold" language={language} />
      </div>

      {/* Benefits */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">{t.benefits}</h3>
        <div className="space-y-2">
          {[
            { icon: TrendingUp, text: t.priorityMatching },
            { icon: Crown, text: t.premiumDiscount },
            { icon: ShieldCheck, text: t.trustBadge },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center space-x-3 p-3 rounded-xl bg-ink-50 border border-ink-100"
            >
              <item.icon className="w-5 h-5 text-gold-500 flex-shrink-0" />
              <span className="text-sm text-ink-700">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full py-3 rounded-xl bg-ink-900 text-white font-semibold text-sm hover:bg-ink-700 transition-colors"
      >
        {t.startExploring}
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function VerifyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<VerificationStep>("intro");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [completedSteps, setCompletedSteps] = useState<
    ("phone" | "digilocker" | "video")[]
  >([]);

  const t = TRANSLATIONS[language];

  const handleStepComplete = (step: "phone" | "digilocker" | "video") => {
    setCompletedSteps((prev) => [...prev, step]);

    // Move to next step
    if (step === "phone") {
      setCurrentStep("digilocker");
    } else if (step === "digilocker") {
      setCurrentStep("video");
    } else if (step === "video") {
      setCurrentStep("complete");
    }
  };

  const getCurrentTier = (): VerificationTier | null => {
    if (completedSteps.includes("video")) return "gold";
    if (completedSteps.includes("digilocker")) return "silver";
    if (completedSteps.includes("phone")) return "bronze";
    return null;
  };

  return (
    <div className="min-h-screen bg-ink-50 px-4 py-8 safe-top safe-bottom">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6 pt-10"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-ink-200 bg-white text-ink-500 hover:text-ink-700 hover:border-ink-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold text-ink-900">{t.title}</h1>
            <p className="text-xs text-ink-400">{t.subtitle}</p>
          </div>

          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="px-3 py-1.5 rounded-xl border border-ink-200 bg-white text-xs text-ink-500 hover:text-ink-700 transition-colors"
          >
            {language === "en" ? "हिंदी" : "English"}
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="relative z-10 max-w-md mx-auto"
      >
        <div className="bg-white rounded-2xl p-6 border border-ink-100 shadow-sm">
          <AnimatePresence mode="wait">
            {currentStep === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <VerificationProgress
                  currentTier={getCurrentTier()}
                  completedSteps={completedSteps}
                  onVerify={(step) => {
                    if (step === "phone") setCurrentStep("phone");
                    if (step === "digilocker") setCurrentStep("digilocker");
                    if (step === "video") setCurrentStep("video");
                  }}
                />

                <div className="pt-4 border-t border-ink-100">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep("phone")}
                    className="w-full py-3 rounded-xl bg-ink-900 text-white font-semibold text-sm hover:bg-ink-700 transition-colors"
                  >
                    {t.continue}
                  </motion.button>
                  <button
                    onClick={() => router.back()}
                    className="w-full py-3 mt-2 text-sm text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    {t.skip}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === "phone" && (
              <PhoneVerificationStep
                key="phone"
                onComplete={() => handleStepComplete("phone")}
                language={language}
              />
            )}

            {currentStep === "digilocker" && (
              <DigiLockerVerificationStep
                key="digilocker"
                onComplete={() => handleStepComplete("digilocker")}
                language={language}
              />
            )}

            {currentStep === "video" && (
              <VideoSelfieVerificationStep
                key="video"
                onComplete={() => handleStepComplete("video")}
                language={language}
              />
            )}

            {currentStep === "complete" && (
              <CompletionScreen
                key="complete"
                language={language}
                onContinue={() => router.push("/dashboard")}
              />
            )}
          </AnimatePresence>
        </div>

        {["phone", "digilocker", "video"].includes(currentStep) && (
          <button
            onClick={() => setCurrentStep("intro")}
            className="w-full py-3 mt-4 text-sm text-ink-400 hover:text-ink-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </button>
        )}
      </motion.main>
    </div>
  );
}
