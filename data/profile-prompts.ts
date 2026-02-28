/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Prompts (24 Indian-Context Life Story Questions)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 6 categories × 4 prompts each. Users must answer at least 3 to complete
 * their profile. Each prompt supports text, voice (15s), and optional photo.
 *
 * Design principles:
 *   • Reveal personality — not just "interests"
 *   • Indian marriage context — family, values, life goals
 *   • Gender-neutral — same prompts for all genders
 *   • Conversation-starting — answers should spark messages
 *   • Placeholder text feels natural and relatable
 *   • Hindi translations read naturally (not word-for-word)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ProfilePrompt {
  id: string;
  category: "personality" | "family" | "lifestyle" | "values" | "future" | "fun";
  textEn: string;
  textHi: string;
  placeholder: string;
  placeholderHi: string;
  maxLength: number;
  allowVoice: boolean;
  allowPhoto: boolean;
}

export const profilePrompts: ProfilePrompt[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 🌟 PERSONALITY (4 prompts)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "pp-01",
    category: "personality",
    textEn: "The most spontaneous thing I've done...",
    textHi: "मैंने अब तक सबसे अचानक जो काम किया...",
    placeholder: "That time I booked a one-way ticket to Ladakh...",
    placeholderHi: "जब मैंने लद्दाख की वन-वे टिकट बुक कर ली...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: true,
  },
  {
    id: "pp-02",
    category: "personality",
    textEn: "My ideal weekend involves...",
    textHi: "मेरे आदर्श वीकेंड में शामिल है...",
    placeholder: "Morning chai on the balcony, then a long drive...",
    placeholderHi: "बालकनी पर सुबह की चाय, फिर एक लंबी ड्राइव...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: true,
  },
  {
    id: "pp-03",
    category: "personality",
    textEn: "I geek out on...",
    textHi: "मुझे इसमें बहुत मज़ा आता है...",
    placeholder: "History podcasts, cricket stats, street food tours...",
    placeholderHi: "इतिहास पॉडकास्ट, क्रिकेट स्टैट्स, स्ट्रीट फूड...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-04",
    category: "personality",
    textEn: "People are usually surprised to learn that I...",
    textHi: "लोगों को आमतौर पर हैरानी होती है कि मैं...",
    placeholder: "Can play the tabla, or that I once ran a marathon...",
    placeholderHi: "तबला बजा लेता हूँ, या मैंने एक बार मैराथन दौड़ी...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: true,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 👨‍👩‍👧 FAMILY (4 prompts)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "pp-05",
    category: "family",
    textEn: "My family would describe me as...",
    textHi: "मेरा परिवार मुझे बताएगा कि मैं...",
    placeholder: "The one who always cracks jokes at dinner...",
    placeholderHi: "जो डिनर पर हमेशा मज़ाक करता है...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-06",
    category: "family",
    textEn: "My favorite family tradition is...",
    textHi: "मेरी पसंदीदा पारिवारिक परंपरा है...",
    placeholder: "Sunday brunch at Nani's house, Diwali card games...",
    placeholderHi: "नानी के घर रविवार का ब्रंच, दिवाली के ताश...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: true,
  },
  {
    id: "pp-07",
    category: "family",
    textEn: "The best thing I learned from my parents...",
    textHi: "माता-पिता से सीखी सबसे अच्छी बात...",
    placeholder: "Always keep your word, no matter what...",
    placeholderHi: "अपनी बात हमेशा पूरी करो, चाहे कुछ भी हो...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-08",
    category: "family",
    textEn: "A family trip I'll never forget...",
    textHi: "एक पारिवारिक यात्रा जो मैं कभी नहीं भूलूँगा/भूलूँगी...",
    placeholder: "When we all went to Shimla and Papa got lost...",
    placeholderHi: "जब हम सब शिमला गए और पापा रास्ता भूल गए...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: true,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🧘 LIFESTYLE (4 prompts)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "pp-09",
    category: "lifestyle",
    textEn: "A typical day in my life looks like...",
    textHi: "मेरी ज़िंदगी का एक आम दिन ऐसा दिखता है...",
    placeholder: "6am yoga, 9-6 at work, evening walk, Netflix...",
    placeholderHi: "सुबह 6 बजे योग, 9-6 काम, शाम की सैर...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-10",
    category: "lifestyle",
    textEn: "My comfort food is...",
    textHi: "मेरा कम्फर्ट फूड है...",
    placeholder: "Maa ki dal chawal, a good masala dosa...",
    placeholderHi: "माँ की दाल चावल, एक अच्छी मसाला डोसा...",
    maxLength: 200,
    allowVoice: false,
    allowPhoto: true,
  },
  {
    id: "pp-11",
    category: "lifestyle",
    textEn: "On a Sunday morning you'll find me...",
    textHi: "रविवार की सुबह मैं मिलूँगा/मिलूँगी...",
    placeholder: "At the local sabzi mandi, or sleeping till noon...",
    placeholderHi: "सब्ज़ी मंडी में, या दोपहर तक सोते हुए...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: true,
  },
  {
    id: "pp-12",
    category: "lifestyle",
    textEn: "One habit I'm trying to build...",
    textHi: "एक आदत जो मैं बनाने की कोशिश कर रहा/रही हूँ...",
    placeholder: "Reading 20 pages a day, waking up before 6...",
    placeholderHi: "रोज़ 20 पेज पढ़ना, 6 बजे से पहले उठना...",
    maxLength: 200,
    allowVoice: true,
    allowPhoto: false,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🤝 VALUES (4 prompts)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "pp-13",
    category: "values",
    textEn: "Looking for a partner who...",
    textHi: "एक ऐसे साथी की तलाश है जो...",
    placeholder: "Values honesty, loves family, has ambition...",
    placeholderHi: "ईमानदारी को महत्व देता हो, परिवार से प्यार करता हो...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-14",
    category: "values",
    textEn: "My non-negotiables in life are...",
    textHi: "मेरे जीवन में अटल बातें हैं...",
    placeholder: "Respect for elders, career growth, honesty...",
    placeholderHi: "बड़ों का सम्मान, करियर ग्रोथ, ईमानदारी...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-15",
    category: "values",
    textEn: "I believe relationships work when...",
    textHi: "मुझे लगता है रिश्ते तब काम करते हैं जब...",
    placeholder: "Both partners communicate openly and respect...",
    placeholderHi: "दोनों साथी खुलकर बात करें और सम्मान...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-16",
    category: "values",
    textEn: "Something I feel strongly about...",
    textHi: "एक बात जिसके बारे में मेरी मज़बूत राय है...",
    placeholder: "Education for all, environmental sustainability...",
    placeholderHi: "सभी के लिए शिक्षा, पर्यावरण की रक्षा...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🔮 FUTURE (4 prompts)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "pp-17",
    category: "future",
    textEn: "In 5 years I hope to...",
    textHi: "5 साल बाद मुझे उम्मीद है कि...",
    placeholder: "Start my own business, travel to Japan, settle down...",
    placeholderHi: "अपना बिज़नेस शुरू करूँ, जापान जाऊँ, बस जाऊँ...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-18",
    category: "future",
    textEn: "My dream home would be...",
    textHi: "मेरा सपनों का घर होगा...",
    placeholder: "A house with a garden in the hills, or a flat in South Mumbai...",
    placeholderHi: "पहाड़ों में बगीचे वाला घर, या साउथ मुंबई में फ्लैट...",
    maxLength: 250,
    allowVoice: false,
    allowPhoto: true,
  },
  {
    id: "pp-19",
    category: "future",
    textEn: "One thing on my bucket list...",
    textHi: "बकेट लिस्ट में एक चीज़...",
    placeholder: "See the Northern Lights, learn pottery, run a marathon...",
    placeholderHi: "नॉर्दर्न लाइट्स देखना, मिट्टी के बर्तन बनाना...",
    maxLength: 200,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-20",
    category: "future",
    textEn: "Together with my partner, I want to...",
    textHi: "अपने साथी के साथ मिलकर मैं चाहता/चाहती हूँ...",
    placeholder: "Build a home, travel the world, grow old laughing...",
    placeholderHi: "एक घर बनाना, दुनिया घूमना, हँसते-हँसते बूढ़े होना...",
    maxLength: 250,
    allowVoice: true,
    allowPhoto: false,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🎭 FUN (4 prompts)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "pp-21",
    category: "fun",
    textEn: "My hidden talent is...",
    textHi: "मेरी छुपी हुई प्रतिभा है...",
    placeholder: "I can cook restaurant-level butter chicken...",
    placeholderHi: "मैं रेस्तरां जैसा बटर चिकन बना सकता हूँ...",
    maxLength: 200,
    allowVoice: true,
    allowPhoto: true,
  },
  {
    id: "pp-22",
    category: "fun",
    textEn: "Unpopular opinion I'll defend...",
    textHi: "एक अलोकप्रिय राय जिसका मैं बचाव करूँगा...",
    placeholder: "Pineapple on pizza is actually good...",
    placeholderHi: "पिज़्ज़ा पर अनानास वास्तव में अच्छा है...",
    maxLength: 200,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-23",
    category: "fun",
    textEn: "The way to my heart is...",
    textHi: "मेरे दिल तक पहुँचने का रास्ता है...",
    placeholder: "Good food, bad puns, and an old Hindi playlist...",
    placeholderHi: "अच्छा खाना, बुरे PJ, और पुराने हिंदी गाने...",
    maxLength: 200,
    allowVoice: true,
    allowPhoto: false,
  },
  {
    id: "pp-24",
    category: "fun",
    textEn: "My most used emoji is...",
    textHi: "मेरा सबसे ज़्यादा इस्तेमाल किया जाने वाला इमोजी...",
    placeholder: "😂 because I laugh at my own jokes...",
    placeholderHi: "😂 क्योंकि मैं अपने ही जोक्स पर हँसता/हँसती हूँ...",
    maxLength: 150,
    allowVoice: false,
    allowPhoto: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const PROMPT_CATEGORIES = [
  "personality",
  "family",
  "lifestyle",
  "values",
  "future",
  "fun",
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<PromptCategory, { en: string; hi: string }> = {
  personality: { en: "Personality", hi: "व्यक्तित्व" },
  family: { en: "Family", hi: "परिवार" },
  lifestyle: { en: "Lifestyle", hi: "जीवनशैली" },
  values: { en: "Values", hi: "मूल्य" },
  future: { en: "Future", hi: "भविष्य" },
  fun: { en: "Fun", hi: "मज़ेदार" },
};

/** Get prompts grouped by category */
export function getPromptsByCategory(): Record<PromptCategory, ProfilePrompt[]> {
  const grouped = {} as Record<PromptCategory, ProfilePrompt[]>;
  for (const cat of PROMPT_CATEGORIES) {
    grouped[cat] = profilePrompts.filter((p) => p.category === cat);
  }
  return grouped;
}

/**
 * Get random prompts for onboarding — 1 per category, capped at count.
 * Ensures the user sees a variety of categories.
 */
export function getOnboardingPrompts(count = 5): ProfilePrompt[] {
  const byCategory = getPromptsByCategory();
  const result: ProfilePrompt[] = [];
  for (const cat of PROMPT_CATEGORIES) {
    const items = byCategory[cat];
    result.push(items[Math.floor(Math.random() * items.length)]);
    if (result.length >= count) break;
  }
  return result;
}

/**
 * Get prompts the user hasn't answered yet.
 * `answeredIds` = IDs the user already filled in.
 */
export function getUnansweredPrompts(answeredIds: string[]): ProfilePrompt[] {
  const answered = new Set(answeredIds);
  return profilePrompts.filter((p) => !answered.has(p.id));
}
