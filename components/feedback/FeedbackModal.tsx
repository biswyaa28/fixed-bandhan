/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Feedback Modal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Multi-step feedback form:
 *   Step 1 → Select type (Bug / Feature / Compliment / Other)
 *   Step 2 → Star rating + message
 *   Step 3 → Thank you screen
 *
 * Comic book aesthetic: 4px black border, hard shadow, no rounded corners.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import { X, Bug, Lightbulb, Heart, HelpCircle, Send, CheckCircle } from "lucide-react";
import RatingComponent from "./RatingComponent";
import {
  submitFeedback,
  type FeedbackType,
  type FeedbackCategory,
} from "@/lib/feedback/feedback-service";

interface FeedbackModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

const TYPE_OPTIONS: {
  type: FeedbackType;
  category: FeedbackCategory;
  icon: typeof Bug;
  label: string;
  placeholder: string;
}[] = [
  {
    type: "bug_report",
    category: "general",
    icon: Bug,
    label: "Bug Report",
    placeholder: "What happened? What did you expect to happen instead?",
  },
  {
    type: "feature_request",
    category: "general",
    icon: Lightbulb,
    label: "Feature Request",
    placeholder: "What feature would make Bandhan better for you?",
  },
  {
    type: "testimonial",
    category: "general",
    icon: Heart,
    label: "Compliment",
    placeholder: "What do you love about Bandhan? We'd love to hear!",
  },
  {
    type: "in_app",
    category: "general",
    icon: HelpCircle,
    label: "Other",
    placeholder: "Anything else you'd like to tell us?",
  },
];

export default function FeedbackModal({ userId, userName, onClose }: FeedbackModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<(typeof TYPE_OPTIONS)[0] | null>(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!selected || !message.trim()) return;
    setSubmitting(true);

    submitFeedback({
      userId,
      userName,
      type: selected.type,
      category: selected.category,
      rating: rating || undefined,
      message: message.trim(),
      screenPath: typeof window !== "undefined" ? window.location.pathname : "/",
    });

    setTimeout(() => {
      setSubmitting(false);
      setStep(3);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Send feedback"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white border-[4px] border-black shadow-[8px_8px_0px_#000] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[2px] border-black bg-[#212121] px-4 py-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            {step === 1 && "Send Feedback"}
            {step === 2 && selected?.label}
            {step === 3 && "Thank You!"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#9E9E9E] transition-colors p-1"
            aria-label="Close"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Step 1: Select type */}
        {step === 1 && (
          <div className="p-4 space-y-2">
            <p className="text-[10px] text-[#9E9E9E] mb-3">
              What kind of feedback do you have?
            </p>
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  onClick={() => {
                    setSelected(opt);
                    setStep(2);
                  }}
                  className="
                    w-full flex items-center gap-3 px-4 py-3
                    border-[2px] border-black bg-white
                    hover:bg-[#212121] hover:text-white
                    hover:translate-x-[2px] hover:translate-y-[2px]
                    hover:shadow-none shadow-[4px_4px_0px_#000]
                    transition-all duration-150
                    text-left
                  "
                >
                  <div className="w-8 h-8 border-[2px] border-current flex items-center justify-center shrink-0">
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Message + Rating */}
        {step === 2 && selected && (
          <div className="p-4 space-y-4">
            {/* Rating (optional) */}
            <RatingComponent
              value={rating}
              onChange={setRating}
              size={24}
              label="How's your experience? (optional)"
            />

            {/* Message */}
            <div>
              <label
                htmlFor="feedback-message"
                className="text-[10px] font-bold text-[#212121] uppercase tracking-wider block mb-1"
              >
                Your message
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={selected.placeholder}
                rows={4}
                maxLength={1000}
                className="
                  w-full px-3 py-2
                  border-[2px] border-black bg-white
                  text-sm text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic
                  resize-none
                  focus:outline-none focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]
                "
              />
              <p className="text-[8px] text-[#9E9E9E] text-right mt-0.5">
                {message.length}/1000
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep(1);
                  setSelected(null);
                  setRating(0);
                  setMessage("");
                }}
                className="
                  px-4 py-2
                  border-[2px] border-black bg-white
                  text-xs font-bold text-[#212121] uppercase tracking-wider
                  hover:bg-[#F8F8F8]
                  transition-colors
                "
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || submitting}
                className="
                  flex-1 flex items-center justify-center gap-2
                  px-4 py-2
                  border-[3px] border-black bg-white
                  text-xs font-bold text-[#212121] uppercase tracking-wider
                  shadow-[4px_4px_0px_#000]
                  hover:bg-[#212121] hover:text-white
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  hover:shadow-[2px_2px_0px_#000]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#212121] disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#000]
                  transition-all duration-150
                "
              >
                <Send size={14} strokeWidth={2.5} />
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Thank you */}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 border-[3px] border-black mx-auto flex items-center justify-center bg-[#F8F8F8] mb-3">
              <CheckCircle size={24} strokeWidth={2.5} className="text-[#212121]" />
            </div>
            <p className="text-sm font-bold text-[#212121] mb-1">
              Feedback received! 🙏
            </p>
            <p className="text-[10px] text-[#9E9E9E] mb-4 max-w-[240px] mx-auto">
              We read every message. Your input helps us build a better Bandhan for everyone.
            </p>
            <button
              onClick={onClose}
              className="
                px-6 py-2
                border-[3px] border-black bg-white
                text-xs font-bold text-[#212121] uppercase tracking-wider
                shadow-[4px_4px_0px_#000]
                hover:bg-[#212121] hover:text-white
                hover:translate-x-[2px] hover:translate-y-[2px]
                hover:shadow-[2px_2px_0px_#000]
                transition-all duration-150
              "
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
