"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Sparkles,
  Users,
  ShieldCheck,
  Lock,
  Star,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

const STATS = [
  { value: "2M+", label: "Happy Members", icon: Users },
  { value: "94%", label: "Success Rate", icon: Star },
  { value: "1.2L+", label: "Marriages", icon: Heart },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    label: "DigiLocker Verified",
    sublabel: "Government ID Check",
    bg: "bg-lavender-50 border-lavender-100",
    iconBg: "bg-lavender-100",
    iconColor: "text-lavender-600",
  },
  {
    icon: Sparkles,
    label: "AI-Powered Matching",
    sublabel: "94% Compatibility",
    bg: "bg-blush-50 border-blush-100",
    iconBg: "bg-blush-100",
    iconColor: "text-blush-600",
  },
  {
    icon: Lock,
    label: "100% Private & Secure",
    sublabel: "End-to-End Encrypted",
    bg: "bg-sage-50 border-sage-100",
    iconBg: "bg-sage-100",
    iconColor: "text-sage-600",
  },
];

const TRUST_BADGES = [
  { icon: Shield, label: "DPDP Act 2023" },
  { icon: ShieldCheck, label: "ISO 27001" },
  { icon: Lock, label: "Encrypted" },
];

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("auth_token");
    const published = localStorage.getItem("profile_published");
    const destination = !token
      ? "/login"
      : !published
        ? "/onboarding/intent"
        : "/matches";

    const start = Date.now();
    const duration = 2000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => router.push(destination), 300);
      }
    };
    requestAnimationFrame(tick);
  }, [router]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-ink-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Enhanced ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-lavender-100 to-blush-100 blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5,
          }}
          className="absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-peach-100 to-gold-100 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-sage-50 to-sky-50 blur-[110px]"
        />

        {/* Decorative particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
            }}
            animate={{
              opacity: [0, 0.3, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-blush-300 to-lavender-300"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center w-full max-w-sm">
        {/* Enhanced Logo mark */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 280,
            damping: 20,
          }}
          className="mx-auto mb-8 relative"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-blush-200 via-lavender-200 to-gold-200 blur-2xl opacity-40 scale-125" />

          {/* Main logo container */}
          <div className="relative">
            <div className="w-[84px] h-[84px] rounded-[26px] bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 flex items-center justify-center shadow-2xl shadow-ink-900/30">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart
                  className="w-10 h-10 text-white"
                  strokeWidth={1.5}
                  fill="white"
                  fillOpacity={0.2}
                />
              </motion.div>
            </div>

            {/* Sparkle accents */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1, 0], rotate: 180 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-5 h-5 text-gold-400" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1, 0], rotate: -180 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="absolute -bottom-1 -left-1"
            >
              <Star className="w-4 h-4 text-blush-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-2"
        >
          <h1 className="text-[2.25rem] font-extrabold tracking-[-0.04em] text-ink-900 leading-none">
            <span className="bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900 bg-clip-text text-transparent">
              Bandhan
            </span>
            <span className="text-ink-400 font-light ml-1">AI</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2.5 text-[0.85rem] text-ink-500 font-medium tracking-wide uppercase"
          >
            Your Sacred Journey Begins
          </motion.p>
          <p className="text-[0.7rem] text-ink-400 hindi-text mt-0.5">
            आपकी पवित्र यात्रा यहाँ शुरू होती है
          </p>
        </motion.div>

        {/* Enhanced Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-5"
        >
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold bg-gradient-to-r from-ink-900 to-ink-600 bg-clip-text text-transparent">
                  {value}
                </span>
                <Icon className="w-3.5 h-3.5 text-ink-400" strokeWidth={2} />
              </div>
              <span className="text-[9px] text-ink-400 mt-0.5 font-medium">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Feature chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-col gap-2"
        >
          {FEATURES.map(
            ({ icon: Icon, label, sublabel, bg, iconBg, iconColor }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200",
                  bg,
                  "hover:shadow-md cursor-default",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    iconBg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", iconColor)} strokeWidth={2} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[12px] font-semibold text-ink-800">
                    {label}
                  </p>
                  <p className="text-[10px] text-ink-500">{sublabel}</p>
                </div>
              </motion.div>
            ),
          )}
        </motion.div>

        {/* Enhanced Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-10"
        >
          <div className="h-1 w-full rounded-full bg-ink-100 overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blush-400 via-lavender-400 to-gold-400"
              style={{ width: `${progress * 100}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[11px] text-ink-400 font-medium"
            >
              Preparing your matches...
            </motion.span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3 h-3 text-lavender-400" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Bottom trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-0 right-0 px-6"
      >
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-ink-100 shadow-sm"
            >
              <Icon className="w-3 h-3 text-ink-400" strokeWidth={2} />
              <span className="text-[9px] text-ink-500 font-medium whitespace-nowrap">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
