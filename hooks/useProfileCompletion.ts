/**
 * Bandhan AI — Profile Completion Hook
 * Calculates completion percentage from profile fields.
 * Returns actionable missing-field list for UI prompts.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

export interface ProfileSection {
  key: string;
  label: string;
  labelHi: string;
  weight: number;
  isComplete: boolean;
}

export interface ProfileCompletion {
  percentage: number;
  sections: ProfileSection[];
  missingFields: ProfileSection[];
  completedCount: number;
  totalCount: number;
  nextAction: string | null;
  nextActionHi: string | null;
}

const SECTION_DEFS: Omit<ProfileSection, "isComplete">[] = [
  {
    key: "photo",
    label: "Profile Photo",
    labelHi: "प्रोफ़ाइल फ़ोटो",
    weight: 20,
  },
  {
    key: "bio",
    label: "Bio / About Me",
    labelHi: "बायो / मेरे बारे में",
    weight: 15,
  },
  {
    key: "basics",
    label: "Basic Details",
    labelHi: "बुनियादी जानकारी",
    weight: 15,
  },
  {
    key: "education",
    label: "Education & Career",
    labelHi: "शिक्षा और करियर",
    weight: 15,
  },
  {
    key: "family",
    label: "Family Details",
    labelHi: "परिवार की जानकारी",
    weight: 10,
  },
  {
    key: "values",
    label: "Values & Lifestyle",
    labelHi: "मूल्य और जीवनशैली",
    weight: 10,
  },
  {
    key: "preferences",
    label: "Match Preferences",
    labelHi: "मैच प्राथमिकताएं",
    weight: 5,
  },
  {
    key: "verification",
    label: "Verification",
    labelHi: "सत्यापन",
    weight: 10,
  },
];

/** Check if a section is complete by reading localStorage profile data */
function checkSection(key: string): boolean {
  try {
    const profile = JSON.parse(localStorage.getItem("bandhan-profile") || "{}");
    const user = JSON.parse(localStorage.getItem("bandhan-auth") || "{}");

    switch (key) {
      case "photo":
        return !!(profile.photos?.length > 0 || profile.avatarUrl);
      case "bio":
        return !!(profile.bio && profile.bio.length >= 20);
      case "basics":
        return !!(
          profile.name &&
          profile.age &&
          profile.city &&
          profile.gender
        );
      case "education":
        return !!(profile.education && profile.occupation);
      case "family":
        return !!profile.familyType;
      case "values":
        return !!(profile.diet && profile.intent);
      case "preferences":
        return !!profile.preferences?.ageRange;
      case "verification":
        return (
          user?.state?.user?.verificationLevel !== "bronze" ||
          user?.state?.user?.isVerified === true
        );
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export function useProfileCompletion(): ProfileCompletion {
  const [completion, setCompletion] = useState<ProfileCompletion>(() =>
    calculate(),
  );

  function calculate(): ProfileCompletion {
    const sections: ProfileSection[] = SECTION_DEFS.map((def) => ({
      ...def,
      isComplete: checkSection(def.key),
    }));

    const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
    const completedWeight = sections
      .filter((s) => s.isComplete)
      .reduce((sum, s) => sum + s.weight, 0);
    const percentage = Math.round((completedWeight / totalWeight) * 100);
    const missingFields = sections.filter((s) => !s.isComplete);
    const completedCount = sections.filter((s) => s.isComplete).length;

    const next = missingFields[0] || null;

    return {
      percentage,
      sections,
      missingFields,
      completedCount,
      totalCount: sections.length,
      nextAction: next ? `Add ${next.label} to improve your profile` : null,
      nextActionHi: next
        ? `अपनी प्रोफ़ाइल सुधारने के लिए ${next.labelHi} जोड़ें`
        : null,
    };
  }

  const refresh = useCallback(() => {
    setCompletion(calculate());
  }, []);

  // Re-calculate on client mount (SSR doesn't have localStorage)
  useEffect(() => {
    setCompletion(calculate());
  }, []);

  // Recalculate on storage events (cross-tab sync)
  useEffect(() => {
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [refresh]);

  return completion;
}
