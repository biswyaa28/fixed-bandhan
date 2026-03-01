/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Onboarding Progress Indicator
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * A comic-book-styled step indicator shown at the top of every onboarding page.
 *
 * Features:
 *   • 5-step segmented bar (Intent → Details → Values → Photos → Review)
 *   • Current step label + estimated time remaining
 *   • Back button (left arrow)
 *   • Animated fill on step change
 *   • Completion incentive badge ("5 bonus likes at 100%!")
 *   • Bilingual labels (English + Hindi)
 *   • Accessible (aria-labels, role="progressbar")
 *   • Mobile-first (sticky header, thumb-friendly)
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift } from "lucide-react";
import {
  STEPS,
  loadOnboardingData,
  getOverallCompletion,
  getEstimatedSecondsRemaining,
  formatTime,
  getPreviousPath,
  type OnboardingStep,
} from "@/lib/onboarding/onboarding-service";

interface ProgressIndicatorProps {
  currentStep: OnboardingStep;
  /** Show the "5 bonus likes" incentive badge */
  showIncentive?: boolean;
}

export default function ProgressIndicator({
  currentStep,
  showIncentive = true,
}: ProgressIndicatorProps) {
  const router = useRouter();

  const data = useMemo(() => loadOnboardingData(), []);
  const completion = useMemo(() => getOverallCompletion(data), [data]);
  const remaining = useMemo(() => getEstimatedSecondsRemaining(data), [data]);
  const timeLabel = useMemo(() => formatTime(remaining), [remaining]);

  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);
  const currentConfig = STEPS[currentIdx];
  const prevPath = getPreviousPath(currentStep);

  return (
    <div
      className="sticky top-0 z-30 bg-white border-b-[2px] border-black safe-top"
      role="navigation"
      aria-label="Onboarding progress"
    >
      <div className="px-4 pt-3 pb-3">
        {/* Row 1: Back button + step label + time estimate */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {prevPath ? (
              <button
                onClick={() => router.push(prevPath)}
                className="w-8 h-8 border-[2px] border-black flex items-center justify-center hover:bg-[#F8F8F8] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                aria-label="Go back"
              >
                <ArrowLeft size={14} strokeWidth={3} />
              </button>
            ) : (
              <div className="w-8" /> /* spacer */
            )}
            <div>
              <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider">
                Step {currentIdx + 1} of {STEPS.length}
              </p>
              <h2 className="text-sm font-bold text-[#212121]">
                {currentConfig?.label}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-[#9E9E9E]">{timeLabel.en} left</p>
            <p className="text-[8px] text-[#E0E0E0]">{timeLabel.hi}</p>
          </div>
        </div>

        {/* Row 2: Step progress bar */}
        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={currentIdx + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label={`Step ${currentIdx + 1} of ${STEPS.length}: ${currentConfig?.label}`}
        >
          {STEPS.map((step, i) => {
            const isComplete = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div
                key={step.id}
                className={`h-1.5 flex-1 border border-black transition-all duration-300 ${
                  isComplete
                    ? "bg-[#212121]"
                    : isCurrent
                      ? "bg-[#9E9E9E]"
                      : "bg-[#F8F8F8]"
                }`}
                title={step.label}
              />
            );
          })}
        </div>

        {/* Row 3: Incentive badge (only on early steps) */}
        {showIncentive && currentIdx < 3 && (
          <div className="mt-2 flex items-center gap-1.5 px-2 py-1 border border-dashed border-[#E0E0E0] bg-[#F8F8F8] w-fit">
            <Gift size={10} strokeWidth={2.5} className="text-[#424242]" />
            <span className="text-[8px] font-bold text-[#424242]">
              Complete profile → 5 bonus likes!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
