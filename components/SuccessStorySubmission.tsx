/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Success Story Submission Form
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Lets matched couples submit their story for public display.
 * Comic-book styled, bilingual, mobile-first.
 *
 * Content goes through community moderation before publishing:
 *   1. User submits → Firestore `successStories` with status "pending"
 *   2. Volunteer moderators review → approve or reject
 *   3. Approved stories appear in the discovery feed rotation
 *
 * Privacy:
 *   • Only first names shown publicly
 *   • Explicit consent checkbox required (DPDP Act §6)
 *   • Partner consent checkbox required
 *   • Photo upload is optional
 *   • Users can withdraw consent later (deletes story)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, type FormEvent } from "react";
import { Heart, Send, X, Camera, CheckCircle, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { sanitizeText, sanitizeName } from "@/lib/security";

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schema
// ─────────────────────────────────────────────────────────────────────────────

const submissionSchema = z.object({
  partnerFirstName: z
    .string()
    .min(2, "Partner's name must be at least 2 characters")
    .max(50)
    .transform(sanitizeName),
  city: z
    .string()
    .min(2, "City is required")
    .max(100)
    .transform(sanitizeName),
  partnerCity: z
    .string()
    .min(2, "Partner's city is required")
    .max(100)
    .transform(sanitizeName),
  storyEn: z
    .string()
    .min(30, "Please write at least 30 characters")
    .max(500, "Story must be under 500 characters")
    .transform((v) => sanitizeText(v, 500)),
  storyHi: z
    .string()
    .max(600, "Hindi story must be under 600 characters")
    .transform((v) => sanitizeText(v, 600))
    .optional()
    .or(z.literal("")),
  howTheyMet: z
    .string()
    .min(2, "Please select how you met")
    .max(100),
  durationMonths: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 month")
    .max(60, "Duration must be under 60 months"),
  status: z.enum(["dating", "engaged", "married"]),
  consentToShare: z.literal(true, {
    errorMap: () => ({ message: "You must agree to share your story" }),
  }),
  partnerConsent: z.literal(true, {
    errorMap: () => ({ message: "Partner's consent is required" }),
  }),
});

type FormData = z.infer<typeof submissionSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SuccessStorySubmissionProps {
  /** Current user's ID */
  userId: string;
  /** Current user's first name (pre-filled) */
  userName: string;
  /** Current user's city (pre-filled) */
  userCity: string;
  /** Language preference */
  language?: "en" | "hi";
  /** Called on successful submission */
  onSubmit?: (data: FormData) => Promise<void> | void;
  /** Called when user closes the form */
  onClose?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Labels (bilingual)
// ─────────────────────────────────────────────────────────────────────────────

const LABELS = {
  title: { en: "Share Your Story", hi: "अपनी कहानी साझा करें" },
  subtitle: {
    en: "Inspire others on their journey to find love",
    hi: "दूसरों को प्यार ढूँढने की यात्रा में प्रेरित करें",
  },
  partnerName: { en: "Partner's First Name", hi: "साथी का पहला नाम" },
  yourCity: { en: "Your City", hi: "आपका शहर" },
  partnerCity: { en: "Partner's City", hi: "साथी का शहर" },
  storyEn: { en: "Your Story (English)", hi: "आपकी कहानी (अंग्रेज़ी)" },
  storyHi: {
    en: "Your Story (Hindi — optional)",
    hi: "आपकी कहानी (हिंदी — वैकल्पिक)",
  },
  howMet: { en: "How did Bandhan AI connect you?", hi: "Bandhan AI ने कैसे जोड़ा?" },
  duration: { en: "Months from match to today", hi: "मैच से आज तक कितने महीने" },
  currentStatus: { en: "Current Status", hi: "वर्तमान स्थिति" },
  consent: {
    en: "I consent to sharing this story publicly on Bandhan AI. Only first names will be used.",
    hi: "मैं इस कहानी को Bandhan AI पर सार्वजनिक रूप से साझा करने की सहमति देता/देती हूँ। केवल पहला नाम उपयोग किया जाएगा।",
  },
  partnerConsentLabel: {
    en: "My partner knows and agrees to share this story with their first name.",
    hi: "मेरा साथी जानता/जानती है और अपने पहले नाम के साथ इस कहानी को साझा करने के लिए सहमत है।",
  },
  submit: { en: "Submit Story", hi: "कहानी भेजें" },
  submitting: { en: "Submitting...", hi: "भेज रहे हैं..." },
  successTitle: { en: "Story Submitted!", hi: "कहानी भेज दी गई!" },
  successMsg: {
    en: "Thank you! Your story will be reviewed by our community moderators and published within 48 hours.",
    hi: "धन्यवाद! आपकी कहानी हमारे कम्युनिटी मॉडरेटर्स द्वारा समीक्षा की जाएगी और 48 घंटों में प्रकाशित होगी।",
  },
  guidelines: {
    en: "Stories must be respectful, truthful, and free of explicit content.",
    hi: "कहानियाँ सम्मानजनक, सच्ची और अश्लील सामग्री से मुक्त होनी चाहिए।",
  },
  withdraw: {
    en: "You can withdraw your consent and delete your story anytime from Settings → Privacy.",
    hi: "आप सेटिंग्स → प्राइवेसी से कभी भी अपनी सहमति वापस ले सकते हैं और कहानी हटा सकते हैं।",
  },
} as const;

const HOW_MET_OPTIONS = [
  { value: "ai-match", en: "AI Compatibility Match", hi: "AI कम्पैटिबिलिटी मैच" },
  { value: "daily-pick", en: "Daily Recommendation", hi: "डेली रिकमंडेशन" },
  { value: "icebreaker", en: "Icebreaker Conversation", hi: "आइसब्रेकर बातचीत" },
  { value: "special-interest", en: "Special Interest", hi: "स्पेशल इंटरेस्ट" },
  { value: "location", en: "Location Match", hi: "लोकेशन मैच" },
  { value: "values", en: "Values Alignment", hi: "मूल्य मिलान" },
  { value: "family-view", en: "Family-Approved Match", hi: "परिवार-स्वीकृत मैच" },
  { value: "other", en: "Other", hi: "अन्य" },
];

const STATUS_OPTIONS = [
  { value: "dating" as const, en: "Dating", hi: "डेटिंग" },
  { value: "engaged" as const, en: "Engaged", hi: "सगाई हो गई" },
  { value: "married" as const, en: "Married", hi: "शादी हो गई" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SuccessStorySubmission({
  userId,
  userName,
  userCity,
  language = "en",
  onSubmit,
  onClose,
  className,
}: SuccessStorySubmissionProps) {
  const l = language;

  // ── Form state ──
  const [partnerName, setPartnerName] = useState("");
  const [city, setCity] = useState(userCity);
  const [partnerCity, setPartnerCity] = useState("");
  const [storyEn, setStoryEn] = useState("");
  const [storyHi, setStoryHi] = useState("");
  const [howMet, setHowMet] = useState("");
  const [duration, setDuration] = useState<number>(1);
  const [status, setStatus] = useState<"dating" | "engaged" | "married">("dating");
  const [consentToShare, setConsentToShare] = useState(false);
  const [partnerConsent, setPartnerConsent] = useState(false);

  // ── UI state ──
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = submissionSchema.safeParse({
      partnerFirstName: partnerName,
      city,
      partnerCity,
      storyEn,
      storyHi: storyHi || undefined,
      howTheyMet: howMet,
      durationMonths: duration,
      status,
      consentToShare,
      partnerConsent,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(result.data);
      setIsSuccess(true);
    } catch {
      setErrors({ form: "Submission failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──
  if (isSuccess) {
    return (
      <div className={`bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] p-6 ${className || ""}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-[3px] border-black bg-white mb-4">
            <CheckCircle className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">
            {LABELS.successTitle[l]}
          </h3>
          <p className="text-sm text-[#424242] mb-4">
            {LABELS.successMsg[l]}
          </p>
          <p className="text-xs text-[#9E9E9E] mb-6">
            {LABELS.withdraw[l]}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            {l === "en" ? "Done" : "हो गया"}
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className={`bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b-[2px] border-black">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-black" strokeWidth={2.5} />
          <h2 className="text-base font-bold text-black">
            {LABELS.title[l]}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 border-[2px] border-black hover:bg-[#E0E0E0] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-black" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Subtitle */}
        <p className="text-xs text-[#9E9E9E]">{LABELS.subtitle[l]}</p>

        {/* Guidelines banner */}
        <div className="flex items-start gap-2 p-3 bg-[#F8F8F8] border-[2px] border-[#E0E0E0]">
          <AlertTriangle className="w-4 h-4 text-[#424242] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-[10px] text-[#424242] leading-relaxed">
            {LABELS.guidelines[l]}
          </p>
        </div>

        {/* Partner Name */}
        <FieldGroup
          label={LABELS.partnerName[l]}
          error={errors.partnerFirstName}
        >
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder={l === "en" ? "e.g., Rohan" : "उदाहरण: रोहन"}
            maxLength={50}
            className="w-full px-4 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] placeholder:text-[#9E9E9E] placeholder:italic focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
          />
        </FieldGroup>

        {/* Cities (side by side) */}
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label={LABELS.yourCity[l]} error={errors.city}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={l === "en" ? "e.g., Mumbai" : "उदाहरण: मुंबई"}
              maxLength={100}
              className="w-full px-3 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] placeholder:text-[#9E9E9E] placeholder:italic focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
            />
          </FieldGroup>
          <FieldGroup label={LABELS.partnerCity[l]} error={errors.partnerCity}>
            <input
              type="text"
              value={partnerCity}
              onChange={(e) => setPartnerCity(e.target.value)}
              placeholder={l === "en" ? "e.g., Delhi" : "उदाहरण: दिल्ली"}
              maxLength={100}
              className="w-full px-3 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] placeholder:text-[#9E9E9E] placeholder:italic focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
            />
          </FieldGroup>
        </div>

        {/* Story (English) */}
        <FieldGroup label={LABELS.storyEn[l]} error={errors.storyEn}>
          <textarea
            value={storyEn}
            onChange={(e) => setStoryEn(e.target.value)}
            placeholder={
              l === "en"
                ? "How did you meet? What made you click? Tell us your story..."
                : "आप कैसे मिले? क्या बात जमी? हमें अपनी कहानी बताएँ..."
            }
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] placeholder:text-[#9E9E9E] placeholder:italic resize-none focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
          />
          <p className="text-[10px] text-[#9E9E9E] text-right mt-1">
            {storyEn.length}/500
          </p>
        </FieldGroup>

        {/* Story (Hindi — optional) */}
        <FieldGroup label={LABELS.storyHi[l]} error={errors.storyHi}>
          <textarea
            value={storyHi}
            onChange={(e) => setStoryHi(e.target.value)}
            placeholder={
              l === "en"
                ? "Optional: Write your story in Hindi too..."
                : "वैकल्पिक: हिंदी में भी अपनी कहानी लिखें..."
            }
            maxLength={600}
            rows={3}
            lang="hi"
            className="w-full px-4 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] placeholder:text-[#9E9E9E] placeholder:italic resize-none focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
          />
        </FieldGroup>

        {/* How They Met */}
        <FieldGroup label={LABELS.howMet[l]} error={errors.howTheyMet}>
          <select
            value={howMet}
            onChange={(e) => setHowMet(e.target.value)}
            className="w-full px-4 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000] appearance-none"
          >
            <option value="">
              {l === "en" ? "Select..." : "चुनें..."}
            </option>
            {HOW_MET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt[l]}
              </option>
            ))}
          </select>
        </FieldGroup>

        {/* Duration + Status (side by side) */}
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label={LABELS.duration[l]} error={errors.durationMonths}>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              max={60}
              className="w-full px-3 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
            />
          </FieldGroup>
          <FieldGroup label={LABELS.currentStatus[l]} error={errors.status}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full px-3 py-3 text-sm text-[#212121] bg-white border-[2px] border-black rounded-[4px] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000] appearance-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt[l]}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>

        {/* Consent checkboxes */}
        <div className="space-y-3 pt-2 border-t border-dashed border-[#E0E0E0]">
          <CheckboxField
            checked={consentToShare}
            onChange={setConsentToShare}
            label={LABELS.consent[l]}
            error={errors.consentToShare}
          />
          <CheckboxField
            checked={partnerConsent}
            onChange={setPartnerConsent}
            label={LABELS.partnerConsentLabel[l]}
            error={errors.partnerConsent}
          />
        </div>

        {/* Form-level error */}
        {errors.form && (
          <p className="text-xs text-black font-bold border-[2px] border-dashed border-black px-3 py-2">
            {errors.form}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] disabled:bg-[#9E9E9E] disabled:border-[#9E9E9E] disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" strokeWidth={2.5} />
          {isSubmitting ? LABELS.submitting[l] : LABELS.submit[l]}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#424242] uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] font-bold text-black mt-1">{error}</p>
      )}
    </div>
  );
}

function CheckboxField({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-5 h-5 border-[2px] border-black flex items-center justify-center transition-colors ${
            checked ? "bg-black" : "bg-white group-hover:bg-[#E0E0E0]"
          }`}
        >
          {checked && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-white"
            >
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
      </div>
      <span className="text-xs text-[#424242] leading-relaxed">
        {label}
        {error && (
          <span className="block text-[10px] font-bold text-black mt-1">
            {error}
          </span>
        )}
      </span>
    </label>
  );
}

export default SuccessStorySubmission;
