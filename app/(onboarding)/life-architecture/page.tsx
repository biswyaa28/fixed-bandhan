"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Home,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

const RELOCATION = [
  { id: "within-city", label: "Within city", icon: "🏙️" },
  { id: "same-state", label: "Same state", icon: "📍" },
  { id: "pan-india", label: "Pan India", icon: "🇮🇳" },
  { id: "abroad-ready", label: "Abroad ready", icon: "✈️" },
];

const FAMILY = [
  { id: "with-parents", label: "With parents", icon: "👨‍👩‍👦" },
  { id: "joint", label: "Joint family", icon: "🏠" },
  { id: "independent", label: "Independent", icon: "🚪" },
  { id: "flexible", label: "Flexible", icon: "🤝" },
];

const EDUCATION = [
  "High school",
  "Diploma",
  "Graduate",
  "Post-graduate",
  "PhD",
  "Other",
];
const CAREER = [
  "Technology",
  "Medicine",
  "Law",
  "Finance",
  "Education",
  "Business",
  "Arts",
  "Government",
  "Other",
];
const DIET = [
  { id: "vegetarian", label: "Vegetarian 🥦" },
  { id: "eggetarian", label: "Eggetarian 🥚" },
  { id: "non-veg", label: "Non-veg 🍗" },
  { id: "jain", label: "Jain 🌿" },
  { id: "halal", label: "Halal 🌙" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
  multi,
}: {
  options: { id: string; label: string; icon?: string }[];
  value: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
}) {
  const isActive = (id: string) =>
    multi ? (value as string[]).includes(id) : value === id;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all",
            isActive(opt.id)
              ? "bg-ink-900 text-white border-ink-900"
              : "bg-white text-ink-600 border-ink-200 hover:border-ink-400",
          )}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function LifeArchitecturePage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [relocation, setRelocation] = useState("");
  const [family, setFamily] = useState("");
  const [education, setEducation] = useState("");
  const [career, setCareer] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleDiet = (id: string) =>
    setDiet((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const canContinue = city && relocation && family && education && career;

  const handleContinue = () => {
    if (!canContinue) return;
    setLoading(true);
    const data = JSON.parse(localStorage.getItem("onboarding_data") || "{}");
    data.lifeArchitecture = {
      city,
      pincode,
      relocation,
      family,
      education,
      career,
      diet,
    };
    localStorage.setItem("onboarding_data", JSON.stringify(data));
    setTimeout(() => router.push("/onboarding/preview"), 350);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col safe-top safe-bottom">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 w-64 h-64 bg-sage-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 -left-12 w-56 h-56 bg-lavender-100 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-ink-100 safe-top px-5 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full flex-1",
                i <= 3 ? "bg-ink-900" : "bg-ink-100",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
          >
            <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <div>
            <p className="text-[11px] text-ink-400 font-medium uppercase tracking-wide">
              Step 3 of 4
            </p>
            <h1 className="text-[1.25rem] font-bold text-ink-900 tracking-tight">
              Life Architecture
            </h1>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-5 py-6 space-y-6 pb-32">
        {/* Location */}
        <Field label="City & Location">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400"
                strokeWidth={1.5}
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-ink-200 text-sm text-ink-900 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 bg-white"
              />
            </div>
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value.slice(0, 6))}
              placeholder="Pincode"
              inputMode="numeric"
              maxLength={6}
              className="px-3 py-2.5 rounded-xl border border-ink-200 text-sm text-ink-900 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 bg-white"
            />
          </div>
        </Field>

        <Field label="Relocation preference">
          <ChipGroup
            options={RELOCATION}
            value={relocation}
            onChange={setRelocation}
          />
        </Field>

        <Field label="Family structure">
          <ChipGroup options={FAMILY} value={family} onChange={setFamily} />
        </Field>

        <Field label="Education">
          <div className="flex flex-wrap gap-2">
            {EDUCATION.map((e) => (
              <button
                key={e}
                onClick={() => setEducation(e)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all",
                  education === e
                    ? "bg-ink-900 text-white border-ink-900"
                    : "bg-white text-ink-600 border-ink-200 hover:border-ink-400",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Career field">
          <div className="flex flex-wrap gap-2">
            {CAREER.map((c) => (
              <button
                key={c}
                onClick={() => setCareer(c)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all",
                  career === c
                    ? "bg-ink-900 text-white border-ink-900"
                    : "bg-white text-ink-600 border-ink-200 hover:border-ink-400",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Dietary preference">
          <ChipGroup options={DIET} value={diet} onChange={toggleDiet} multi />
        </Field>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-ink-100 px-5 py-4 safe-bottom">
        <button
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className={cn(
            "w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
            canContinue
              ? "bg-ink-900 text-white hover:bg-ink-700 shadow-sm"
              : "bg-ink-100 text-ink-400 cursor-not-allowed",
          )}
        >
          {loading ? (
            "Saving…"
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
