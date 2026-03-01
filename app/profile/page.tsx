/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Page (Comic Book Aesthetic)
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: /profile
 *
 * Sections (top to bottom):
 *   1. ProfileHeader — photo, name, age, badge, intent
 *   2. ProfileProgress — completion bar with checklist
 *   3. LifeDetails — 2-col grid of key details
 *   4. About Me — bio with edit button
 *   5. Non-Negotiables — dealbreakers display
 *   6. ProfilePrompts — "Life Story" prompts
 *   7. ProfileVisitors — "Who viewed your profile"
 *   8. Action buttons — Edit Profile, Photos, Privacy, Logout
 *
 * Monochromatic. 2px black borders. Hard 8-bit shadows. No gradients.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pencil,
  Camera,
  Shield,
  LogOut,
  X,
  Ban,
  Cigarette,
  Wine,
  Leaf,
  Users,
  MapPin,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  type ProfileHeaderData,
  ProfileHeader,
} from "@/components/profile/ProfileHeader";
import { type ProfileItem, ProfileProgress } from "@/components/profile/ProfileProgress";
import { LifeDetails, buildLifeDetails } from "@/components/profile/LifeDetails";
import {
  type ProfilePrompt,
  ProfilePrompts,
  DEFAULT_PROMPTS,
} from "@/components/profile/ProfilePrompts";
import {
  type ProfileVisitor,
  ProfileVisitors,
} from "@/components/profile/ProfileVisitors";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_HEADER: ProfileHeaderData = {
  name: "Rahul Sharma",
  age: 28,
  city: "Bangalore",
  initials: "RS",
  gradientFrom: "#EDE9FE",
  gradientTo: "#DDD6FE",
  verificationLevel: "gold",
  intent: "Marriage within 1–2 years",
};

const MOCK_COMPLETION: ProfileItem[] = [
  { id: "photo", label: "Add profile photo", completed: true },
  { id: "bio", label: "Write a bio", completed: true },
  { id: "details", label: "Add life details", completed: true },
  { id: "photos2", label: "Add 2 more photos", completed: false },
  { id: "prompts", label: "Answer 3+ Life Story prompts", completed: true },
  { id: "verify", label: "Complete Gold verification", completed: true },
  { id: "dealbreakers", label: "Set Non-Negotiables", completed: false },
  { id: "preferences", label: "Set match preferences", completed: true },
];

const MOCK_BIO =
  "Software Engineer at a Bangalore startup. Passionate about travel, cooking, and building things that matter. Looking for someone who values both ambition and warmth.";

interface DealBreaker {
  id: string;
  label: string;
  value: string;
  icon: typeof Leaf;
}

const MOCK_DEALBREAKERS: DealBreaker[] = [
  { id: "smoking", label: "Smoking", value: "Non-negotiable: Never", icon: Cigarette },
  { id: "drinking", label: "Drinking", value: "Okay occasionally", icon: Wine },
  { id: "diet", label: "Diet", value: "Strict vegetarian", icon: Leaf },
  { id: "family", label: "Family", value: "Open to discuss", icon: Users },
  { id: "relocation", label: "Relocation", value: "Open to discuss", icon: MapPin },
];

const MOCK_VISITORS: ProfileVisitor[] = [
  {
    id: "v1",
    name: "Priya",
    initials: "PS",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
    timestamp: "2h ago",
    isMatched: true,
  },
  {
    id: "v2",
    name: "Ananya",
    initials: "AI",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    timestamp: "5h ago",
    isMatched: false,
  },
  {
    id: "v3",
    name: "Sneha",
    initials: "SP",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
    timestamp: "1d ago",
    isMatched: false,
  },
  {
    id: "v4",
    name: "Kavya",
    initials: "KN",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
    timestamp: "2d ago",
    isMatched: true,
  },
  {
    id: "v5",
    name: "Riya",
    initials: "RG",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
    timestamp: "3d ago",
    isMatched: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [bio, setBio] = useState(MOCK_BIO);
  const [prompts, setPrompts] = useState<ProfilePrompt[]>(DEFAULT_PROMPTS);
  const [editBioOpen, setEditBioOpen] = useState(false);
  const [editPromptId, setEditPromptId] = useState<string | null>(null);

  // Handlers
  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const lifeDetails = buildLifeDetails({
    city: "Bangalore",
    education: "IIT Delhi, B.Tech CS",
    career: "Software Engineer",
    familyType: "Nuclear family",
    diet: "Vegetarian",
    religion: "Hindu",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ──────────────────────────────────────────────────────────────
          1. PROFILE HEADER
         ────────────────────────────────────────────────────────────── */}
      <ProfileHeader
        profile={MOCK_HEADER}
        onChangePhoto={() => console.log("Change photo")}
      />

      {/* Spacer + content */}
      <div className="space-y-0">
        {/* ──────────────────────────────────────────────────────────
            2. PROFILE COMPLETION
           ────────────────────────────────────────────────────────── */}
        <div className="px-4 pt-4">
          <ProfileProgress items={MOCK_COMPLETION} />
        </div>

        {/* ── Dashed divider ── */}
        <div className="mx-4 my-4 border-b border-dashed border-black" />

        {/* ──────────────────────────────────────────────────────────
            3. LIFE DETAILS GRID
           ────────────────────────────────────────────────────────── */}
        <LifeDetails details={lifeDetails} onEdit={() => console.log("Edit details")} />

        <div className="mx-4 my-4 border-b border-dashed border-black" />

        {/* ──────────────────────────────────────────────────────────
            4. ABOUT ME / BIO
           ────────────────────────────────────────────────────────── */}
        <section className="px-4" aria-label="About me">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="m-0 font-heading text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">
              About Me
            </h2>
            <button
              onClick={() => setEditBioOpen(true)}
              className="flex cursor-pointer items-center gap-1 font-heading text-[8px] font-bold uppercase tracking-wider text-black hover:underline"
              aria-label="Edit bio"
            >
              <Pencil className="h-3 w-3" strokeWidth={2} />
              Edit
            </button>
          </div>
          <div className="border-[2px] border-black bg-[#F8F8F8] px-3 py-3 shadow-[4px_4px_0px_#000000]">
            <p className="m-0 text-xs leading-relaxed text-[#212121]">
              {bio || "Tap edit to write something about yourself…"}
            </p>
          </div>
        </section>

        <div className="mx-4 my-4 border-b border-dashed border-black" />

        {/* ──────────────────────────────────────────────────────────
            5. NON-NEGOTIABLES (Dealbreakers)
           ────────────────────────────────────────────────────────── */}
        <section className="px-4" aria-label="Non-negotiables">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="m-0 font-heading text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">
                Non-Negotiables
              </h2>
              <Ban className="h-3 w-3 text-[#9E9E9E]" strokeWidth={2} />
            </div>
            <button
              className="flex cursor-pointer items-center gap-1 font-heading text-[8px] font-bold uppercase tracking-wider text-black hover:underline"
              aria-label="Edit dealbreakers"
            >
              <Pencil className="h-3 w-3" strokeWidth={2} />
              Edit
            </button>
          </div>
          <div className="border-[2px] border-black bg-white shadow-[4px_4px_0px_#000000]">
            {MOCK_DEALBREAKERS.map((d, i) => {
              const Icon = d.icon;
              const isLast = i === MOCK_DEALBREAKERS.length - 1;
              return (
                <div
                  key={d.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5",
                    !isLast && "border-b border-dashed border-[#E0E0E0]",
                  )}
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center border-[2px] border-black bg-[#F8F8F8]">
                    <Icon className="h-3.5 w-3.5 text-black" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[8px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                      {d.label}
                    </p>
                    <p className="m-0 truncate font-heading text-xs font-bold text-[#212121]">
                      {d.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mx-4 my-4 border-b border-dashed border-black" />

        {/* ──────────────────────────────────────────────────────────
            6. LIFE STORY PROMPTS
           ────────────────────────────────────────────────────────── */}
        <ProfilePrompts prompts={prompts} onEditPrompt={(id) => setEditPromptId(id)} />

        <div className="mx-4 my-4 border-b border-dashed border-black" />

        {/* ──────────────────────────────────────────────────────────
            7. PROFILE VISITORS
           ────────────────────────────────────────────────────────── */}
        <ProfileVisitors
          visitors={MOCK_VISITORS}
          totalCount={12}
          hideMyVisits={false}
          onToggleHideVisits={(hide) => console.log("Hide visits:", hide)}
        />

        <div className="mx-4 my-4 border-b border-dashed border-black" />

        {/* ──────────────────────────────────────────────────────────
            8. ACTION BUTTONS
           ────────────────────────────────────────────────────────── */}
        <div className="space-y-2 px-4 pb-8">
          <h2 className="m-0 mb-2 font-heading text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">
            Account
          </h2>

          {/* Edit Profile */}
          <ActionRow icon={Pencil} label="Edit Profile" />
          {/* Change Photos */}
          <ActionRow icon={Camera} label="Change Photos" />
          {/* Privacy Settings */}
          <ActionRow icon={Shield} label="Privacy Settings" href="/more" />

          {/* Logout — danger style */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 px-4 py-3",
              "border-[2px] border-[#EF476F] bg-[#FFF0F3]",
              "shadow-[3px_3px_0px_#000000]",
              "transition-all duration-100",
              "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]",
              "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
            )}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-[2px] border-[#EF476F] bg-white">
              <LogOut className="h-4 w-4 text-[#EF476F]" strokeWidth={2} />
            </div>
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#EF476F]">
              Log Out
            </span>
          </button>

          {/* Version */}
          <p className="m-0 pt-4 text-center text-[8px] text-[#9E9E9E]">
            Bandhan AI v1.0.0 · Made with ❤️ in India
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          EDIT BIO MODAL
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editBioOpen && (
          <EditBioModal
            initialBio={bio}
            onSave={(newBio) => {
              setBio(newBio);
              setEditBioOpen(false);
            }}
            onClose={() => setEditBioOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          EDIT PROMPT MODAL
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editPromptId && (
          <EditPromptModal
            prompt={prompts.find((p) => p.id === editPromptId)!}
            onSave={(id, answer) => {
              setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, answer } : p)));
              setEditPromptId(null);
            }}
            onClose={() => setEditPromptId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Action Row Button
// ─────────────────────────────────────────────────────────────────────────────

function ActionRow({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: typeof Pencil;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 px-4 py-3 no-underline",
        "border-[2px] border-black bg-white",
        "shadow-[3px_3px_0px_#000000]",
        "transition-all duration-100",
        "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]",
        "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
      )}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-[2px] border-black bg-[#F8F8F8]">
        <Icon className="h-4 w-4 text-black" strokeWidth={2} />
      </div>
      <span className="font-heading text-xs font-bold uppercase tracking-wider text-black">
        {label}
      </span>
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Bio Modal
// ─────────────────────────────────────────────────────────────────────────────

function EditBioModal({
  initialBio,
  onSave,
  onClose,
}: {
  initialBio: string;
  onSave: (bio: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialBio);
  const maxLen = 300;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t-[3px] border-black bg-white safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-label="Edit bio"
      >
        <div className="flex items-center justify-between border-b-[2px] border-black px-4 py-3">
          <h2 className="m-0 font-heading text-sm font-bold uppercase tracking-wide text-black">
            ✏️ Edit Bio
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8]"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-black" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLen))}
            rows={4}
            maxLength={maxLen}
            placeholder="Tell others about yourself…"
            className="w-full resize-none border-[2px] border-black bg-white px-3 py-2 text-sm text-[#212121] placeholder:italic placeholder:text-[#9E9E9E] focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000] focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] tabular-nums text-[#9E9E9E]">
              {text.length}/{maxLen}
            </span>
            <button
              onClick={() => onSave(text.trim())}
              className={cn(
                "border-[2px] border-black px-4 py-2",
                "cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider",
                "bg-black text-white shadow-[3px_3px_0px_#000]",
                "hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#424242] hover:shadow-[2px_2px_0px_#000]",
                "transition-all duration-100",
              )}
            >
              Save ✓
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Prompt Modal
// ─────────────────────────────────────────────────────────────────────────────

function EditPromptModal({
  prompt,
  onSave,
  onClose,
}: {
  prompt: ProfilePrompt;
  onSave: (id: string, answer: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(prompt.answer || "");
  const maxLen = 200;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t-[3px] border-black bg-white safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-label="Edit prompt"
      >
        <div className="flex items-center justify-between border-b-[2px] border-black px-4 py-3">
          <h2 className="m-0 font-heading text-sm font-bold uppercase tracking-wide text-black">
            ✏️ Edit Prompt
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8]"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-black" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-4">
          <p className="m-0 mb-2 font-heading text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">
            {prompt.question}
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLen))}
            rows={3}
            maxLength={maxLen}
            placeholder="Type your answer…"
            className="w-full resize-none border-[2px] border-black bg-white px-3 py-2 text-sm text-[#212121] placeholder:italic placeholder:text-[#9E9E9E] focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000] focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] tabular-nums text-[#9E9E9E]">
              {text.length}/{maxLen}
            </span>
            <button
              onClick={() => {
                if (text.trim()) onSave(prompt.id, text.trim());
              }}
              disabled={!text.trim()}
              className={cn(
                "border-[2px] border-black px-4 py-2",
                "font-heading text-[10px] font-bold uppercase tracking-wider",
                "transition-all duration-100",
                text.trim()
                  ? "cursor-pointer bg-black text-white shadow-[3px_3px_0px_#000] hover:bg-[#424242]"
                  : "cursor-not-allowed bg-[#E0E0E0] text-[#9E9E9E]",
              )}
            >
              Save ✓
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
