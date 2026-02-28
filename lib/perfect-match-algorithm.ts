/**
 * Bandhan AI — Perfect Match Algorithm
 * Selects 1 (or 3 for premium) best daily matches at midnight IST.
 * Scoring weights tuned for Indian marriage context.
 */

export interface MatchCandidate {
  id: string;
  name: string;
  age: number;
  city: string;
  compatibility: number;
  verificationLevel: "bronze" | "silver" | "gold";
  intent: string;
  isActive: boolean; // active in last 7 days
  lastActive?: string;
  imageUrl?: string;
  bio?: string;
  matchReasons: MatchReason[];
}

export interface MatchReason {
  factor: string;
  factorHi: string;
  description: string;
  descriptionHi: string;
  weight: number;
}

export interface PerfectMatch {
  candidate: MatchCandidate;
  score: number;
  reasons: MatchReason[];
  selectedAt: string;
}

// ─── Scoring Weights (Indian marriage priorities) ───────────────────────
const WEIGHTS = {
  compatibility: 0.30, // AI compatibility score
  verification: 0.15, // trust signal
  intent: 0.20,       // alignment on marriage vs casual
  activity: 0.10,     // recent activity = real user
  location: 0.10,     // same city is a big plus
  values: 0.15,       // lifestyle alignment (diet, family, etc.)
};

const VERIFICATION_SCORES: Record<string, number> = {
  gold: 100,
  silver: 70,
  bronze: 40,
};

/** Score a single candidate */
function scoreCandidate(
  candidate: MatchCandidate,
  userCity: string,
  userIntent: string,
): number {
  let score = 0;

  // Compatibility (0-100 → 0-30)
  score += (candidate.compatibility / 100) * WEIGHTS.compatibility * 100;

  // Verification (gold=15, silver=10.5, bronze=6)
  score += (VERIFICATION_SCORES[candidate.verificationLevel] / 100) * WEIGHTS.verification * 100;

  // Intent match (full match = 20, partial = 10, mismatch = 0)
  if (candidate.intent === userIntent) {
    score += WEIGHTS.intent * 100;
  } else if (
    (candidate.intent === "marriage-soon" && userIntent === "serious-relationship") ||
    (candidate.intent === "serious-relationship" && userIntent === "marriage-soon")
  ) {
    score += WEIGHTS.intent * 50;
  }

  // Activity (active = 10, inactive = 2)
  score += (candidate.isActive ? 1 : 0.2) * WEIGHTS.activity * 100;

  // Location (same city = 10, different = 3)
  score += (candidate.city === userCity ? 1 : 0.3) * WEIGHTS.location * 100;

  // Values placeholder (uses compatibility as proxy)
  score += (candidate.compatibility / 100) * WEIGHTS.values * 100;

  return Math.round(score);
}

/** Generate reasons why this is a good match */
function generateReasons(
  candidate: MatchCandidate,
  userCity: string,
): MatchReason[] {
  const reasons: MatchReason[] = [];

  if (candidate.compatibility >= 85) {
    reasons.push({
      factor: "High Compatibility",
      factorHi: "उच्च अनुकूलता",
      description: `${candidate.compatibility}% compatibility based on values and preferences`,
      descriptionHi: `मूल्यों और प्राथमिकताओं के आधार पर ${candidate.compatibility}% अनुकूलता`,
      weight: 5,
    });
  }

  if (candidate.city === userCity) {
    reasons.push({
      factor: "Same City",
      factorHi: "एक ही शहर",
      description: `Both in ${candidate.city} — easy to meet!`,
      descriptionHi: `दोनों ${candidate.city} में — मिलना आसान!`,
      weight: 4,
    });
  }

  if (candidate.verificationLevel === "gold") {
    reasons.push({
      factor: "Fully Verified",
      factorHi: "पूर्ण सत्यापित",
      description: "Identity verified via DigiLocker + face match",
      descriptionHi: "DigiLocker + फेस मैच से पहचान सत्यापित",
      weight: 4,
    });
  }

  if (candidate.intent === "marriage-soon") {
    reasons.push({
      factor: "Marriage Intent",
      factorHi: "विवाह का इरादा",
      description: "Serious about finding a life partner",
      descriptionHi: "जीवन साथी खोजने के बारे में गंभीर",
      weight: 5,
    });
  }

  if (candidate.isActive) {
    reasons.push({
      factor: "Active User",
      factorHi: "सक्रिय उपयोगकर्ता",
      description: "Active in the last 7 days",
      descriptionHi: "पिछले 7 दिनों में सक्रिय",
      weight: 2,
    });
  }

  return reasons.sort((a, b) => b.weight - a.weight).slice(0, 3);
}

/** Select the best daily match(es) from candidates */
export function selectPerfectMatches(
  candidates: MatchCandidate[],
  userCity: string,
  userIntent: string,
  count = 1,
): PerfectMatch[] {
  if (candidates.length === 0) return [];

  const scored = candidates.map((c) => ({
    candidate: c,
    score: scoreCandidate(c, userCity, userIntent),
    reasons: generateReasons(c, userCity),
    selectedAt: new Date().toISOString(),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count);
}

/** Check if it's time to refresh (midnight IST) */
export function shouldRefreshDailyPicks(): boolean {
  const REFRESH_KEY = "bandhan-daily-picks-date";
  try {
    const today = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const last = localStorage.getItem(REFRESH_KEY);
    if (last !== today) {
      localStorage.setItem(REFRESH_KEY, today);
      return true;
    }
    return false;
  } catch {
    return true;
  }
}
