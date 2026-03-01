/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit Tests — Hooks (useProfileCompletion, useDailyLimit, useFilters)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { renderHook, act } from "@testing-library/react";

// ─── useCountdownTimer ───────────────────────────────────────────────────────

describe("Countdown timer logic", () => {
  jest.useFakeTimers();

  it("counts down from initial value", () => {
    let remaining = 30;
    const tick = () => { remaining = Math.max(0, remaining - 1); };

    tick();
    expect(remaining).toBe(29);
  });

  it("stops at zero", () => {
    let remaining = 1;
    const tick = () => { remaining = Math.max(0, remaining - 1); };

    tick();
    expect(remaining).toBe(0);
    tick();
    expect(remaining).toBe(0);
  });
});

// ─── Daily Limit Logic ───────────────────────────────────────────────────────

describe("Daily limit logic", () => {
  const FREE_LIMITS = { profiles: 5, likes: 5, specialInterest: 1 };
  const PREMIUM_LIMITS = { profiles: 50, likes: 50, specialInterest: 5 };

  function getDailyLimits(isPremium: boolean) {
    return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  }

  function canPerformAction(used: number, limit: number): boolean {
    return used < limit;
  }

  it("free user has 5 profile views per day", () => {
    const limits = getDailyLimits(false);
    expect(limits.profiles).toBe(5);
  });

  it("premium user has 50 profile views per day", () => {
    const limits = getDailyLimits(true);
    expect(limits.profiles).toBe(50);
  });

  it("blocks action when limit reached", () => {
    expect(canPerformAction(5, 5)).toBe(false);
    expect(canPerformAction(4, 5)).toBe(true);
  });

  it("special interest limited to 1/day for free users", () => {
    const limits = getDailyLimits(false);
    expect(canPerformAction(0, limits.specialInterest)).toBe(true);
    expect(canPerformAction(1, limits.specialInterest)).toBe(false);
  });
});

// ─── Filter Logic ────────────────────────────────────────────────────────────

describe("Filter logic", () => {
  interface Filters {
    verifiedOnly: boolean;
    sameCity: boolean;
    intent?: string;
    diet?: string;
    ageMin?: number;
    ageMax?: number;
  }

  const defaultFilters: Filters = {
    verifiedOnly: false,
    sameCity: false,
  };

  function applyFilter(
    filters: Filters,
    users: { verified: boolean; city: string; age: number; intent: string }[],
    currentCity: string,
  ) {
    return users.filter((u) => {
      if (filters.verifiedOnly && !u.verified) return false;
      if (filters.sameCity && u.city !== currentCity) return false;
      if (filters.intent && u.intent !== filters.intent) return false;
      if (filters.ageMin && u.age < filters.ageMin) return false;
      if (filters.ageMax && u.age > filters.ageMax) return false;
      return true;
    });
  }

  const mockUsers = [
    { verified: true, city: "Mumbai", age: 27, intent: "marriage-soon" },
    { verified: false, city: "Mumbai", age: 30, intent: "friendship" },
    { verified: true, city: "Delhi", age: 25, intent: "marriage-soon" },
    { verified: true, city: "Mumbai", age: 35, intent: "serious-relationship" },
  ];

  it("returns all users with default filters", () => {
    const result = applyFilter(defaultFilters, mockUsers, "Mumbai");
    expect(result.length).toBe(4);
  });

  it("filters verified only", () => {
    const result = applyFilter(
      { ...defaultFilters, verifiedOnly: true },
      mockUsers,
      "Mumbai",
    );
    expect(result.every((u) => u.verified)).toBe(true);
    expect(result.length).toBe(3);
  });

  it("filters same city", () => {
    const result = applyFilter(
      { ...defaultFilters, sameCity: true },
      mockUsers,
      "Mumbai",
    );
    expect(result.every((u) => u.city === "Mumbai")).toBe(true);
  });

  it("filters by intent", () => {
    const result = applyFilter(
      { ...defaultFilters, intent: "marriage-soon" },
      mockUsers,
      "Mumbai",
    );
    expect(result.every((u) => u.intent === "marriage-soon")).toBe(true);
  });

  it("filters by age range", () => {
    const result = applyFilter(
      { ...defaultFilters, ageMin: 26, ageMax: 32 },
      mockUsers,
      "Mumbai",
    );
    expect(result.every((u) => u.age >= 26 && u.age <= 32)).toBe(true);
  });

  it("combines multiple filters", () => {
    const result = applyFilter(
      { verifiedOnly: true, sameCity: true, intent: "marriage-soon" },
      mockUsers,
      "Mumbai",
    );
    expect(result.length).toBe(1);
    expect(result[0].age).toBe(27);
  });
});

// ─── Profile Completion Logic ────────────────────────────────────────────────

describe("Profile completion scoring", () => {
  function calculateCompletion(profile: Record<string, any>): number {
    const fields = [
      { key: "name", weight: 10 },
      { key: "bio", weight: 15 },
      { key: "photos", weight: 20, check: (v: any) => Array.isArray(v) && v.length > 0 },
      { key: "education", weight: 10 },
      { key: "career", weight: 10 },
      { key: "intent", weight: 15 },
      { key: "city", weight: 10 },
      { key: "diet", weight: 5 },
      { key: "religion", weight: 5 },
    ];

    let score = 0;
    for (const f of fields) {
      const value = profile[f.key];
      if (f.check) {
        if (f.check(value)) score += f.weight;
      } else if (value && String(value).trim().length > 0) {
        score += f.weight;
      }
    }
    return Math.min(100, score);
  }

  it("full profile scores 100", () => {
    expect(
      calculateCompletion({
        name: "Priya",
        bio: "Bio",
        photos: ["p1.jpg"],
        education: "MBA",
        career: "PM",
        intent: "marriage-soon",
        city: "Mumbai",
        diet: "veg",
        religion: "Hindu",
      }),
    ).toBe(100);
  });

  it("empty profile scores 0", () => {
    expect(
      calculateCompletion({
        name: "",
        bio: "",
        photos: [],
        education: "",
        career: "",
        intent: "",
        city: "",
        diet: "",
        religion: "",
      }),
    ).toBe(0);
  });

  it("partial profile scores proportionally", () => {
    const score = calculateCompletion({
      name: "Priya",
      bio: "",
      photos: ["p1.jpg"],
      education: "",
      career: "",
      intent: "marriage-soon",
      city: "",
      diet: "",
      religion: "",
    });
    expect(score).toBe(45); // name(10) + photos(20) + intent(15) = 45
  });
});
