"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Users,
  Clock,
  HandHeart,
  MessageCircleHeart,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

type StepId = "love-languages" | "dealbreakers" | "lifestyle";

const STEPS: { id: StepId; label: string }[] = [
  { id: "love-languages", label: "Love languages" },
  { id: "dealbreakers", label: "Deal-breakers" },
  { id: "lifestyle", label: "Lifestyle" },
];

const LOVE_LANGUAGES = [
  {
    id: "family",
    icon: HandHeart,
    label: "Caring for family elders",
    labelHi: "परिवार की देखभाल",
  },
  {
    id: "time",
    icon: Clock,
    label: "Quality time together",
    labelHi: "गुणवत्तापूर्ण समय",
  },
  {
    id: "serve",
    icon: Users,
    label: "Acts of service",
    labelHi: "सेवा के कार्य",
  },
  {
    id: "words",
    icon: MessageCircleHeart,
    label: "Words of affirmation",
    labelHi: "पुष्टि के शब्द",
  },
  {
    id: "touch",
    icon: Heart,
    label: "Physical touch",
    labelHi: "शारीरिक स्पर्श",
  },
];

const DEALBREAKERS = [
  { id: "smoking", label: "Smoking", labelHi: "धूम्रपान" },
  { id: "drinking", label: "Drinking alcohol", labelHi: "शराब पीना" },
  { id: "pets", label: "Pets at home", labelHi: "पालतू जानवर" },
  { id: "diet", label: "Non-vegetarian diet", labelHi: "मांसाहारी भोजन" },
];

const LEVELS = ["Dealbreaker", "Dislike", "Okay", "I do it too"];

const LIFESTYLE = [
  { id: "early", label: "Early riser 🌅", labelHi: "सुबह जल्दी उठना" },
  { id: "night", label: "Night owl 🌙", labelHi: "रात तक जागना" },
  { id: "fit", label: "Fitness focused 💪", labelHi: "फिटनेस" },
  { id: "travel", label: "Love to travel ✈️", labelHi: "यात्रा" },
  { id: "homebody", label: "Homebody 🏠", labelHi: "घर पर रहना" },
  { id: "social", label: "Socially active 🎉", labelHi: "सामाजिक" },
];

export default function ValuesPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("love-languages");
  const [loveLangs, setLoveLangs] = useState<string[]>([]);
  const [dbLevels, setDbLevels] = useState<Record<string, string>>({});
  const [lifestyle, setLifestyle] = useState<string[]>([]);

  const stepIdx = STEPS.findIndex((s) => s.id === step);

  const toggleLove = (id: string) =>
    setLoveLangs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleLifestyle = (id: string) =>
    setLifestyle((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleNext = () => {
    if (step === "love-languages") setStep("dealbreakers");
    else if (step === "dealbreakers") setStep("lifestyle");
    else {
      const data = JSON.parse(localStorage.getItem("onboarding_data") || "{}");
      data.values = { loveLangs, dbLevels, lifestyle };
      localStorage.setItem("onboarding_data", JSON.stringify(data));
      router.push("/onboarding/life-architecture");
    }
  };

  const handleBack = () => {
    if (step === "love-languages") router.back();
    else if (step === "dealbreakers") setStep("love-languages");
    else setStep("dealbreakers");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-5 py-8 safe-top safe-bottom">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-lavender-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 -left-16 w-64 h-64 bg-peach-100 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Step progress */}
      <div className="relative z-10 flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full flex-1",
              i <= 2 ? "bg-ink-900" : "bg-ink-100",
            )}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="p-2 rounded-xl text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
        >
          <ArrowLeft
            className="w-4.5 h-4.5 w-[18px] h-[18px]"
            strokeWidth={2}
          />
        </button>
        <div>
          <p className="text-[11px] text-ink-400 font-medium uppercase tracking-wide">
            Step 2 of 4 · {STEPS[stepIdx].label}
          </p>
          <h1 className="text-[1.45rem] font-bold text-ink-900 tracking-tight">
            {step === "love-languages" && "How do you show love?"}
            {step === "dealbreakers" && "Your deal-breakers"}
            {step === "lifestyle" && "Your lifestyle"}
          </h1>
        </div>
      </div>

      {/* Step sub-tabs */}
      <div className="relative z-10 flex gap-1.5 mb-6">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1 rounded-full flex-1 transition-all",
              i <= stepIdx ? "bg-ink-900" : "bg-ink-100",
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          {step === "love-languages" && (
            <motion.div
              key="love"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2.5"
            >
              <p className="text-sm text-ink-500 mb-4">
                Select all that resonate (pick up to 3)
              </p>
              {LOVE_LANGUAGES.map((lang) => {
                const on = loveLangs.includes(lang.id);
                return (
                  <motion.button
                    key={lang.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleLove(lang.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all",
                      on
                        ? "bg-lavender-50 border-lavender-400"
                        : "bg-white border-ink-100 hover:border-ink-200",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        on ? "bg-lavender-100" : "bg-ink-100",
                      )}
                    >
                      <lang.icon
                        className={cn(
                          "w-4.5 h-4.5 w-[18px] h-[18px]",
                          on ? "text-lavender-600" : "text-ink-500",
                        )}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-[13px] font-semibold",
                          on ? "text-lavender-900" : "text-ink-800",
                        )}
                      >
                        {lang.label}
                      </p>
                      <p className="text-[11px] text-ink-400 hindi-text">
                        {lang.labelHi}
                      </p>
                    </div>
                    {on && (
                      <Check
                        className="w-4 h-4 text-lavender-600 shrink-0"
                        strokeWidth={2.5}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {step === "dealbreakers" && (
            <motion.div
              key="db"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-ink-500 mb-4">
                How do you feel about each?
              </p>
              {DEALBREAKERS.map((db) => (
                <div
                  key={db.id}
                  className="bg-white rounded-2xl border border-ink-100 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[13px] font-semibold text-ink-900">
                      {db.label}
                    </p>
                    <p className="text-[11px] text-ink-400 hindi-text">
                      {db.labelHi}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {LEVELS.map((level) => {
                      const active = dbLevels[db.id] === level;
                      return (
                        <button
                          key={level}
                          onClick={() =>
                            setDbLevels((p) => ({ ...p, [db.id]: level }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all",
                            active
                              ? "bg-ink-900 text-white border-ink-900"
                              : "bg-white text-ink-500 border-ink-200 hover:border-ink-400",
                          )}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {step === "lifestyle" && (
            <motion.div
              key="ls"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-sm text-ink-500 mb-4">
                Select all that describe you
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {LIFESTYLE.map((item) => {
                  const on = lifestyle.includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleLifestyle(item.id)}
                      className={cn(
                        "relative p-4 rounded-2xl border-2 text-left transition-all",
                        on
                          ? "bg-peach-50 border-peach-400"
                          : "bg-white border-ink-100 hover:border-ink-200",
                      )}
                    >
                      {on && (
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-ink-900 flex items-center justify-center">
                          <Check
                            className="w-2.5 h-2.5 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      )}
                      <p
                        className={cn(
                          "text-[13px] font-semibold leading-tight",
                          on ? "text-peach-900" : "text-ink-800",
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="text-[10px] text-ink-400 mt-0.5 hindi-text">
                        {item.labelHi}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div layout className="relative z-10 mt-6">
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-2xl bg-ink-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-ink-700 transition-colors shadow-sm"
        >
          {step === "lifestyle" ? "Save & Continue" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
