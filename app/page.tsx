"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Shield, Sparkles, Users, ShieldCheck, Lock, Star } from "lucide-react";
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
        : "/discover";

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
        <div className="text-ink-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-hero px-6">
      {/* Enhanced ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-lavender-100 to-blush-100 blur-[120px]"
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
          className="absolute -bottom-32 -left-32 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-peach-100 to-gold-100 blur-[100px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sage-50 to-sky-50 blur-[110px]"
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
            className="absolute h-1 w-1 rounded-full bg-gradient-to-r from-blush-300 to-lavender-300"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
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
          className="relative mx-auto mb-8"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 scale-125 rounded-[28px] bg-gradient-to-br from-blush-200 via-lavender-200 to-gold-200 opacity-40 blur-2xl" />

          {/* Main logo container */}
          <div className="relative">
            <div className="flex h-[84px] w-[84px] items-center justify-center rounded-[26px] bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 shadow-2xl shadow-ink-900/30">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Heart
                  className="h-10 w-10 text-white"
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
              className="absolute -right-2 -top-2"
            >
              <Sparkles className="h-5 w-5 text-gold-400" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1, 0], rotate: -180 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="absolute -bottom-1 -left-1"
            >
              <Star className="h-4 w-4 text-blush-400" />
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
          <h1 className="text-[2.25rem] font-extrabold leading-none tracking-[-0.04em] text-ink-900">
            <span className="bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900 bg-clip-text text-transparent">
              Bandhan
            </span>
            <span className="ml-1 font-light text-ink-400">AI</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2.5 text-[0.85rem] font-medium uppercase tracking-wide text-ink-500"
          >
            Your Sacred Journey Begins
          </motion.p>
          <p className="hindi-text mt-0.5 text-[0.7rem] text-ink-400">
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
                <span className="bg-gradient-to-r from-ink-900 to-ink-600 bg-clip-text text-xl font-extrabold text-transparent">
                  {value}
                </span>
                <Icon className="h-3.5 w-3.5 text-ink-400" strokeWidth={2} />
              </div>
              <span className="mt-0.5 text-[9px] font-medium text-ink-400">{label}</span>
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
          {FEATURES.map(({ icon: Icon, label, sublabel, bg, iconBg, iconColor }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 transition-all duration-200",
                bg,
                "cursor-default hover:shadow-md",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl",
                  iconBg,
                )}
              >
                <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[12px] font-semibold text-ink-800">{label}</p>
                <p className="text-[10px] text-ink-500">{sublabel}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-10"
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-ink-100 shadow-inner">
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
              className="text-[11px] font-medium text-ink-400"
            >
              Preparing your matches...
            </motion.span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3 w-3 text-lavender-400" />
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
        <div className="flex flex-wrap items-center justify-center gap-4">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-1.5 rounded-full border border-ink-100 bg-white/60 px-2.5 py-1.5 shadow-sm backdrop-blur-sm"
            >
              <Icon className="h-3 w-3 text-ink-400" strokeWidth={2} />
              <span className="whitespace-nowrap text-[9px] font-medium text-ink-500">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
