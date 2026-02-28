"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Shield,
  ShieldCheck,
  Edit2,
  Sparkles,
  CheckCircle2,
  Eye,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

interface OnboardingData {
  intent?: string;
  lifeArchitecture?: {
    city?: string;
    education?: string;
    career?: string;
    family?: string;
  };
  values?: { loveLangs?: string[] };
}

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>({});
  const [publishing, setPublish] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("onboarding_data") || "{}",
      );
      setData(stored);
    } catch {}
  }, []);

  const handlePublish = async () => {
    setPublish(true);
    await new Promise((r) => setTimeout(r, 1400));
    localStorage.setItem("profile_published", "true");
    router.push("/matches");
  };

  const la = data.lifeArchitecture;
  const intentLabel = data.intent?.replace(/-/g, " ") ?? "Not set";

  const details = [
    { icon: MapPin, label: "City", val: la?.city ?? "—" },
    { icon: GraduationCap, label: "Education", val: la?.education ?? "—" },
    { icon: Briefcase, label: "Career", val: la?.career ?? "—" },
    { icon: Home, label: "Family", val: la?.family ?? "—" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col safe-top safe-bottom pb-28">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-blush-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-16 -left-16 w-64 h-64 bg-lavender-100 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Step indicator */}
      <div className="relative z-10 px-5 pt-6">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-1 rounded-full flex-1 bg-ink-900" />
          ))}
        </div>
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-5 h-5 text-sage-500" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-sage-600 uppercase tracking-wide">
            Almost done!
          </span>
        </div>
        <h1 className="text-[1.6rem] font-bold text-ink-900 tracking-tight leading-tight">
          Your profile preview
        </h1>
        <p className="text-sm text-ink-500 mt-1">Review before publishing</p>
      </motion.div>

      <div className="relative z-10 px-5 space-y-4">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden"
        >
          {/* Cover */}
          <div className="h-20 bg-gradient-to-r from-lavender-100 via-blush-100 to-peach-100 relative">
            <button
              onClick={() => router.push("/onboarding/life-architecture")}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm text-[11px] font-semibold text-ink-600 hover:bg-white transition-colors"
            >
              <Edit2 className="w-3 h-3" strokeWidth={2} /> Edit
            </button>
          </div>
          <div className="px-5 pb-5 -mt-8">
            <div className="flex items-end justify-between mb-4">
              {/* Avatar upload */}
              <label className="relative cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-lavender-100 flex flex-col items-center justify-center gap-1">
                    <Camera
                      className="w-5 h-5 text-lavender-400"
                      strokeWidth={1.5}
                    />
                    <span className="text-[9px] text-lavender-500 font-medium">
                      Add photo
                    </span>
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" />
              </label>
              {/* Verification badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-peach-100 border-peach-200 text-[11px] font-bold text-peach-700">
                <Shield className="w-3 h-3" strokeWidth={2.5} /> Phone Verified
              </span>
            </div>

            <div className="mb-3">
              <h2 className="text-lg font-bold text-ink-900">Your Profile</h2>
              <span
                className={cn(
                  "inline-block mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  "bg-blush-100 text-blush-700 capitalize",
                )}
              >
                {intentLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {details.map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon
                    className="w-3.5 h-3.5 text-ink-400 shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-ink-400">{label}</p>
                    <p className="text-[12px] font-semibold text-ink-800 truncate">
                      {val}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Privacy notice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-sage-50 border border-sage-200"
        >
          <ShieldCheck
            className="w-5 h-5 text-sage-600 shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-[13px] font-semibold text-sage-800 mb-0.5">
              Privacy Protected
            </p>
            <p className="text-[11px] text-sage-600 leading-relaxed">
              Your photo is blurred until both parties express interest. Real
              name shown only to verified matches.
            </p>
          </div>
        </motion.div>

        {/* What others see */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-ink-100 shadow-sm p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-ink-500" strokeWidth={1.5} />
            <h3 className="text-[13px] font-bold text-ink-800">
              What others see first
            </h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "First name only", visible: true },
              { label: "Age", visible: true },
              { label: "City", visible: true },
              { label: "Intent", visible: true },
              { label: "Full name", visible: false },
              {
                label: "Photo",
                visible: false,
                note: "Blurred until mutual interest",
              },
              { label: "Phone number", visible: false },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-[12px]"
              >
                <span className="text-ink-600">{row.label}</span>
                <span
                  className={cn(
                    "font-semibold flex items-center gap-1",
                    row.visible ? "text-sage-600" : "text-ink-400",
                  )}
                >
                  {row.visible ? "✓ Visible" : (row.note ?? "Hidden")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fixed publish button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-ink-100 px-5 py-4 safe-bottom">
        <motion.button
          onClick={handlePublish}
          disabled={publishing}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl bg-ink-900 text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-ink-700 disabled:opacity-60 transition-all shadow-sm"
        >
          {publishing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Publishing your profile…
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              Publish Profile
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
        <p className="text-center text-[10px] text-ink-400 mt-2.5">
          You can edit your profile anytime after publishing
        </p>
      </div>
    </div>
  );
}
