/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — NPS (Net Promoter Score) Survey
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * "How likely are you to recommend Bandhan AI to a friend? (0-10)"
 *
 * Triggered:
 *   • After 7 days of usage
 *   • Maximum once per 90 days
 *   • Dismissed → won't show again for 90 days
 *
 * Scoring:
 *   0-6  = Detractors
 *   7-8  = Passives
 *   9-10 = Promoters
 *   NPS  = %Promoters - %Detractors (-100 to +100)
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import {
  submitFeedback,
  shouldPromptNPS,
  markNPSPrompted,
} from "@/lib/feedback/feedback-service";

interface NPSSurveyProps {
  userId: string;
  userName: string;
  userCreatedAt: string;
}

export default function NPSSurvey({ userId, userName, userCreatedAt }: NPSSurveyProps) {
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if we should show the NPS survey
    const timer = setTimeout(() => {
      if (shouldPromptNPS(userCreatedAt)) {
        setVisible(true);
        markNPSPrompted();
      }
    }, 5000); // 5s delay after page load

    return () => clearTimeout(timer);
  }, [userCreatedAt]);

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleSubmit = () => {
    if (score === null) return;

    submitFeedback({
      userId,
      userName,
      type: "nps",
      category: "general",
      npsScore: score,
      message: comment || `NPS score: ${score}`,
      screenPath: typeof window !== "undefined" ? window.location.pathname : "/",
    });

    setSubmitted(true);
    setTimeout(() => setVisible(false), 2000);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[320px] bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[2px] border-black bg-[#212121] px-3 py-2">
        <p className="text-[10px] font-bold text-white uppercase tracking-wider">
          Quick Question
        </p>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-[#9E9E9E] transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={3} />
        </button>
      </div>

      {!submitted ? (
        <div className="p-4">
          {/* Question */}
          <p className="text-xs font-bold text-[#212121] mb-3 leading-relaxed">
            How likely are you to recommend Bandhan AI to a friend?
          </p>

          {/* 0-10 scale */}
          <div className="flex gap-[2px] mb-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setScore(i)}
                className={`
                  flex-1 h-8 border-[2px] text-[10px] font-bold
                  transition-all duration-100
                  ${
                    score === i
                      ? "border-black bg-[#212121] text-white shadow-[2px_2px_0px_#000]"
                      : "border-[#E0E0E0] bg-white text-[#424242] hover:border-black"
                  }
                `}
                aria-label={`${i} out of 10`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[7px] text-[#9E9E9E] mb-3">
            <span>Not at all likely</span>
            <span>Extremely likely</span>
          </div>

          {/* Optional comment */}
          {score !== null && (
            <div className="mb-3 animate-in fade-in duration-200">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  score <= 6
                    ? "What could we improve?"
                    : score <= 8
                      ? "What would make it a 10?"
                      : "What do you love most?"
                }
                rows={2}
                maxLength={500}
                className="
                  w-full px-2 py-1.5
                  border-[2px] border-black bg-white
                  text-[10px] text-[#212121]
                  placeholder:text-[#9E9E9E] placeholder:italic
                  resize-none
                  focus:outline-none focus:shadow-[0_0_0_2px_#FFF,0_0_0_4px_#000]
                "
              />
            </div>
          )}

          {/* Submit */}
          {score !== null && (
            <button
              onClick={handleSubmit}
              className="
                w-full flex items-center justify-center gap-2
                px-3 py-2
                border-[3px] border-black bg-white
                text-[10px] font-bold text-[#212121] uppercase tracking-wider
                shadow-[4px_4px_0px_#000]
                hover:bg-[#212121] hover:text-white
                hover:translate-x-[2px] hover:translate-y-[2px]
                hover:shadow-[2px_2px_0px_#000]
                transition-all duration-150
              "
            >
              <Send size={12} strokeWidth={2.5} />
              Submit
            </button>
          )}
        </div>
      ) : (
        /* Thank you */
        <div className="p-4 text-center">
          <p className="text-xs font-bold text-[#212121]">Thank you! 🙏</p>
          <p className="text-[9px] text-[#9E9E9E] mt-1">Your feedback helps us improve.</p>
        </div>
      )}
    </div>
  );
}
