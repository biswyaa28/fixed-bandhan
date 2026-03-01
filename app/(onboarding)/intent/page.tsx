/**
 * Onboarding Step 1 — Intent Selection
 *
 * Optimizations:
 *   • Single question per screen (progressive disclosure)
 *   • Large tap targets (entire card is a button)
 *   • Auto-save on selection (no data loss)
 *   • "Popular" badge for social proof
 *   • Bilingual labels
 *   • Time estimate in progress bar
 *   • Comic book aesthetic: thick borders, hard shadows
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Heart, Users, Flower2, Check, ArrowRight, Zap } from "lucide-react";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import {
  loadOnboardingData,
  completeStep,
  startTimer,
  type IntentType,
} from "@/lib/onboarding/onboarding-service";

const OPTIONS: {
  id: IntentType;
  icon: typeof Sparkles;
  title: string;
  titleHi: string;
  desc: string;
  popular?: boolean;
}[] = [
  {
    id: "marriage-soon",
    icon: Sparkles,
    title: "Marriage within 1–2 years",
    titleHi: "1-2 वर्षों में विवाह",
    desc: "Ready to find your life partner and start a family",
    popular: true,
  },
  {
    id: "serious-relationship",
    icon: Heart,
    title: "Serious with marriage potential",
    titleHi: "विवाह की संभावना के साथ गंभीर",
    desc: "Deep connection that could lead to marriage",
  },
  {
    id: "friendship-networking",
    icon: Users,
    title: "Friendship / Networking",
    titleHi: "मित्रता / नेटवर्किंग",
    desc: "Building meaningful connections in the community",
  },
  {
    id: "healing-space",
    icon: Flower2,
    title: "Healing space",
    titleHi: "उपचार की जगह",
    desc: "Taking time to heal and grow before committing",
  },
];

export default function IntentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<IntentType | null>(null);
  const [loading, setLoading] = useState(false);

  // Restore saved data + start timer
  useEffect(() => {
    startTimer();
    const data = loadOnboardingData();
    if (data.intent) setSelected(data.intent);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected || loading) return;
    setLoading(true);
    const { nextPath } = completeStep("intent", { intent: selected });
    router.push(nextPath);
  }, [selected, loading, router]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ProgressIndicator currentStep="intent" />

      <div className="flex-1 px-4 py-6 pb-28">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold leading-tight text-[#212121]">
            What brings you
            <br />
            to Bandhan?
          </h1>
          <p className="mt-1 text-xs text-[#9E9E9E]">
            Choose what best describes your journey
          </p>
          <p className="mt-0.5 text-[10px] text-[#E0E0E0]">
            बताएं कि आप बंधन में क्यों आए हैं
          </p>
        </div>

        {/* Option cards */}
        <div className="space-y-3">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`relative w-full border-[2px] p-4 text-left transition-all ${
                  isSelected
                    ? "translate-x-0 translate-y-0 border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000]"
                    : "border-[#E0E0E0] bg-white hover:border-[#9E9E9E] active:translate-x-[1px] active:translate-y-[1px]"
                }`}
                aria-pressed={isSelected}
              >
                {/* Popular badge */}
                {opt.popular && !isSelected && (
                  <span className="absolute -top-2.5 right-3 flex items-center gap-0.5 border-[2px] border-black bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                    <Zap size={8} strokeWidth={3} />
                    Popular
                  </span>
                )}

                {/* Checkmark */}
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center border-[2px] border-black bg-[#212121]">
                    <Check size={10} strokeWidth={3} className="text-white" />
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-[2px] border-black bg-[#F8F8F8]">
                    <Icon size={18} strokeWidth={2} className="text-[#212121]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#212121]">{opt.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#9E9E9E]">{opt.titleHi}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#424242]">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-[2px] border-black bg-white px-4 py-3 safe-bottom">
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className={`flex w-full items-center justify-center gap-2 border-[3px] py-3 text-sm font-bold transition-all ${
            selected && !loading
              ? "border-black bg-black text-white shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]"
              : "cursor-not-allowed border-[#E0E0E0] bg-[#F8F8F8] text-[#9E9E9E]"
          }`}
        >
          {loading ? "Saving…" : "Continue"}
          {!loading && <ArrowRight size={14} strokeWidth={3} />}
        </button>
        <p className="mt-2 text-center text-[9px] text-[#9E9E9E]">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
}
