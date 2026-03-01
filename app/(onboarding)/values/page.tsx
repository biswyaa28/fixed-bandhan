/**
 * Onboarding Step 3 — Values & Personality
 *
 * Optimizations:
 *   • Sub-steps within one page (Love Languages → Dealbreakers → Lifestyle → Bio)
 *   • Max 4-6 items visible per sub-step
 *   • All fields optional (skip-friendly) — values step has 0 required fields
 *   • Auto-save on every interaction
 *   • "Skip this step" option for users who want to be fast
 *   • Bio text area with character counter + prompt suggestions
 *   • Comic book aesthetic
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  SkipForward,
  Check,
  Heart,
  Users,
  Clock,
  HandHeart,
  MessageCircleHeart,
} from "lucide-react";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import {
  loadOnboardingData,
  saveOnboardingData,
  completeStep,
  startTimer,
} from "@/lib/onboarding/onboarding-service";

// ─── Data ────────────────────────────────────────────────────────────────

type SubStep = "love" | "dealbreakers" | "lifestyle" | "bio";

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
  { id: "serve", icon: Users, label: "Acts of service", labelHi: "सेवा के कार्य" },
  {
    id: "words",
    icon: MessageCircleHeart,
    label: "Words of affirmation",
    labelHi: "पुष्टि के शब्द",
  },
  { id: "touch", icon: Heart, label: "Physical touch", labelHi: "शारीरिक स्पर्श" },
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

const BIO_PROMPTS = [
  "I'm looking for someone who…",
  "My ideal weekend involves…",
  "My family would describe me as…",
  "The most spontaneous thing I've done…",
];

const BIO_MAX = 250;

// ─── Page ────────────────────────────────────────────────────────────────

export default function ValuesPage() {
  const router = useRouter();
  const [subStep, setSubStep] = useState<SubStep>("love");
  const [loveLangs, setLoveLangs] = useState<string[]>([]);
  const [dbLevels, setDbLevels] = useState<Record<string, string>>({});
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const saveTimer = useRef<NodeJS.Timeout>();

  // Restore
  useEffect(() => {
    startTimer();
    const data = loadOnboardingData();
    if (data.loveLanguages?.length) setLoveLangs(data.loveLanguages);
    if (data.dealbreakers && Object.keys(data.dealbreakers).length)
      setDbLevels(data.dealbreakers);
    if (data.lifestyle?.length) setLifestyle(data.lifestyle);
    if (data.bio) setBio(data.bio);
  }, []);

  // Auto-save
  const autoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveOnboardingData({
        loveLanguages: loveLangs,
        dealbreakers: dbLevels,
        lifestyle,
        bio,
      });
    }, 400);
  }, [loveLangs, dbLevels, lifestyle, bio]);

  useEffect(() => {
    autoSave();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [autoSave]);

  const toggleLove = (id: string) =>
    setLoveLangs((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  const toggleLifestyle = (id: string) =>
    setLifestyle((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const subSteps: SubStep[] = ["love", "dealbreakers", "lifestyle", "bio"];
  const subIdx = subSteps.indexOf(subStep);

  const handleNext = () => {
    if (subIdx < subSteps.length - 1) {
      setSubStep(subSteps[subIdx + 1]);
    } else {
      setLoading(true);
      const { nextPath } = completeStep("values", {
        loveLanguages: loveLangs,
        dealbreakers: dbLevels,
        lifestyle,
        bio,
      });
      router.push(nextPath);
    }
  };

  const handleBack = () => {
    if (subIdx > 0) setSubStep(subSteps[subIdx - 1]);
    else router.back();
  };

  const handleSkip = () => {
    setLoading(true);
    const { nextPath } = completeStep("values", {
      loveLanguages: loveLangs,
      dealbreakers: dbLevels,
      lifestyle,
      bio,
    });
    router.push(nextPath);
  };

  const SUB_TITLES: Record<SubStep, { title: string; subtitle: string }> = {
    love: { title: "How do you show love?", subtitle: "Select up to 3 that resonate" },
    dealbreakers: {
      title: "Your deal-breakers",
      subtitle: "How do you feel about each?",
    },
    lifestyle: { title: "Your lifestyle", subtitle: "Select all that describe you" },
    bio: { title: "About you", subtitle: "Write a short bio (optional)" },
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ProgressIndicator currentStep="values" />

      <div className="flex-1 px-4 py-5 pb-28">
        {/* Sub-step indicator */}
        <div className="mb-4 flex gap-1">
          {subSteps.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 border border-[#E0E0E0] ${
                i <= subIdx ? "bg-[#212121]" : "bg-[#F8F8F8]"
              }`}
            />
          ))}
        </div>

        {/* Heading */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#212121]">
            {SUB_TITLES[subStep].title}
          </h1>
          <p className="mt-1 text-xs text-[#9E9E9E]">{SUB_TITLES[subStep].subtitle}</p>
        </div>

        {/* Sub-step content */}
        {subStep === "love" && (
          <div className="space-y-2">
            {LOVE_LANGUAGES.map((lang) => {
              const on = loveLangs.includes(lang.id);
              const Icon = lang.icon;
              return (
                <button
                  key={lang.id}
                  onClick={() => toggleLove(lang.id)}
                  className={`flex w-full items-center gap-3 border-[2px] px-4 py-3 text-left transition-all ${
                    on
                      ? "border-black bg-[#F8F8F8] shadow-[2px_2px_0px_#000]"
                      : "border-[#E0E0E0] bg-white hover:border-[#9E9E9E]"
                  }`}
                  aria-pressed={on}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center border-[2px] border-black ${on ? "bg-[#212121]" : "bg-[#F8F8F8]"}`}
                  >
                    <Icon
                      size={14}
                      strokeWidth={2}
                      className={on ? "text-white" : "text-[#424242]"}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#212121]">{lang.label}</p>
                    <p className="text-[9px] text-[#9E9E9E]">{lang.labelHi}</p>
                  </div>
                  {on && <Check size={12} strokeWidth={3} className="text-[#212121]" />}
                </button>
              );
            })}
            <p className="mt-2 text-center text-[9px] text-[#9E9E9E]">
              {loveLangs.length}/3 selected
            </p>
          </div>
        )}

        {subStep === "dealbreakers" && (
          <div className="space-y-4">
            {DEALBREAKERS.map((db) => (
              <div key={db.id} className="border-[2px] border-[#E0E0E0] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-xs font-bold text-[#212121]">{db.label}</p>
                  <p className="text-[9px] text-[#9E9E9E]">{db.labelHi}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {LEVELS.map((level) => {
                    const active = dbLevels[db.id] === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setDbLevels((p) => ({ ...p, [db.id]: level }))}
                        className={`border-[2px] px-2.5 py-1 text-[9px] font-bold transition-all ${
                          active
                            ? "border-black bg-[#212121] text-white"
                            : "border-[#E0E0E0] bg-white text-[#424242] hover:border-[#9E9E9E]"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {subStep === "lifestyle" && (
          <div className="grid grid-cols-2 gap-2">
            {LIFESTYLE.map((item) => {
              const on = lifestyle.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleLifestyle(item.id)}
                  className={`relative border-[2px] p-3 text-left transition-all ${
                    on
                      ? "border-black bg-[#F8F8F8] shadow-[2px_2px_0px_#000]"
                      : "border-[#E0E0E0] bg-white hover:border-[#9E9E9E]"
                  }`}
                  aria-pressed={on}
                >
                  {on && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center border-[1px] border-black bg-[#212121]">
                      <Check size={8} strokeWidth={3} className="text-white" />
                    </span>
                  )}
                  <p className="text-xs font-bold text-[#212121]">{item.label}</p>
                  <p className="mt-0.5 text-[8px] text-[#9E9E9E]">{item.labelHi}</p>
                </button>
              );
            })}
          </div>
        )}

        {subStep === "bio" && (
          <div>
            {/* Prompt suggestions */}
            <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-2">
              {BIO_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setBio((prev) => (prev ? prev + " " + prompt : prompt))}
                  className="flex-shrink-0 whitespace-nowrap border-[2px] border-[#E0E0E0] px-2.5 py-1 text-[8px] font-bold text-[#424242] transition-colors hover:border-black"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              placeholder="Tell potential matches about yourself…"
              rows={5}
              className="w-full resize-none border-[2px] border-black px-3 py-2.5 text-sm text-[#212121] placeholder:italic placeholder:text-[#9E9E9E] focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000] focus:outline-none"
            />
            <p className="mt-1 text-right text-[9px] text-[#9E9E9E]">
              {bio.length}/{BIO_MAX}
            </p>
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-[2px] border-black bg-white px-4 py-3 safe-bottom">
        <div className="flex gap-2">
          {subStep !== "love" && (
            <button
              onClick={handleBack}
              className="border-[2px] border-black px-4 py-3 text-sm font-bold text-[#212121] transition-colors hover:bg-[#F8F8F8]"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 border-[3px] border-black bg-black py-3 text-sm font-bold text-white shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] disabled:opacity-50"
          >
            {loading ? "Saving…" : subStep === "bio" ? "Save & Continue" : "Next"}
            {!loading && <ArrowRight size={14} strokeWidth={3} />}
          </button>
        </div>
        {/* Skip link */}
        <button
          onClick={handleSkip}
          className="mt-2 flex w-full items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase tracking-wider text-[#9E9E9E] transition-colors hover:text-[#424242]"
        >
          <SkipForward size={8} strokeWidth={3} />
          Skip — fill in later
        </button>
      </div>
    </div>
  );
}
