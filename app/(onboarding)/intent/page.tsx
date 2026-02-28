"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Flower2,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

type IntentType =
  | "marriage-soon"
  | "serious-relationship"
  | "friendship-networking"
  | "healing-space";

const OPTIONS = [
  {
    id: "marriage-soon" as IntentType,
    icon: Sparkles,
    title: "Marriage within 1–2 years",
    titleHi: "1-2 वर्षों में विवाह",
    desc: "Ready to find your life partner and start a family",
    descHi: "अपने जीवनसाथी को खोजने और परिवार शुरू करने के लिए तैयार",
    bg: "bg-gradient-to-br from-blush-50 to-rose-50 border-blush-200",
    selectedBg: "bg-gradient-to-br from-blush-100 to-rose-100 border-blush-400",
    iconBg: "bg-gradient-to-br from-blush-100 to-rose-100",
    iconColor: "text-blush-600",
    popular: true,
  },
  {
    id: "serious-relationship" as IntentType,
    icon: Heart,
    title: "Serious with marriage potential",
    titleHi: "विवाह की संभावना के साथ गंभीर",
    desc: "Deep connection that could lead to marriage",
    descHi: "गहरा संबंध जो विवाह की ओर ले जा सकता है",
    bg: "bg-gradient-to-br from-lavender-50 to-violet-50 border-lavender-200",
    selectedBg:
      "bg-gradient-to-br from-lavender-100 to-violet-100 border-lavender-400",
    iconBg: "bg-gradient-to-br from-lavender-100 to-violet-100",
    iconColor: "text-lavender-600",
  },
  {
    id: "friendship-networking" as IntentType,
    icon: Users,
    title: "Friendship / Networking",
    titleHi: "मित्रता / नेटवर्किंग",
    desc: "Building meaningful connections in the community",
    descHi: "समुदाय में सार्थक संबंध बनाना",
    bg: "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200",
    selectedBg: "bg-gradient-to-br from-sky-100 to-blue-100 border-sky-400",
    iconBg: "bg-gradient-to-br from-sky-100 to-blue-100",
    iconColor: "text-sky-600",
  },
  {
    id: "healing-space" as IntentType,
    icon: Flower2,
    title: "Healing space",
    titleHi: "उपचार की जगह",
    desc: "Taking time to heal and grow before committing",
    descHi: "प्रतिबद्ध होने से पहले खुद को ठीक करने और बढ़ने का समय",
    bg: "bg-gradient-to-br from-sage-50 to-emerald-50 border-sage-200",
    selectedBg:
      "bg-gradient-to-br from-sage-100 to-emerald-100 border-sage-400",
    iconBg: "bg-gradient-to-br from-sage-100 to-emerald-100",
    iconColor: "text-sage-600",
  },
];

export default function IntentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<IntentType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    const data = JSON.parse(localStorage.getItem("onboarding_data") || "{}");
    data.intent = selected;
    localStorage.setItem("onboarding_data", JSON.stringify(data));
    setTimeout(() => router.push("/onboarding/values"), 350);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col px-5 py-8 safe-top safe-bottom">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-lavender-100 to-blush-100 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-peach-100 to-gold-100 rounded-full blur-3xl"
        />
      </div>

      {/* Step indicator */}
      <div className="relative z-10 flex items-center gap-2.5 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={cn(
              "h-1.5 rounded-full flex-1 transition-all duration-500",
              i === 1
                ? "bg-gradient-to-r from-blush-400 to-lavender-400"
                : "bg-ink-100",
            )}
          />
        ))}
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 flex items-center justify-center mb-5 shadow-xl shadow-ink-900/20"
        >
          <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-[1.85rem] font-extrabold text-ink-900 tracking-tight leading-tight mb-2">
          What brings you
          <br />
          to Bandhan?
        </h1>
        <p className="text-sm text-ink-500 font-medium">
          Choose what best describes your journey
        </p>
        <p className="text-xs text-ink-400 mt-1 hindi-text">
          बताएं कि आप बंधन में क्यों आए हैं
        </p>
      </motion.div>

      {/* Option cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {OPTIONS.map((opt, i) => {
          const isSelected = selected === opt.id;
          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "relative text-left rounded-2xl p-4 border-2 transition-all duration-300 w-full",
                  isSelected
                    ? cn(
                        opt.selectedBg,
                        "shadow-lg shadow-blush-500/10 scale-[1.02]",
                      )
                    : cn(
                        opt.bg,
                        "hover:brightness-98 hover:shadow-md",
                        "bg-white",
                      ),
                )}
              >
                {/* Popular badge */}
                {opt.popular && !isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-white text-[9px] font-bold shadow-sm"
                  >
                    <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                    Popular
                  </motion.div>
                )}

                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br from-ink-900 to-ink-700 flex items-center justify-center shadow-md"
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm",
                    opt.iconBg,
                  )}
                >
                  <opt.icon
                    className={cn("w-5 h-5", opt.iconColor)}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Content */}
                <h3 className="text-[14px] font-bold text-ink-900 mb-0.5 leading-snug">
                  {opt.title}
                </h3>
                <p className="text-[11px] text-ink-400 hindi-text mb-1.5">
                  {opt.titleHi}
                </p>
                <p className="text-[12px] text-ink-600 leading-relaxed">
                  {opt.desc}
                </p>
                <p className="text-[11px] text-ink-400 hindi-text mt-0.5 line-clamp-2">
                  {opt.descHi}
                </p>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-8"
      >
        <motion.button
          onClick={handleContinue}
          disabled={!selected || loading}
          whileHover={{ scale: selected && !loading ? 1.02 : 1 }}
          whileTap={{ scale: selected && !loading ? 0.97 : 1 }}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg",
            selected
              ? "bg-gradient-to-r from-ink-900 via-ink-800 to-ink-900 text-white hover:shadow-xl hover:shadow-ink-900/30"
              : "bg-ink-100 text-ink-400 cursor-not-allowed shadow-none",
          )}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
        <p className="text-center text-[11px] text-ink-400 mt-3 font-medium">
          You can change this anytime in settings
        </p>
      </motion.div>
    </div>
  );
}
