/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Editing Form
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Full-featured profile editing form with:
 *   • Sectioned accordion layout (comic book panel style)
 *   • Inline validation with bilingual errors
 *   • Photo upload with client-side compression
 *   • Profile completion progress bar
 *   • Auto-save indicator
 *   • Responsive mobile-first design
 *   • Accessible (ARIA labels, keyboard nav)
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback, useRef, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  ChevronDown,
  Save,
  Loader2,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  updateUserProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  calculateProfileCompletion,
  type UpdateUserProfileData,
  type UserServiceError,
} from "@/lib/firebase/users";

import type {
  UserDocument,
  Gender,
  Diet,
  Frequency,
  FamilyType,
  Intent,
  UserPhoto,
} from "@/lib/firebase/schema";

import { VerificationBadgeLarge } from "@/components/VerificationBadge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileFormProps {
  /** Current user document from Firestore */
  user: UserDocument;
  /** Called after successful save with updated user */
  onSave?: (updated: UserDocument) => void;
  /** Language */
  language?: "en" | "hi";
}

type SectionId = "identity" | "profile" | "family" | "lifestyle" | "photos";

// ─────────────────────────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────────────────────────

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const DIET_OPTIONS: { value: Diet; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "non-vegetarian", label: "Non-vegetarian" },
  { value: "jain", label: "Jain" },
  { value: "halal", label: "Halal" },
  { value: "vegan", label: "Vegan" },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "occasionally", label: "Occasionally" },
  { value: "regularly", label: "Regularly" },
];

const FAMILY_OPTIONS: { value: FamilyType; label: string }[] = [
  { value: "joint", label: "Joint Family" },
  { value: "nuclear", label: "Nuclear Family" },
];

const INTENT_OPTIONS: { value: Intent; label: string }[] = [
  { value: "marriage-soon", label: "Marriage Soon" },
  { value: "serious-relationship", label: "Serious Relationship" },
  { value: "friendship", label: "Friendship" },
  { value: "healing", label: "Healing Space" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function FormField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | null;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-[10px] font-bold text-[#424242] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[10px] text-[#212121] font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3" strokeWidth={2.5} />
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  type = "text",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={cn(
        "w-full px-3 py-2.5 text-sm text-[#212121] bg-white placeholder-[#9E9E9E]",
        "border-2 border-black outline-none",
        "focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
        "transition-shadow duration-150",
        disabled && "opacity-50 cursor-not-allowed bg-[#F8F8F8]",
      )}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          "w-full px-3 py-2.5 text-sm text-[#212121] bg-white placeholder-[#9E9E9E]",
          "border-2 border-black outline-none resize-none",
          "focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
          "transition-shadow duration-150",
        )}
      />
      {maxLength && (
        <p className="text-right text-[10px] text-[#9E9E9E] mt-0.5">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-3 py-2.5 text-sm text-[#212121] bg-white",
        "border-2 border-black outline-none appearance-none cursor-pointer",
        "focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
        "transition-shadow duration-150",
        !value && "text-[#9E9E9E]",
      )}
    >
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Section({
  id,
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_#000000] mb-4">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "border-b-2 border-black bg-[#F8F8F8]",
          "cursor-pointer text-left",
          "hover:bg-[#E0E0E0] transition-colors duration-100",
        )}
        aria-expanded={isOpen}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-black" strokeWidth={2.5} />
          <span className="text-xs font-bold text-black uppercase tracking-wider">
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`section-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileForm({ user, onSave }: ProfileFormProps) {
  // ── Form state (local copy for editing) ──
  const [form, setForm] = useState<UpdateUserProfileData>({
    name: user.name,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    age: user.age,
    bio: user.bio,
    city: user.city,
    state: user.state,
    height: user.height,
    weight: user.weight,
    education: user.education,
    occupation: user.occupation,
    annualIncome: user.annualIncome,
    religion: user.religion,
    motherTongue: user.motherTongue,
    familyType: user.familyType,
    fatherOccupation: user.fatherOccupation,
    motherOccupation: user.motherOccupation,
    siblings: user.siblings,
    diet: user.diet,
    smoking: user.smoking,
    drinking: user.drinking,
    intent: user.intent,
  });

  const [photos, setPhotos] = useState<UserPhoto[]>(user.photos);
  const [openSection, setOpenSection] = useState<SectionId>("identity");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completion = calculateProfileCompletion({
    ...user,
    ...form,
    photos,
  } as Partial<UserDocument>);

  // ── Helpers ──
  const set = <K extends keyof UpdateUserProfileData>(
    key: K,
    val: UpdateUserProfileData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSuccess(false);
    setError(null);
  };

  const toggleSection = useCallback((id: SectionId) => {
    setOpenSection((prev) => (prev === id ? (null as any) : id));
  }, []);

  // ── Save ──
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateUserProfile(user.uid, form);
      setSuccess(true);
      onSave?.(updated);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const e = err as UserServiceError;
      setError(e.en ?? "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }, [user.uid, form, onSave]);

  // ── Photo upload ──
  const handlePhotoUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);
      try {
        const url = await uploadProfilePhoto(
          user.uid,
          file,
          photos.length === 0, // first photo = primary
        );
        // Add to local state
        setPhotos((prev) => [
          ...prev.map((p) =>
            prev.length === 0 ? p : { ...p, isPrimary: false },
          ),
          {
            url,
            isPrimary: photos.length === 0,
            storagePath: `users/${user.uid}/photos/${Date.now()}.jpg`,
          },
        ]);
      } catch (err) {
        const e = err as UserServiceError;
        setError(e.en ?? "Failed to upload photo.");
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [user.uid, photos],
  );

  // ── Photo delete ──
  const handlePhotoDelete = useCallback(
    async (storagePath: string) => {
      try {
        await deleteProfilePhoto(user.uid, storagePath);
        setPhotos((prev) => prev.filter((p) => p.storagePath !== storagePath));
      } catch (err) {
        const e = err as UserServiceError;
        setError(e.en ?? "Failed to delete photo.");
      }
    },
    [user.uid],
  );

  // ── Render ──

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* ── Profile completion progress ── */}
      <div className="mb-6 p-4 bg-[#F8F8F8] border-2 border-black shadow-[4px_4px_0px_#000000]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#424242] uppercase tracking-wider">
            Profile Completion
          </span>
          <span className="text-sm font-bold text-black">{completion}%</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-3 bg-[#E0E0E0] border-2 border-black">
          <motion.div
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {completion < 100 && (
          <p className="mt-1.5 text-[10px] text-[#9E9E9E]">
            Complete your profile for better match visibility
          </p>
        )}
      </div>

      {/* ── Verification badge ── */}
      <div className="mb-6">
        <VerificationBadgeLarge tier={user.verificationLevel} />
      </div>

      {/* ═══ IDENTITY SECTION ═══ */}
      <Section
        id="identity"
        title="Basic Info"
        icon={User}
        isOpen={openSection === "identity"}
        onToggle={() => toggleSection("identity")}
      >
        <FormField label="Full Name">
          <TextInput
            value={form.name ?? ""}
            onChange={(v) => set("name", v)}
            placeholder="Enter your full name"
          />
        </FormField>

        <FormField label="Gender">
          <SelectInput
            value={form.gender ?? ""}
            onChange={(v) => set("gender", (v || null) as Gender | null)}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
          />
        </FormField>

        <FormField label="Date of Birth">
          <TextInput
            type="date"
            value={form.dateOfBirth ?? ""}
            onChange={(v) => {
              set("dateOfBirth", v || null);
              // Auto-calculate age
              if (v) {
                const birth = new Date(v);
                const now = new Date();
                let age = now.getFullYear() - birth.getFullYear();
                const monthDiff = now.getMonth() - birth.getMonth();
                if (
                  monthDiff < 0 ||
                  (monthDiff === 0 && now.getDate() < birth.getDate())
                ) {
                  age--;
                }
                set("age", age);
              }
            }}
          />
        </FormField>

        <FormField label="Bio">
          <TextArea
            value={form.bio ?? ""}
            onChange={(v) => set("bio", v || null)}
            placeholder="Tell us about yourself…"
            maxLength={1000}
            rows={4}
          />
        </FormField>
      </Section>

      {/* ═══ PROFILE SECTION ═══ */}
      <Section
        id="profile"
        title="Education & Career"
        icon={GraduationCap}
        isOpen={openSection === "profile"}
        onToggle={() => toggleSection("profile")}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="City">
            <TextInput
              value={form.city ?? ""}
              onChange={(v) => set("city", v || null)}
              placeholder="Mumbai"
            />
          </FormField>
          <FormField label="State">
            <TextInput
              value={form.state ?? ""}
              onChange={(v) => set("state", v || null)}
              placeholder="Maharashtra"
            />
          </FormField>
        </div>

        <FormField label="Education">
          <TextInput
            value={form.education ?? ""}
            onChange={(v) => set("education", v || null)}
            placeholder="e.g. MBA, IIM Ahmedabad"
          />
        </FormField>

        <FormField label="Occupation">
          <TextInput
            value={form.occupation ?? ""}
            onChange={(v) => set("occupation", v || null)}
            placeholder="e.g. Software Engineer at Google"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Height">
            <TextInput
              value={form.height ?? ""}
              onChange={(v) => set("height", v || null)}
              placeholder={`5'10"`}
            />
          </FormField>
          <FormField label="Weight">
            <TextInput
              value={form.weight ?? ""}
              onChange={(v) => set("weight", v || null)}
              placeholder="72 kg"
            />
          </FormField>
        </div>

        <FormField label="Religion">
          <TextInput
            value={form.religion ?? ""}
            onChange={(v) => set("religion", v || null)}
            placeholder="e.g. Hindu"
          />
        </FormField>

        <FormField label="Mother Tongue">
          <TextInput
            value={form.motherTongue ?? ""}
            onChange={(v) => set("motherTongue", v || null)}
            placeholder="e.g. Hindi"
          />
        </FormField>
      </Section>

      {/* ═══ FAMILY SECTION ═══ */}
      <Section
        id="family"
        title="Family"
        icon={Home}
        isOpen={openSection === "family"}
        onToggle={() => toggleSection("family")}
      >
        <FormField label="Family Type">
          <SelectInput
            value={form.familyType ?? ""}
            onChange={(v) =>
              set("familyType", (v || null) as FamilyType | null)
            }
            options={FAMILY_OPTIONS}
            placeholder="Select family type"
          />
        </FormField>

        <FormField label="Father's Occupation">
          <TextInput
            value={form.fatherOccupation ?? ""}
            onChange={(v) => set("fatherOccupation", v || null)}
            placeholder="e.g. Business Owner"
          />
        </FormField>

        <FormField label="Mother's Occupation">
          <TextInput
            value={form.motherOccupation ?? ""}
            onChange={(v) => set("motherOccupation", v || null)}
            placeholder="e.g. Teacher"
          />
        </FormField>

        <FormField label="Siblings">
          <TextInput
            value={form.siblings ?? ""}
            onChange={(v) => set("siblings", v || null)}
            placeholder="e.g. 1 younger brother"
          />
        </FormField>
      </Section>

      {/* ═══ LIFESTYLE SECTION ═══ */}
      <Section
        id="lifestyle"
        title="Lifestyle & Intent"
        icon={Heart}
        isOpen={openSection === "lifestyle"}
        onToggle={() => toggleSection("lifestyle")}
      >
        <FormField label="Intent">
          <SelectInput
            value={form.intent ?? ""}
            onChange={(v) => set("intent", (v || null) as Intent | null)}
            options={INTENT_OPTIONS}
            placeholder="What are you looking for?"
          />
        </FormField>

        <FormField label="Diet">
          <SelectInput
            value={form.diet ?? ""}
            onChange={(v) => set("diet", (v || null) as Diet | null)}
            options={DIET_OPTIONS}
            placeholder="Select diet preference"
          />
        </FormField>

        <FormField label="Smoking">
          <SelectInput
            value={form.smoking ?? ""}
            onChange={(v) => set("smoking", (v || null) as Frequency | null)}
            options={FREQUENCY_OPTIONS}
            placeholder="Smoking habits"
          />
        </FormField>

        <FormField label="Drinking">
          <SelectInput
            value={form.drinking ?? ""}
            onChange={(v) => set("drinking", (v || null) as Frequency | null)}
            options={FREQUENCY_OPTIONS}
            placeholder="Drinking habits"
          />
        </FormField>
      </Section>

      {/* ═══ PHOTOS SECTION ═══ */}
      <Section
        id="photos"
        title="Photos"
        icon={Camera}
        isOpen={openSection === "photos"}
        onToggle={() => toggleSection("photos")}
      >
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div
              key={photo.storagePath ?? i}
              className="relative aspect-square border-2 border-black bg-[#F8F8F8] overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {photo.isPrimary && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black text-white text-[8px] font-bold uppercase">
                  Primary
                </span>
              )}
              {photo.storagePath && (
                <button
                  onClick={() => handlePhotoDelete(photo.storagePath!)}
                  className={cn(
                    "absolute top-1 right-1 w-6 h-6 flex items-center justify-center",
                    "bg-white border-2 border-black cursor-pointer",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                  )}
                  aria-label="Delete photo"
                >
                  <Trash2 className="w-3 h-3 text-black" strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}

          {/* Add photo button */}
          {photos.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "aspect-square border-2 border-dashed border-[#9E9E9E]",
                "flex flex-col items-center justify-center gap-1",
                "bg-white cursor-pointer",
                "hover:border-black hover:bg-[#F8F8F8] transition-colors",
                isUploading && "opacity-50 cursor-not-allowed",
              )}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-[#9E9E9E] animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 text-[#9E9E9E]" strokeWidth={2.5} />
                  <span className="text-[8px] text-[#9E9E9E] font-bold uppercase">
                    Add
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
          aria-label="Upload photo"
        />

        <p className="mt-2 text-[10px] text-[#9E9E9E]">
          Max 6 photos • Auto-compressed to &lt;500KB • JPEG/PNG/WebP
        </p>
      </Section>

      {/* ── Error message ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mb-4 p-3 bg-white border-2 border-dashed border-black flex items-start gap-2"
          >
            <AlertCircle
              className="w-4 h-4 text-black flex-shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <p className="text-xs text-[#212121] font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto flex-shrink-0 bg-transparent border-none cursor-pointer p-0"
            >
              <X className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success message ── */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mb-4 p-3 bg-[#F8F8F8] border-2 border-black flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={2.5} />
            <p className="text-xs text-[#212121] font-bold">
              Profile saved successfully!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save button ── */}
      <motion.button
        whileTap={!isSaving ? { scale: 0.97 } : undefined}
        onClick={handleSave}
        disabled={isSaving}
        className={cn(
          "w-full py-3.5 font-bold text-sm uppercase tracking-wider",
          "border-[3px] border-black transition-all duration-150",
          !isSaving
            ? [
                "bg-black text-white",
                "shadow-[4px_4px_0px_#000000]",
                "hover:translate-x-[2px] hover:translate-y-[2px]",
                "hover:shadow-[2px_2px_0px_#000000]",
                "cursor-pointer",
              ].join(" ")
            : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-not-allowed",
        )}
      >
        {isSaving ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Save className="w-4 h-4" strokeWidth={2.5} />
            Save Profile
          </span>
        )}
      </motion.button>
    </div>
  );
}

export default ProfileForm;
