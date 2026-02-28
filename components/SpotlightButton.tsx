/**
 * Bandhan AI — Spotlight Button (Tinder "Boost" equivalent)
 * Temporary visibility increase: 2 hours, 1/week free.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Crown, Eye, Clock, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

export interface SpotlightButtonProps {
  isPremium?: boolean;
  weeklyRemaining?: number;
  onActivate?: () => void;
  onUpgrade?: () => void;
  language?: "en" | "hi";
  className?: string;
}

const SPOTLIGHT_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const STORAGE_KEY = "bandhan-spotlight";

interface SpotlightState {
  activeUntil: number | null;
  weeklyUsed: number;
  weekStart: string;
}

function loadState(): SpotlightState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state: SpotlightState = JSON.parse(stored);
      // Reset weekly count if new week
      const now = new Date();
      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay(),
      )
        .toISOString()
        .split("T")[0];
      if (state.weekStart !== weekStart) {
        return { activeUntil: state.activeUntil, weeklyUsed: 0, weekStart };
      }
      return state;
    }
  } catch {}
  const now = new Date();
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay(),
  )
    .toISOString()
    .split("T")[0];
  return { activeUntil: null, weeklyUsed: 0, weekStart };
}

function saveState(state: SpotlightState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function SpotlightButton({
  isPremium = false,
  weeklyRemaining: weeklyRemainingProp,
  onActivate,
  onUpgrade,
  language = "en",
  className,
}: SpotlightButtonProps) {
  const [state, setState] = useState<SpotlightState>({
    activeUntil: null,
    weeklyUsed: 0,
    weekStart: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Hydrate from localStorage on client mount (SSR-safe)
  useEffect(() => {
    setState(loadState());
  }, []);

  const isActive = state.activeUntil !== null && state.activeUntil > Date.now();
  const maxWeekly = isPremium ? 3 : 1;
  const remaining = weeklyRemainingProp ?? maxWeekly - state.weeklyUsed;
  const canActivate = remaining > 0 || isPremium;

  // Timer
  useEffect(() => {
    if (!isActive) return;
    const tick = () => {
      const left = (state.activeUntil ?? 0) - Date.now();
      if (left <= 0) {
        setState((s) => {
          const next = { ...s, activeUntil: null };
          saveState(next);
          return next;
        });
        return;
      }
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      setTimeLeft(
        `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, state.activeUntil]);

  const handleActivate = useCallback(() => {
    if (isActive) return;
    if (!canActivate) {
      onUpgrade?.();
      return;
    }
    const next: SpotlightState = {
      ...state,
      activeUntil: Date.now() + SPOTLIGHT_DURATION_MS,
      weeklyUsed: state.weeklyUsed + 1,
    };
    setState(next);
    saveState(next);
    onActivate?.();
    setShowModal(false);
  }, [isActive, canActivate, state, onActivate, onUpgrade]);

  // Active badge
  if (isActive) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 border-2 border-black bg-[#424242] text-white shadow-[2px_2px_0px_#000000]",
          className,
        )}
      >
        <Zap className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
        <div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider block leading-none">
            {language === "en" ? "In Spotlight" : "स्पॉटलाइट में"}
          </span>
          <span className="text-[9px] font-pixel text-[#9E9E9E] leading-none flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5" strokeWidth={2} /> {timeLeft}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5",
          "border-[3px] border-black cursor-pointer",
          "text-xs font-heading font-bold uppercase",
          "transition-[transform,box-shadow] duration-150",
          canActivate
            ? "bg-white text-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]"
            : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] shadow-none",
          className,
        )}
      >
        <Zap className="w-4 h-4" strokeWidth={2.5} />
        {language === "en" ? "Spotlight" : "स्पॉटलाइट"}
        <span className="text-[9px] font-pixel text-[#9E9E9E]">
          {isPremium ? "∞" : `${remaining}/${maxWeekly}`}
        </span>
      </button>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="relative w-[90%] max-w-[360px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000]"
            >
              <div className="px-6 py-3 bg-black text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-xs font-heading font-bold uppercase tracking-wider">
                    {language === "en"
                      ? "Activate Spotlight"
                      : "स्पॉटलाइट सक्रिय करें"}
                  </span>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>

              <div className="px-6 py-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F8F8F8] border-2 border-black flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#424242]" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-black m-0 mb-1">
                  {language === "en" ? "Be seen by everyone" : "सबके सामने आएं"}
                </p>
                <p className="text-xs text-[#9E9E9E] m-0 mb-4 leading-normal">
                  {language === "en"
                    ? "Your profile will appear in the top 10 for everyone in your area for 2 hours."
                    : "आपकी प्रोफ़ाइल 2 घंटे के लिए आपके क्षेत्र में सबसे ऊपर दिखेगी।"}
                </p>

                <div className="flex items-center justify-center gap-4 mb-4 text-center">
                  <div>
                    <Eye
                      className="w-5 h-5 mx-auto text-[#424242] mb-1"
                      strokeWidth={2}
                    />
                    <span className="text-[10px] font-bold text-[#424242] block">
                      10x
                    </span>
                    <span className="text-[9px] text-[#9E9E9E]">
                      {language === "en" ? "Views" : "व्यूज़"}
                    </span>
                  </div>
                  <div>
                    <Clock
                      className="w-5 h-5 mx-auto text-[#424242] mb-1"
                      strokeWidth={2}
                    />
                    <span className="text-[10px] font-bold text-[#424242] block">
                      2h
                    </span>
                    <span className="text-[9px] text-[#9E9E9E]">
                      {language === "en" ? "Duration" : "अवधि"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleActivate}
                  disabled={!canActivate}
                  className={cn(
                    "w-full py-3 border-[3px] border-black text-xs font-heading font-bold uppercase cursor-pointer",
                    canActivate
                      ? "bg-black text-white shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-[transform,box-shadow] duration-150"
                      : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-default",
                  )}
                >
                  {canActivate
                    ? language === "en"
                      ? "⚡ Activate Now"
                      : "⚡ अभी सक्रिय करें"
                    : language === "en"
                      ? "No spotlights left"
                      : "स्पॉटलाइट बाकी नहीं"}
                </button>

                {!canActivate && !isPremium && (
                  <button
                    onClick={onUpgrade}
                    className="mt-2 w-full py-2 text-[10px] font-heading font-bold uppercase text-[#424242] bg-transparent border-none cursor-pointer hover:text-black flex items-center justify-center gap-1"
                  >
                    <Crown className="w-3 h-3" strokeWidth={2} />
                    {language === "en"
                      ? "Get 3/week with Premium"
                      : "प्रीमियम से 3/सप्ताह पाएं"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SpotlightButton;
