/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Language Selector (Hindi / English Toggle)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Toggle switch with flag labels (🇮🇳/🇬🇧).
 * Live preview of Hindi text below toggle.
 * "हिंदी में देखें" label when English is active.
 *
 * Comic-book aesthetic: 2px border, hard shadow, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type Language = "en" | "hi";

export interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

// ─── Preview Strings ─────────────────────────────────────────────────────────

const PREVIEW_STRINGS: Record<Language, { label: string; samples: string[] }> =
  {
    en: {
      label: "English",
      samples: [
        "Welcome to Bandhan AI",
        "Find your life partner",
        "Discover Matches",
        "Send a message",
      ],
    },
    hi: {
      label: "हिंदी",
      samples: [
        "बंधन AI में आपका स्वागत है",
        "अपना जीवन साथी खोजें",
        "मैच खोजें",
        "संदेश भेजें",
      ],
    },
  };

// ─── Component ───────────────────────────────────────────────────────────────

export function LanguageSelector({
  language,
  onLanguageChange,
  className,
}: LanguageSelectorProps) {
  const isHindi = language === "hi";
  const preview = PREVIEW_STRINGS[language];

  const toggle = () => {
    const next: Language = isHindi ? "en" : "hi";
    onLanguageChange(next);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }
  };

  return (
    <div className={cn("", className)}>
      {/* Toggle Row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-heading font-bold text-[#212121] m-0">
            {isHindi ? "भाषा बदलें" : "App Language"}
          </p>
          <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5">
            {isHindi ? "Switch to English" : "हिंदी में देखें"}
          </p>
        </div>

        {/* Toggle switch with flags */}
        <button
          onClick={toggle}
          aria-label={`Switch to ${isHindi ? "English" : "Hindi"}`}
          aria-pressed={isHindi}
          className={cn(
            "relative w-[72px] h-9 border-[2px] border-black cursor-pointer",
            "transition-colors duration-150",
            isHindi ? "bg-[#212121]" : "bg-[#E0E0E0]",
          )}
        >
          {/* Slider thumb */}
          <div
            className={cn(
              "absolute top-[2px] w-[28px] h-[28px] bg-white border-[2px] border-black",
              "flex items-center justify-center",
              "transition-[left] duration-150",
              isHindi ? "left-[36px]" : "left-[2px]",
            )}
          >
            <span className="text-sm leading-none select-none" aria-hidden="true">
              {isHindi ? "🇮🇳" : "🇬🇧"}
            </span>
          </div>

          {/* Labels on track */}
          <span
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-[7px] font-bold uppercase tracking-wider",
              isHindi
                ? "left-[6px] text-white"
                : "right-[6px] text-[#9E9E9E]",
            )}
          >
            {isHindi ? "EN" : "HI"}
          </span>
        </button>
      </div>

      {/* Live Preview */}
      <div className="mt-3 border-[2px] border-dashed border-[#E0E0E0] bg-[#F8F8F8] px-3 py-2">
        <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-widest m-0 mb-1.5">
          Preview · {preview.label}
        </p>
        <div className="space-y-1">
          {preview.samples.map((s, i) => (
            <p
              key={i}
              className={cn(
                "text-xs m-0 leading-snug",
                i === 0
                  ? "font-heading font-bold text-black"
                  : "text-[#424242]",
                isHindi && "font-hindi",
              )}
            >
              {s}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LanguageSelector;
