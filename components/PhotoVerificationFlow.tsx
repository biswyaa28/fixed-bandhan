/**
 * Bandhan AI — Photo Verification Flow (Tinder "Verified" badge)
 * Step-by-step comic-panel verification: selfie → pose → review → badge.
 */
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, CheckCircle2, X, Shield, ChevronRight,
  AlertCircle, User, Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

type VerifStep = "intro" | "selfie" | "pose" | "reviewing" | "success" | "failed";

export interface PhotoVerificationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  language?: "en" | "hi";
}

const POSES = [
  { en: "Show a thumbs up 👍", hi: "अंगूठा दिखाएं 👍" },
  { en: "Hold up 2 fingers ✌️", hi: "2 उंगलियां दिखाएं ✌️" },
  { en: "Place hand on chin 🤔", hi: "हाथ ठोड़ी पर रखें 🤔" },
];

export function PhotoVerificationFlow({
  isOpen,
  onClose,
  onComplete,
  language = "en",
}: PhotoVerificationFlowProps) {
  const [step, setStep] = useState<VerifStep>("intro");
  const [pose] = useState(() => POSES[Math.floor(Math.random() * POSES.length)]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [posePreview, setPosePreview] = useState<string | null>(null);

  const handleFileSelect = (target: "selfie" | "pose") => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setTimeout(() => setStep("success"), 2500);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
    setStep("intro");
    setSelfiePreview(null);
    setPosePreview(null);
  };

  const totalSteps = 3;
  const currentStep = step === "selfie" ? 1 : step === "pose" ? 2 : step === "reviewing" || step === "success" || step === "failed" ? 3 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="dialog"
            aria-modal="true"
            className="relative w-[90%] max-w-[400px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-black text-white">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-xs font-heading font-bold uppercase tracking-wider">
                  {language === "en" ? "Photo Verification" : "फ़ोटो सत्यापन"}
                </span>
              </div>
              <button onClick={onClose} className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer" aria-label="Close">
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            {/* Progress */}
            {currentStep > 0 && (
              <div className="px-6 pt-4">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] font-bold text-[#9E9E9E]">
                    Step {currentStep}/{totalSteps}
                  </span>
                </div>
                <div className="h-2 bg-[#E0E0E0] border border-black overflow-hidden">
                  <motion.div
                    className="h-full bg-black"
                    animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <div className="px-6 py-6">
              {/* Intro */}
              {step === "intro" && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#F8F8F8] border-2 border-black flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[#424242]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-heading font-bold text-black uppercase m-0 mb-2">
                    {language === "en" ? "Get Verified" : "सत्यापित हों"}
                  </h3>
                  <p className="text-xs text-[#424242] m-0 mb-4 leading-normal max-w-[280px] mx-auto">
                    {language === "en"
                      ? "Verify your photos to get a trusted badge. It takes just 60 seconds."
                      : "विश्वसनीय बैज पाने के लिए अपनी फ़ोटो सत्यापित करें। बस 60 सेकंड लगते हैं।"}
                  </p>
                  <div className="space-y-2 text-left mb-4">
                    {[
                      { en: "1. Take a selfie", hi: "1. सेल्फ़ी लें" },
                      { en: "2. Match a random pose", hi: "2. एक पोज़ मैच करें" },
                      { en: "3. AI verifies your identity", hi: "3. AI आपकी पहचान सत्यापित करता है" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#F8F8F8] border border-[#E0E0E0]">
                        <span className="text-xs font-bold text-[#424242]">{language === "en" ? s.en : s.hi}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep("selfie")}
                    className="w-full py-3 border-[3px] border-black bg-black text-white text-xs font-heading font-bold uppercase cursor-pointer shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-[transform,box-shadow] duration-150"
                  >
                    {language === "en" ? "Start Verification" : "सत्यापन शुरू करें"}
                  </button>
                </div>
              )}

              {/* Selfie */}
              {step === "selfie" && (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-[#F8F8F8] border-2 border-dashed border-black flex items-center justify-center">
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-[#E0E0E0]" strokeWidth={1.5} />
                    )}
                  </div>
                  <p className="text-sm font-bold text-black m-0 mb-1">
                    {language === "en" ? "Take a clear selfie" : "एक साफ़ सेल्फ़ी लें"}
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mb-4">
                    {language === "en" ? "Good lighting, face centered" : "अच्छी रोशनी, चेहरा बीच में"}
                  </p>
                  <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handleFileSelect("selfie")} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-3 border-[3px] border-black bg-white text-black text-xs font-heading font-bold uppercase cursor-pointer shadow-[4px_4px_0px_#000000] hover:bg-black hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" strokeWidth={2} />
                    {language === "en" ? "Take Selfie" : "सेल्फ़ी लें"}
                  </button>
                </div>
              )}

              {/* Pose */}
              {step === "pose" && (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-[#F8F8F8] border-2 border-dashed border-black flex items-center justify-center">
                    {posePreview ? (
                      <img src={posePreview} alt="Pose" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{language === "en" ? pose.en.slice(-2) : pose.hi.slice(-2)}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-black m-0 mb-1">
                    {language === "en" ? pose.en : pose.hi}
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mb-4">
                    {language === "en" ? "This proves you're a real person" : "यह साबित करता है कि आप एक असली व्यक्ति हैं"}
                  </p>
                  <input type="file" accept="image/*" capture="user" onChange={handleFileSelect("pose")} className="hidden" id="pose-upload" />
                  <label
                    htmlFor="pose-upload"
                    className="w-full py-3 border-[3px] border-black bg-white text-black text-xs font-heading font-bold uppercase cursor-pointer shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
                  >
                    <Camera className="w-4 h-4" strokeWidth={2} />
                    {language === "en" ? "Take Pose Photo" : "पोज़ फ़ोटो लें"}
                  </label>
                </div>
              )}

              {/* Reviewing */}
              {step === "reviewing" && (
                <div className="text-center py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 mx-auto mb-4 border-2 border-black border-t-transparent"
                  />
                  <p className="text-sm font-heading font-bold text-black uppercase m-0">
                    {language === "en" ? "Verifying..." : "सत्यापित हो रहा है..."}
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mt-2">
                    {language === "en" ? "AI is comparing your photos" : "AI आपकी फ़ोटो की तुलना कर रहा है"}
                  </p>
                </div>
              )}

              {/* Success */}
              {step === "success" && (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-16 h-16 mx-auto mb-4 bg-[#424242] border-2 border-black flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-sm font-heading font-bold text-black uppercase m-0 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" strokeWidth={2} />
                    {language === "en" ? "Verified!" : "सत्यापित!"}
                  </h3>
                  <p className="text-xs text-[#424242] m-0 mt-2 max-w-[260px] mx-auto leading-normal">
                    {language === "en"
                      ? "Your \"Verified Authentic\" badge is now active. Re-verification needed in 6 months."
                      : "आपका \"सत्यापित\" बैज अब सक्रिय है। 6 महीने में पुनः सत्यापन आवश्यक।"}
                  </p>
                  <button onClick={handleComplete} className="mt-4 px-6 py-2.5 border-[3px] border-black bg-black text-white text-xs font-heading font-bold uppercase cursor-pointer">
                    {language === "en" ? "Done" : "हो गया"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default PhotoVerificationFlow;
