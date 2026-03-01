/**
 * Onboarding Step 5 — Review & Publish
 *
 * Optimizations:
 *   • Full profile preview (what others see)
 *   • "Edit" button on each section for quick corrections
 *   • Privacy indicators (what's visible, what's hidden)
 *   • Completion incentive banner ("5 bonus likes!")
 *   • Confetti-style "POW!" on publish
 *   • Clear "You can edit anytime" reassurance
 *   • Comic book aesthetic
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
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
  Camera,
  Heart,
  Gift,
} from "lucide-react";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import {
  loadOnboardingData,
  clearOnboardingData,
  saveTimeAndReset,
  getOverallCompletion,
  getOnboardingAnalytics,
  type OnboardingData,
} from "@/lib/onboarding/onboarding-service";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    setData(loadOnboardingData());
  }, []);

  const completion = useMemo(() => data ? getOverallCompletion(data) : 0, [data]);
  const intentLabel = data?.intent?.replace(/-/g, " ") ?? "Not set";

  const details = data ? [
    { icon: MapPin, label: "City", val: data.city || "—" },
    { icon: GraduationCap, label: "Education", val: data.education || "—" },
    { icon: Briefcase, label: "Career", val: data.career || "—" },
    { icon: Home, label: "Family", val: data.familyStructure || "—" },
  ] : [];

  const handlePublish = async () => {
    if (!data) return;
    setPublishing(true);

    // Track analytics
    try {
      const analytics = getOnboardingAnalytics(data);
      // Would send to Umami/analytics here
      console.log("[Onboarding] Published:", analytics);
    } catch { /* silent */ }

    // Save time + simulate API call
    saveTimeAndReset();
    await new Promise((r) => setTimeout(r, 1200));

    localStorage.setItem("profile_published", "true");
    // Keep data in localStorage for profile page (don't clear yet)
    setPublished(true);
    setTimeout(() => router.push("/discover"), 1500);
  };

  if (!data) {
    // Skeleton loader
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProgressIndicator currentStep="review" showIncentive={false} />
        <div className="flex-1 px-4 py-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 border-[2px] border-[#E0E0E0] mb-3 animate-pulse bg-[#F8F8F8]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProgressIndicator currentStep="review" showIncentive={false} />

      <div className="flex-1 px-4 py-5 pb-32">
        {/* Published success state */}
        {published && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 text-center">
            <div className="border-[4px] border-black shadow-[8px_8px_0px_#000] bg-[#F8F8F8] px-8 py-10 max-w-sm w-full">
              <p className="text-4xl font-black text-[#212121] mb-2" style={{ fontFamily: "'Comic Neue', cursive" }}>
                POW!
              </p>
              <p className="text-lg font-bold text-[#212121] mb-1">Profile Published! 🎉</p>
              <p className="text-xs text-[#9E9E9E]">Redirecting to your matches…</p>
            </div>
          </div>
        )}

        {/* Completion banner */}
        {completion === 100 ? (
          <div className="border-[2px] border-black bg-[#212121] text-white p-3 mb-4 flex items-center gap-2">
            <Gift size={14} strokeWidth={3} />
            <div>
              <p className="text-[10px] font-bold">100% Complete — 5 bonus likes unlocked!</p>
              <p className="text-[8px] text-[#9E9E9E]">प्रोफ़ाइल पूर्ण — 5 बोनस लाइक अनलॉक!</p>
            </div>
          </div>
        ) : (
          <div className="border-[2px] border-[#E0E0E0] p-3 mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-bold text-[#424242]">Profile {completion}% complete</p>
              <p className="text-[8px] text-[#9E9E9E]">Complete to earn 5 bonus likes</p>
            </div>
            <div className="h-1.5 bg-[#F8F8F8] border border-[#E0E0E0]">
              <div className="h-full bg-[#212121] transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        )}

        {/* Heading */}
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={16} strokeWidth={2.5} className="text-[#212121]" />
          <div>
            <h1 className="text-xl font-bold text-[#212121]">Your profile preview</h1>
            <p className="text-xs text-[#9E9E9E]">Review before publishing</p>
          </div>
        </div>

        {/* Profile card */}
        <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white mb-4">
          {/* Photo section */}
          <div className="h-16 bg-[#F8F8F8] border-b-[2px] border-black relative flex items-center justify-center">
            {data.photoCount > 0 ? (
              <div className="flex gap-1">
                {data.photoUrls.slice(0, 3).map((_, i) => (
                  <div key={i} className="w-8 h-8 border-[1px] border-black bg-[#E0E0E0]">
                    <Camera size={12} className="text-[#9E9E9E] m-auto mt-1.5" />
                  </div>
                ))}
                <span className="text-[9px] font-bold text-[#424242] self-center ml-1">
                  {data.photoCount} photo{data.photoCount > 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <span className="text-[9px] text-[#9E9E9E] font-bold">No photos added</span>
            )}
            <button
              onClick={() => router.push("/photos")}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 border-[1px] border-black text-[8px] font-bold text-[#212121] hover:bg-[#E0E0E0] transition-colors"
            >
              <Edit2 size={8} strokeWidth={3} /> Edit
            </button>
          </div>

          {/* Info section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-[#212121]">Your Profile</h2>
                <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 border-[2px] border-black bg-[#F8F8F8] capitalize">
                  {intentLabel}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 border-[1px] border-black text-[9px] font-bold text-[#212121]">
                <Shield size={8} strokeWidth={3} /> Phone Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {details.map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon size={10} strokeWidth={2} className="text-[#9E9E9E] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] text-[#9E9E9E]">{label}</p>
                    <p className="text-[10px] font-bold text-[#212121] truncate">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Values summary */}
            {data.loveLanguages.length > 0 && (
              <div className="mt-3 pt-2 border-t border-dashed border-[#E0E0E0]">
                <p className="text-[8px] text-[#9E9E9E] mb-1">Love Languages</p>
                <div className="flex gap-1 flex-wrap">
                  {data.loveLanguages.map((l) => (
                    <span key={l} className="px-1.5 py-0.5 border-[1px] border-[#E0E0E0] text-[8px] font-bold text-[#424242] capitalize">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.bio && (
              <div className="mt-3 pt-2 border-t border-dashed border-[#E0E0E0]">
                <p className="text-[8px] text-[#9E9E9E] mb-1">Bio</p>
                <p className="text-[10px] text-[#424242] leading-relaxed">{data.bio}</p>
              </div>
            )}

            {/* Edit links */}
            <div className="mt-3 pt-2 border-t border-dashed border-[#E0E0E0] flex gap-2 flex-wrap">
              {[
                { label: "Intent", path: "/intent" },
                { label: "Details", path: "/life-details" },
                { label: "Values", path: "/values" },
                { label: "Photos", path: "/photos" },
              ].map((s) => (
                <button
                  key={s.path}
                  onClick={() => router.push(s.path)}
                  className="px-2 py-0.5 border-[1px] border-[#E0E0E0] text-[8px] font-bold text-[#9E9E9E] hover:border-black hover:text-[#212121] transition-colors flex items-center gap-0.5"
                >
                  <Edit2 size={7} strokeWidth={3} /> {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="border-[2px] border-[#E0E0E0] p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={12} strokeWidth={2.5} className="text-[#424242]" />
            <h3 className="text-[10px] font-bold text-[#212121]">What others see first</h3>
          </div>
          <div className="space-y-1">
            {[
              { label: "First name, Age, City", visible: true },
              { label: "Intent & Values", visible: true },
              { label: "Photo", visible: false, note: "Blurred until mutual interest" },
              { label: "Full name", visible: false },
              { label: "Phone number", visible: false, note: "Never shared" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-[9px]">
                <span className="text-[#424242]">{row.label}</span>
                <span className={`font-bold ${row.visible ? "text-[#212121]" : "text-[#9E9E9E]"}`}>
                  {row.visible ? "✓ Visible" : row.note ?? "Hidden"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shield notice */}
        <div className="border-[2px] border-black p-3 flex items-start gap-2">
          <ShieldCheck size={14} strokeWidth={2.5} className="text-[#212121] shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold text-[#212121]">Privacy Protected</p>
            <p className="text-[9px] text-[#9E9E9E] leading-relaxed">
              Your photo is blurred until both parties express interest. Real name shown only to verified matches. You can edit or delete your profile anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed publish button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[2px] border-black px-4 py-3 safe-bottom">
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-3.5 border-[3px] border-black bg-black text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-60"
        >
          {publishing ? (
            <>
              <Sparkles size={14} strokeWidth={3} className="animate-spin" />
              Publishing your profile…
            </>
          ) : (
            <>
              <Sparkles size={14} strokeWidth={2.5} />
              Publish Profile
              <ArrowRight size={14} strokeWidth={3} />
            </>
          )}
        </button>
        <p className="text-center text-[8px] text-[#9E9E9E] mt-2">
          You can edit your profile anytime after publishing
        </p>
      </div>
    </div>
  );
}
