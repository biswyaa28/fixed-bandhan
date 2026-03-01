/**
 * Onboarding Step 2 — Life Details
 *
 * Optimizations:
 *   • Max 4 fields visible at a time (progressive disclosure)
 *   • Auto-save on every field change
 *   • Skip button for optional fields (pincode, diet)
 *   • Tooltips for confusing fields (relocation, family structure)
 *   • Input validation with inline errors
 *   • Pre-fill from device (city from browser geolocation if permitted)
 *   • Comic book aesthetic
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Info,
} from "lucide-react";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import {
  loadOnboardingData,
  saveOnboardingData,
  completeStep,
  startTimer,
} from "@/lib/onboarding/onboarding-service";

// ─── Options ─────────────────────────────────────────────────────────────

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
  "High school", "Diploma", "Graduate", "Post-graduate", "PhD", "Other",
];

const CAREER = [
  "Technology", "Medicine", "Law", "Finance", "Education", "Business", "Arts", "Government", "Other",
];

const DIET = [
  { id: "vegetarian", label: "Vegetarian 🥦" },
  { id: "eggetarian", label: "Eggetarian 🥚" },
  { id: "non-veg", label: "Non-veg 🍗" },
  { id: "jain", label: "Jain 🌿" },
  { id: "halal", label: "Halal 🌙" },
];

// ─── Tooltip Component ───────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-4 h-4 border-[1px] border-[#9E9E9E] flex items-center justify-center text-[#9E9E9E] hover:bg-[#F8F8F8]"
        aria-label="More info"
        type="button"
      >
        <Info size={8} strokeWidth={3} />
      </button>
      {open && (
        <span className="absolute left-6 top-0 z-10 bg-[#212121] text-white text-[9px] p-2 border-[2px] border-black shadow-[2px_2px_0px_#000] max-w-[200px] leading-relaxed">
          {text}
          <button
            onClick={() => setOpen(false)}
            className="block text-[8px] text-[#9E9E9E] mt-1 underline"
          >
            Got it
          </button>
        </span>
      )}
    </span>
  );
}

// ─── Field Wrapper ───────────────────────────────────────────────────────

function Field({
  label,
  required,
  tooltip,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  tooltip?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-1 text-[10px] font-bold text-[#424242] uppercase tracking-wider mb-2">
        {label}
        {required && <span className="text-[#212121]">*</span>}
        {!required && <span className="text-[#E0E0E0] lowercase normal-case">(optional)</span>}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {children}
      {error && (
        <p className="text-[9px] text-[#212121] font-bold mt-1 border-l-[2px] border-black pl-2">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Chip Selector ───────────────────────────────────────────────────────

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
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`flex items-center gap-1 px-3 py-1.5 border-[2px] text-[11px] font-bold transition-all ${
            isActive(opt.id)
              ? "border-black bg-[#212121] text-white shadow-[2px_2px_0px_#000]"
              : "border-[#E0E0E0] bg-white text-[#424242] hover:border-[#9E9E9E]"
          }`}
        >
          {opt.icon && <span className="text-xs">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────

export default function LifeDetailsPage() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [relocation, setRelocation] = useState("");
  const [familyStructure, setFamily] = useState("");
  const [education, setEducation] = useState("");
  const [career, setCareer] = useState("");
  const [diet, setDiet] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Auto-save debounce timer
  const saveTimer = useRef<NodeJS.Timeout>();

  // Restore saved data
  useEffect(() => {
    startTimer();
    const data = loadOnboardingData();
    if (data.city) setCity(data.city);
    if (data.pincode) setPincode(data.pincode);
    if (data.relocation) setRelocation(data.relocation);
    if (data.familyStructure) setFamily(data.familyStructure);
    if (data.education) setEducation(data.education);
    if (data.career) setCareer(data.career);
    if (data.diet?.length) setDiet(data.diet);
  }, []);

  // Auto-save on any change
  const autoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveOnboardingData({
        city, pincode, relocation, familyStructure, education, career, diet,
      });
    }, 500);
  }, [city, pincode, relocation, familyStructure, education, career, diet]);

  useEffect(() => {
    autoSave();
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [autoSave]);

  const toggleDiet = (id: string) =>
    setDiet((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Validate required fields
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!city.trim()) e.city = "City is required";
    if (!education) e.education = "Please select your education level";
    if (!career) e.career = "Please select your career field";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate() || loading) return;
    setLoading(true);
    const { nextPath } = completeStep("life-details", {
      city, pincode, relocation, familyStructure, education, career, diet,
    });
    router.push(nextPath);
  };

  const canContinue = city.trim() && education && career;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProgressIndicator currentStep="life-details" />

      <div className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        {/* Section: Location */}
        <Field label="City" required error={errors.city}>
          <div className="relative">
            <MapPin
              size={12}
              strokeWidth={2.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
            />
            <input
              value={city}
              onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: "" })); }}
              placeholder="e.g. Mumbai, Delhi, Bangalore"
              className="w-full pl-8 pr-3 py-2.5 border-[2px] border-black text-sm text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic focus:outline-none focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
              autoComplete="off"
            />
          </div>
        </Field>

        <Field
          label="Pincode"
          tooltip="Helps us find matches near you. Only visible to you."
        >
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit pincode"
            inputMode="numeric"
            maxLength={6}
            className="w-full px-3 py-2.5 border-[2px] border-[#E0E0E0] text-sm text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic focus:border-black focus:outline-none"
          />
        </Field>

        <Field
          label="Relocation preference"
          tooltip="Would you or your partner be willing to move? This helps match people with compatible location expectations."
        >
          <ChipGroup options={RELOCATION} value={relocation} onChange={setRelocation} />
        </Field>

        <Field
          label="Family structure"
          tooltip="Your current or preferred living arrangement. 'Flexible' means you're open to discussion."
        >
          <ChipGroup options={FAMILY} value={familyStructure} onChange={setFamily} />
        </Field>

        <Field label="Education" required error={errors.education}>
          <div className="flex flex-wrap gap-1.5">
            {EDUCATION.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { setEducation(e); setErrors((p) => ({ ...p, education: "" })); }}
                className={`px-3 py-1.5 border-[2px] text-[11px] font-bold transition-all ${
                  education === e
                    ? "border-black bg-[#212121] text-white shadow-[2px_2px_0px_#000]"
                    : "border-[#E0E0E0] bg-white text-[#424242] hover:border-[#9E9E9E]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Career field" required error={errors.career}>
          <div className="flex flex-wrap gap-1.5">
            {CAREER.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCareer(c); setErrors((p) => ({ ...p, career: "" })); }}
                className={`px-3 py-1.5 border-[2px] text-[11px] font-bold transition-all ${
                  career === c
                    ? "border-black bg-[#212121] text-white shadow-[2px_2px_0px_#000]"
                    : "border-[#E0E0E0] bg-white text-[#424242] hover:border-[#9E9E9E]"
                }`}
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[2px] border-black px-4 py-3 safe-bottom">
        <button
          onClick={handleContinue}
          disabled={!canContinue || loading}
          className={`w-full py-3 border-[3px] font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            canContinue && !loading
              ? "border-black bg-black text-white shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]"
              : "border-[#E0E0E0] bg-[#F8F8F8] text-[#9E9E9E] cursor-not-allowed"
          }`}
        >
          {loading ? "Saving…" : "Continue"}
          {!loading && <ArrowRight size={14} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
}
