"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  User,
  Shield,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  ChevronRight,
  Save,
  LogOut,
  Trash2,
  AlertTriangle,
  Bell,
  Globe,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
  name: string;
  age: number;
  avatarUrl: string;
  verificationLevel: "bronze" | "silver" | "gold";
  intent: string;
  city: string;
  education: string;
  career: string;
  family: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_PROFILE: ProfileData = {
  name: "Rahul Sharma",
  age: 28,
  avatarUrl: "",
  verificationLevel: "gold",
  intent: "Marriage within 1-2 years",
  city: "Bangalore",
  education: "IIT Delhi",
  career: "Software Engineer",
  family: "Living with parents",
};

// ─── VerificationBadge ───────────────────────────────────────────────────────
function VerifBadge({ level }: { level: "bronze" | "silver" | "gold" }) {
  const cfg = {
    bronze: {
      cls: "bg-peach-100 border-peach-200 text-peach-700",
      Icon: Shield,
      label: "Phone Verified",
    },
    silver: {
      cls: "bg-ink-100   border-ink-200   text-ink-600",
      Icon: Shield,
      label: "ID Verified",
    },
    gold: {
      cls: "bg-gold-100  border-gold-200  text-gold-700",
      Icon: ShieldCheck,
      label: "Gold Verified",
    },
  }[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold",
        cfg.cls,
      )}
    >
      <cfg.Icon className="w-3 h-3" strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const update = (field: keyof ProfileData, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  const handleDelete = async () => {
    await new Promise((r) => setTimeout(r, 1500));
    handleLogout();
  };

  const toggleSection = (s: string) =>
    setOpenSection((o) => (o === s ? null : s));

  return (
    <div className="min-h-screen bg-[#FAFAFA] safe-top pb-28">
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-ink-100 safe-top">
        <div className="max-w-lg mx-auto px-4 pt-14 pb-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-[1.15rem] font-bold text-ink-900 tracking-tight">
              Profile & Settings
            </h1>
            <p className="text-[11px] text-ink-400">Manage your account</p>
          </div>
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink-900 text-white text-xs font-bold hover:bg-ink-700 transition-colors disabled:opacity-50"
              >
                <motion.div
                  animate={isSaving ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    isSaving
                      ? { duration: 1, repeat: Infinity, ease: "linear" }
                      : {}
                  }
                >
                  <Save className="w-3.5 h-3.5" />
                </motion.div>
                {isSaving ? "Saving…" : "Save"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* ── Profile identity card ── */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          {/* Gradient cover */}
          <div className="h-20 bg-gradient-to-r from-lavender-100 via-blush-100 to-peach-100" />
          <div className="px-5 pb-5 -mt-8">
            <div className="flex items-end justify-between mb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-lavender-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-lavender-600">
                        {profile.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-ink-900 border-2 border-white flex items-center justify-center"
                >
                  <Camera className="w-3 h-3 text-white" strokeWidth={2.5} />
                </button>
              </div>
              <VerifBadge level={profile.verificationLevel} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1.5">
                  Display Name
                </label>
                <input
                  value={profile.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm text-ink-900 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1.5">
                  Looking for
                </label>
                <select
                  value={profile.intent}
                  onChange={(e) => update("intent", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-sm text-ink-900 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 bg-white"
                >
                  <option>Marriage within 1-2 years</option>
                  <option>Serious relationship with marriage potential</option>
                  <option>Friendship / Networking</option>
                  <option>Healing space</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Personal details accordion ── */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("details")}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-ink-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center">
                <User className="w-4 h-4 text-lavender-600" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] font-semibold text-ink-900">
                Personal Details
              </span>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 text-ink-400 transition-transform duration-200",
                openSection === "details" && "rotate-90",
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {openSection === "details" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-ink-100"
              >
                <div className="p-5 grid grid-cols-2 gap-3">
                  {(
                    [
                      { label: "City", field: "city", icon: MapPin },
                      {
                        label: "Education",
                        field: "education",
                        icon: GraduationCap,
                      },
                      { label: "Career", field: "career", icon: Briefcase },
                      { label: "Family", field: "family", icon: Home },
                    ] as const
                  ).map(({ label, field, icon: Icon }) => (
                    <div key={field}>
                      <label className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1.5">
                        {label}
                      </label>
                      <div className="relative">
                        <Icon
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400"
                          strokeWidth={1.5}
                        />
                        <input
                          value={profile[field] || ""}
                          onChange={(e) => update(field, e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-ink-200 text-sm text-ink-900 focus:outline-none focus:border-lavender-400 focus:ring-2 focus:ring-lavender-100 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Privacy accordion ── */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection("privacy")}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-ink-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sage-600" strokeWidth={1.5} />
              </div>
              <span className="text-[14px] font-semibold text-ink-900">
                Privacy & Safety
              </span>
            </div>
            <ChevronRight
              className={cn(
                "w-4 h-4 text-ink-400 transition-transform duration-200",
                openSection === "privacy" && "rotate-90",
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {openSection === "privacy" && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-ink-100"
              >
                <div className="divide-y divide-ink-50">
                  {[
                    {
                      label: "Show online status",
                      desc: "Others see when you're active",
                    },
                    {
                      label: "Blur photos",
                      desc: "Reveal only to accepted matches",
                    },
                    {
                      label: "Read receipts",
                      desc: "Show when you've read messages",
                    },
                  ].map(({ label, desc }, i) => (
                    <PrivacyRow
                      key={label}
                      label={label}
                      desc={desc}
                      defaultOn={i === 0}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── App settings rows ── */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden divide-y divide-ink-50">
          {[
            {
              icon: Bell,
              label: "Notifications",
              color: "bg-peach-100   text-peach-600",
            },
            {
              icon: Globe,
              label: "Language",
              color: "bg-sky-100     text-sky-600",
            },
            {
              icon: CreditCard,
              label: "Subscription",
              color: "bg-gold-100    text-gold-600",
            },
            {
              icon: HelpCircle,
              label: "Help & Support",
              color: "bg-lavender-100 text-lavender-600",
            },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-ink-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    color,
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <span className="text-[14px] font-medium text-ink-800">
                  {label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-500 transition-colors" />
            </button>
          ))}
        </div>

        {/* ── Danger zone ── */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden divide-y divide-ink-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-medium text-red-500">
              Sign Out
            </span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-medium text-red-500">
              Delete Account
            </span>
          </button>
        </div>

        <p className="text-center text-[10px] text-ink-300 pb-2">
          Version 1.0.0 · Bandhan AI
        </p>
      </div>

      {/* ── Avatar bottom sheet ── */}
      <AnimatePresence>
        {showAvatarModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="fixed inset-0 bg-ink-900/25 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10 safe-bottom shadow-2xl"
            >
              <div className="w-10 h-1 bg-ink-200 rounded-full mx-auto mb-5" />
              <h3 className="text-base font-bold text-ink-900 mb-4">
                Update Profile Photo
              </h3>
              <label className="block cursor-pointer">
                <input type="file" accept="image/*" className="hidden" />
                <div className="border-2 border-dashed border-ink-200 rounded-2xl p-10 text-center hover:border-lavender-300 hover:bg-lavender-50 transition-colors">
                  <Camera
                    className="w-8 h-8 text-ink-300 mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm font-semibold text-ink-600">
                    Tap to upload
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    PNG or JPG, max 5 MB
                  </p>
                </div>
              </label>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="w-full mt-3 py-3 rounded-2xl border border-ink-200 text-sm font-medium text-ink-500 hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete confirm dialog ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-5"
            >
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-ink-100 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle
                      className="w-5 h-5 text-red-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-[15px] font-bold text-ink-900">
                    Delete Account?
                  </h3>
                </div>
                <p className="text-[13px] text-ink-500 mb-5 leading-relaxed">
                  This cannot be undone. All your data, matches, and
                  conversations will be permanently deleted.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-ink-200 text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Privacy toggle row ───────────────────────────────────────────────────────
function PrivacyRow({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <p className="text-[13px] font-medium text-ink-800">{label}</p>
        <p className="text-[11px] text-ink-400">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0",
          on ? "bg-lavender-400" : "bg-ink-200",
        )}
      >
        <motion.div
          animate={{ x: on ? 16 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}
