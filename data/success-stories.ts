/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Success Stories (Curated + UGC)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Mock stories for social proof until real user submissions are available.
 * Privacy-respecting: first names only, silhouette avatars, no photos
 * unless the couple explicitly uploads and approves them.
 *
 * Also exports:
 *   • SuccessStorySubmission interface — for the submission form
 *   • Rotation / display helpers
 *   • Content moderation status types
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SuccessStory {
  id: string;
  nameA: string;
  nameB: string;
  cityA: string;
  cityB: string;
  quoteEn: string;
  quoteHi: string;
  /** How they matched (displayed as a tag) */
  matchedVia: string;
  /** Months from first match to engagement/marriage */
  durationMonths: number;
  verificationLevel: "bronze" | "silver" | "gold";
}

/**
 * Shape of a user-submitted success story (before moderation).
 * This is what the SuccessStorySubmission form produces.
 */
export interface SuccessStorySubmission {
  /** ID of the user submitting the story */
  submitterId: string;
  /** Partner's first name (entered by submitter) */
  partnerFirstName: string;
  /** Submitter's city */
  city: string;
  /** Partner's city */
  partnerCity: string;
  /** Story in English (required) */
  storyEn: string;
  /** Story in Hindi (optional — volunteer translators can fill later) */
  storyHi: string;
  /** How they met on Bandhan AI */
  howTheyMet: string;
  /** Months from match to current status */
  durationMonths: number;
  /** Current status */
  status: "dating" | "engaged" | "married";
  /** Consent to share publicly (required: true) */
  consentToShare: boolean;
  /** Consent for partner to be identified by first name */
  partnerConsent: boolean;
  /** Optional: photo URL uploaded by the couple */
  photoUrl?: string;
}

export type ModerationStatus =
  | "pending" // Awaiting review
  | "approved" // Published
  | "rejected" // Didn't meet guidelines
  | "flagged"; // Community-flagged for re-review

// ─────────────────────────────────────────────────────────────────────────────
// Curated Stories (mock data for social proof)
// ─────────────────────────────────────────────────────────────────────────────

export const successStories: SuccessStory[] = [
  {
    id: "ss-01",
    nameA: "Priya",
    nameB: "Rohan",
    cityA: "Mumbai",
    cityB: "Delhi",
    quoteEn:
      "Found my life partner in 3 months! The AI matching was incredibly accurate — we share the same values and life goals.",
    quoteHi:
      "3 महीने में अपना जीवन साथी मिल गया! AI मैचिंग बहुत सटीक था — हमारे मूल्य और लक्ष्य एक जैसे हैं।",
    matchedVia: "AI Compatibility Match",
    durationMonths: 3,
    verificationLevel: "gold",
  },
  {
    id: "ss-02",
    nameA: "Ananya",
    nameB: "Vikram",
    cityA: "Bangalore",
    cityB: "Bangalore",
    quoteEn:
      "We were in the same city all along! Bandhan AI connected us over shared love for hiking and South Indian cuisine.",
    quoteHi:
      "हम दोनों एक ही शहर में थे! Bandhan AI ने हमें हाइकिंग और दक्षिण भारतीय खाने के शौक से जोड़ा।",
    matchedVia: "Location + Interests",
    durationMonths: 2,
    verificationLevel: "silver",
  },
  {
    id: "ss-03",
    nameA: "Meera",
    nameB: "Arjun",
    cityA: "Jaipur",
    cityB: "Pune",
    quoteEn:
      "The voice note feature helped us feel connected before we even met. Now we're planning our wedding!",
    quoteHi:
      "वॉइस नोट फीचर ने हमें मिलने से पहले ही जुड़ा हुआ महसूस कराया। अब हम शादी की तैयारी कर रहे हैं!",
    matchedVia: "Values Alignment",
    durationMonths: 5,
    verificationLevel: "gold",
  },
  {
    id: "ss-04",
    nameA: "Sneha",
    nameB: "Karthik",
    cityA: "Chennai",
    cityB: "Hyderabad",
    quoteEn:
      "As a working professional, I had no time for traditional matchmaking. Bandhan AI's daily picks made it effortless.",
    quoteHi:
      "एक कामकाजी पेशेवर के रूप में, पारंपरिक मैचमेकिंग के लिए समय नहीं था। Bandhan AI के डेली पिक्स ने इसे आसान बना दिया।",
    matchedVia: "Daily Recommendation",
    durationMonths: 4,
    verificationLevel: "silver",
  },
  {
    id: "ss-05",
    nameA: "Ritu",
    nameB: "Sanjay",
    cityA: "Lucknow",
    cityB: "Lucknow",
    quoteEn:
      "My family was skeptical about online matchmaking, but the DigiLocker verification gave them confidence. Thank you Bandhan!",
    quoteHi:
      "मेरा परिवार ऑनलाइन मैचमेकिंग को लेकर संदेहशील था, लेकिन DigiLocker सत्यापन ने उन्हें विश्वास दिलाया।",
    matchedVia: "Family-Approved Match",
    durationMonths: 6,
    verificationLevel: "gold",
  },
  {
    id: "ss-06",
    nameA: "Divya",
    nameB: "Rahul",
    cityA: "Kolkata",
    cityB: "Mumbai",
    quoteEn:
      "The compatibility insights showed us exactly why we're a great match. It felt like the app truly understood us.",
    quoteHi: "कम्पैटिबिलिटी इनसाइट्स ने हमें बताया कि हम एक बेहतरीन मैच क्यों हैं।",
    matchedVia: "87% Compatibility Score",
    durationMonths: 3,
    verificationLevel: "silver",
  },
  {
    id: "ss-07",
    nameA: "Kavita",
    nameB: "Deepak",
    cityA: "Indore",
    cityB: "Bhopal",
    quoteEn:
      "We bonded over icebreaker questions about Indori poha vs Bhopali biryani. That one question started a lifetime conversation!",
    quoteHi:
      "इंदौरी पोहा vs भोपाली बिरयानी के icebreaker से हमारी बात शुरू हुई। उस एक सवाल से ज़िंदगी भर की बातचीत शुरू हो गई!",
    matchedVia: "Icebreaker Conversation",
    durationMonths: 4,
    verificationLevel: "silver",
  },
  {
    id: "ss-08",
    nameA: "Aisha",
    nameB: "Kunal",
    cityA: "Ahmedabad",
    cityB: "Surat",
    quoteEn:
      "Both our families were involved from the start. The family view feature let our parents feel comfortable too.",
    quoteHi:
      "शुरू से हमारे दोनों परिवार शामिल थे। फैमिली व्यू फीचर ने हमारे माता-पिता को भी सहज महसूस कराया।",
    matchedVia: "Family-First Match",
    durationMonths: 5,
    verificationLevel: "gold",
  },
  {
    id: "ss-09",
    nameA: "Nandini",
    nameB: "Varun",
    cityA: "Chandigarh",
    cityB: "Delhi",
    quoteEn:
      "I was nervous about meeting someone online, but the safety features gave me confidence. Now we're happily married!",
    quoteHi:
      "ऑनलाइन किसी से मिलने में डर लगता था, लेकिन सेफ्टी फीचर्स ने मुझे हिम्मत दी। अब हम खुशी-खुशी शादीशुदा हैं!",
    matchedVia: "Safe Matching",
    durationMonths: 7,
    verificationLevel: "gold",
  },
  {
    id: "ss-10",
    nameA: "Pooja",
    nameB: "Amit",
    cityA: "Ranchi",
    cityB: "Patna",
    quoteEn:
      "We're from small towns and were worried apps wouldn't work for us. Bandhan proved us wrong — location doesn't limit love!",
    quoteHi:
      "हम छोटे शहरों से हैं और सोचते थे कि ऐप हमारे लिए काम नहीं करेगा। Bandhan ने ग़लत साबित कर दिया — प्यार की कोई सीमा नहीं!",
    matchedVia: "Tier 2 City Match",
    durationMonths: 3,
    verificationLevel: "bronze",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Get a story to display, rotating by view count */
export function getRotatedStory(viewCount: number): SuccessStory {
  return successStories[viewCount % successStories.length];
}

/** Get a random story (avoids showing the same one consecutively) */
export function getRandomStory(excludeId?: string): SuccessStory {
  const filtered = excludeId
    ? successStories.filter((s) => s.id !== excludeId)
    : successStories;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/** Get stories by verification level */
export function getStoriesByLevel(level: "bronze" | "silver" | "gold"): SuccessStory[] {
  return successStories.filter((s) => s.verificationLevel === level);
}
