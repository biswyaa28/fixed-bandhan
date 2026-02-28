/**
 * Bandhan AI — Profile Prompts (Hinge-style Life Story cards)
 * Displays answered prompts on a profile. Comic book panel style.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Image, Edit3, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { profilePrompts, type ProfilePrompt } from "@/data/profile-prompts";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

export interface PromptAnswer {
  promptId: string;
  text?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  photoUrl?: string;
}

export interface ProfilePromptsProps {
  answers: PromptAnswer[];
  editable?: boolean;
  onEdit?: (promptId: string) => void;
  onAdd?: () => void;
  language?: "en" | "hi";
  className?: string;
}

export function ProfilePrompts({
  answers,
  editable = false,
  onEdit,
  onAdd,
  language = "en",
  className,
}: ProfilePromptsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const promptMap = new Map(profilePrompts.map((p) => [p.id, p]));

  const minRequired = 3;
  const filled = answers.filter((a) => a.text || a.voiceUrl);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-heading font-bold text-black uppercase tracking-wider">
          {language === "en" ? "Life Story" : "जीवन कहानी"}
        </span>
        <span className="text-[10px] font-bold text-[#9E9E9E]">
          {filled.length}/{minRequired} {language === "en" ? "min" : "न्यूनतम"}
        </span>
      </div>

      {/* Prompt cards */}
      {answers.map((answer) => {
        const prompt = promptMap.get(answer.promptId);
        if (!prompt) return null;
        const isExpanded = expandedId === answer.promptId;
        const question = language === "en" ? prompt.textEn : prompt.textHi;

        return (
          <div
            key={answer.promptId}
            className="border-2 border-black bg-white shadow-[2px_2px_0px_#000000]"
          >
            {/* Question bar */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : answer.promptId)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#F8F8F8] border-b border-[#E0E0E0] text-left cursor-pointer border-t-0 border-x-0"
            >
              <span className="text-xs font-heading font-bold text-[#424242] uppercase tracking-wide flex-1 mr-2">
                {question}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {answer.voiceUrl && <Mic className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />}
                {answer.photoUrl && <Image className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />}
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2} />
                )}
              </div>
            </button>

            {/* Answer content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3">
                    {answer.text && (
                      <p className="text-sm text-[#212121] leading-relaxed m-0 font-medium">
                        {answer.text}
                      </p>
                    )}

                    {answer.photoUrl && (
                      <div className="mt-3 border-2 border-[#E0E0E0] overflow-hidden">
                        <img src={answer.photoUrl} alt="Prompt photo" className="w-full h-32 object-cover" />
                      </div>
                    )}

                    {answer.voiceUrl && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-[#F8F8F8] border-2 border-[#E0E0E0]">
                        <Mic className="w-4 h-4 text-[#424242]" strokeWidth={2} />
                        <div className="flex-1 flex gap-[2px] items-end h-4">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-[#424242] min-w-[2px]"
                              style={{ height: `${20 + Math.sin(i * 0.8) * 60 + Math.random() * 20}%` }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-[#9E9E9E]">
                          {answer.voiceDuration ? `${Math.floor(answer.voiceDuration)}s` : "0:15"}
                        </span>
                      </div>
                    )}

                    {!answer.text && !answer.voiceUrl && (
                      <p className="text-xs text-[#9E9E9E] italic m-0">
                        {language === "en" ? "No answer yet" : "अभी तक कोई उत्तर नहीं"}
                      </p>
                    )}

                    {editable && (
                      <button
                        onClick={() => onEdit?.(answer.promptId)}
                        className="mt-3 flex items-center gap-1 text-[10px] font-heading font-bold uppercase text-[#424242] bg-transparent border-none cursor-pointer hover:text-black p-0"
                      >
                        <Edit3 className="w-3 h-3" strokeWidth={2} />
                        {language === "en" ? "Edit Answer" : "उत्तर संपादित करें"}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Add prompt button */}
      {editable && answers.length < 6 && (
        <button
          onClick={onAdd}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3",
            "border-2 border-dashed border-black bg-transparent",
            "text-xs font-heading font-bold uppercase text-[#424242]",
            "cursor-pointer hover:bg-[#F8F8F8]",
          )}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          {language === "en" ? "Add Prompt" : "प्रॉम्प्ट जोड़ें"}
        </button>
      )}
    </div>
  );
}

export default ProfilePrompts;
