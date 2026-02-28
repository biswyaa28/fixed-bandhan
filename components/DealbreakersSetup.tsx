/**
 * Bandhan AI — Dealbreakers Setup (Hinge "Non-Negotiables")
 * Onboarding/settings component for must-have/must-not-have filters.
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Info, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────
export interface DealbreakersConfig {
  smoking: "non-negotiable" | "okay-occasionally" | "dont-care";
  drinking: "non-negotiable" | "okay-occasionally" | "dont-care";
  diet: "strict-veg" | "eggetarian" | "non-veg" | "dont-care";
  familyValues: "traditional" | "modern" | "flexible";
  relocation: "not-willing" | "open-discuss" | "definitely";
}

export interface DealbreakersSetupProps {
  initial?: Partial<DealbreakersConfig>;
  onChange?: (config: DealbreakersConfig) => void;
  onSave?: (config: DealbreakersConfig) => void;
  language?: "en" | "hi";
  className?: string;
}

const DEFAULTS: DealbreakersConfig = {
  smoking: "dont-care",
  drinking: "dont-care",
  diet: "dont-care",
  familyValues: "flexible",
  relocation: "open-discuss",
};

const STORAGE_KEY = "bandhan-dealbreakers";

interface CategoryDef {
  key: keyof DealbreakersConfig;
  labelEn: string;
  labelHi: string;
  options: {
    value: string;
    labelEn: string;
    labelHi: string;
    isStrict: boolean;
  }[];
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "smoking",
    labelEn: "Smoking",
    labelHi: "धूम्रपान",
    options: [
      {
        value: "non-negotiable",
        labelEn: "Non-negotiable (no smoking)",
        labelHi: "अटल (धूम्रपान नहीं)",
        isStrict: true,
      },
      {
        value: "okay-occasionally",
        labelEn: "Okay occasionally",
        labelHi: "कभी-कभी ठीक",
        isStrict: false,
      },
      {
        value: "dont-care",
        labelEn: "Don't care",
        labelHi: "कोई फ़र्क नहीं",
        isStrict: false,
      },
    ],
  },
  {
    key: "drinking",
    labelEn: "Drinking",
    labelHi: "शराब",
    options: [
      {
        value: "non-negotiable",
        labelEn: "Non-negotiable (no drinking)",
        labelHi: "अटल (शराब नहीं)",
        isStrict: true,
      },
      {
        value: "okay-occasionally",
        labelEn: "Okay occasionally",
        labelHi: "कभी-कभी ठीक",
        isStrict: false,
      },
      {
        value: "dont-care",
        labelEn: "Don't care",
        labelHi: "कोई फ़र्क नहीं",
        isStrict: false,
      },
    ],
  },
  {
    key: "diet",
    labelEn: "Diet Preference",
    labelHi: "आहार प्राथमिकता",
    options: [
      {
        value: "strict-veg",
        labelEn: "Strict Vegetarian",
        labelHi: "शुद्ध शाकाहारी",
        isStrict: true,
      },
      {
        value: "eggetarian",
        labelEn: "Eggetarian OK",
        labelHi: "अंडा ठीक है",
        isStrict: false,
      },
      {
        value: "non-veg",
        labelEn: "Non-veg OK",
        labelHi: "मांसाहारी ठीक",
        isStrict: false,
      },
      {
        value: "dont-care",
        labelEn: "Don't care",
        labelHi: "कोई फ़र्क नहीं",
        isStrict: false,
      },
    ],
  },
  {
    key: "familyValues",
    labelEn: "Family Values",
    labelHi: "पारिवारिक मूल्य",
    options: [
      {
        value: "traditional",
        labelEn: "Traditional",
        labelHi: "पारंपरिक",
        isStrict: false,
      },
      {
        value: "modern",
        labelEn: "Modern",
        labelHi: "आधुनिक",
        isStrict: false,
      },
      {
        value: "flexible",
        labelEn: "Flexible",
        labelHi: "लचीला",
        isStrict: false,
      },
    ],
  },
  {
    key: "relocation",
    labelEn: "Willing to Relocate",
    labelHi: "स्थानांतरण की इच्छा",
    options: [
      {
        value: "not-willing",
        labelEn: "Not willing",
        labelHi: "तैयार नहीं",
        isStrict: true,
      },
      {
        value: "open-discuss",
        labelEn: "Open to discuss",
        labelHi: "चर्चा करने को तैयार",
        isStrict: false,
      },
      {
        value: "definitely",
        labelEn: "Definitely open",
        labelHi: "बिल्कुल तैयार",
        isStrict: false,
      },
    ],
  },
];

export function DealbreakersSetup({
  initial,
  onChange,
  onSave,
  language = "en",
  className,
}: DealbreakersSetupProps) {
  const [config, setConfig] = useState<DealbreakersConfig>({
    ...DEFAULTS,
    ...initial,
  });

  // Hydrate from localStorage on client mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConfig({ ...DEFAULTS, ...JSON.parse(stored), ...initial });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {}
    onChange?.(config);
  }, [config, onChange]);

  const strictCount = CATEGORIES.reduce((acc, cat) => {
    const val = config[cat.key];
    const opt = cat.options.find((o) => o.value === val);
    return acc + (opt?.isStrict ? 1 : 0);
  }, 0);

  const handleChange = (key: keyof DealbreakersConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#F8F8F8] border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center">
          <Shield className="w-5 h-5 text-black" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0">
            {language === "en" ? "Non-Negotiables" : "अटल शर्तें"}
          </h3>
          <p className="text-xs text-[#9E9E9E] m-0 mt-0.5">
            {language === "en"
              ? "Set your must-haves for better matches"
              : "बेहतर मैच के लिए अपनी ज़रूरी शर्तें सेट करें"}
          </p>
        </div>
      </div>

      {/* Warning if too strict */}
      {strictCount >= 3 && (
        <div className="flex items-start gap-2 px-3 py-2 border-2 border-dashed border-black bg-[#F8F8F8]">
          <AlertTriangle
            className="w-4 h-4 text-[#424242] mt-0.5 flex-shrink-0"
            strokeWidth={2}
          />
          <p className="text-[10px] text-[#424242] m-0 leading-normal">
            {language === "en"
              ? "Very strict filters may significantly reduce your matches."
              : "बहुत सख्त फ़िल्टर आपके मैच काफ़ी कम कर सकते हैं।"}
          </p>
        </div>
      )}

      {/* Categories */}
      {CATEGORIES.map((cat) => (
        <div
          key={cat.key}
          className="border-2 border-black bg-white shadow-[2px_2px_0px_#000000]"
        >
          <div className="px-4 py-3 bg-[#F8F8F8] border-b border-[#E0E0E0]">
            <span className="text-xs font-heading font-bold text-black uppercase tracking-wider">
              {language === "en" ? cat.labelEn : cat.labelHi}
            </span>
          </div>
          <div className="p-3 flex flex-wrap gap-2">
            {cat.options.map((opt) => {
              const isSelected = config[cat.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleChange(cat.key, opt.value)}
                  className={cn(
                    "px-3 py-2 text-[11px] font-bold uppercase tracking-wide cursor-pointer",
                    "border-2 border-black",
                    "transition-[background,color] duration-100",
                    isSelected
                      ? opt.isStrict
                        ? "bg-[#424242] text-white"
                        : "bg-black text-white"
                      : "bg-white text-[#424242] hover:bg-[#F8F8F8]",
                  )}
                >
                  {opt.isStrict && isSelected && "⚡ "}
                  {language === "en" ? opt.labelEn : opt.labelHi}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Save + Reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setConfig(DEFAULTS)}
          className="flex items-center gap-1 px-4 py-2.5 border-2 border-dashed border-[#9E9E9E] text-xs font-heading font-bold uppercase text-[#9E9E9E] cursor-pointer hover:border-black hover:text-black"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
          {language === "en" ? "Reset" : "रीसेट"}
        </button>
        <button
          onClick={() => onSave?.(config)}
          className={cn(
            "flex-1 px-4 py-2.5 border-[3px] border-black bg-black text-white",
            "text-xs font-heading font-bold uppercase cursor-pointer",
            "shadow-[4px_4px_0px_#000000]",
            "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
            "transition-[transform,box-shadow] duration-150",
          )}
        >
          {language === "en" ? "Save Preferences" : "प्राथमिकताएं सहेजें"}
        </button>
      </div>
    </div>
  );
}

export default DealbreakersSetup;
