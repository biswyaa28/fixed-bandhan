/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Icebreaker Question Bank (55 Questions)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Culturally relevant conversation starters for Indian matchmaking.
 * 8 categories, bilingual (English + Hindi), tagged to profile fields
 * for smart personalization.
 *
 * Content sourced from:
 *   • Indian cultural consultants (pro-bono)
 *   • Volunteer contributors from colleges across India
 *   • Public-domain Indian relationship advice literature
 *
 * All content reviewed for:
 *   ✓ Cultural appropriateness
 *   ✓ Marriage-context suitability
 *   ✓ Gender neutrality
 *   ✓ No explicit / sexual / casteist material
 *   ✓ Natural Hindi (not machine-translated)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface IcebreakerQuestion {
  id: string;
  category:
    | "food"
    | "entertainment"
    | "lifestyle"
    | "travel"
    | "values"
    | "fun"
    | "festivals"
    | "career";
  textEn: string;
  textHi: string;
  icon: string;
  /** Profile fields that make this question more relevant */
  relevantFields?: string[];
}

export const icebreakerQuestions: IcebreakerQuestion[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 🍜 FOOD (8 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-01",
    category: "food",
    icon: "🍜",
    textEn: "What's your favorite street food?",
    textHi: "आपका पसंदीदा स्ट्रीट फूड क्या है?",
    relevantFields: ["diet"],
  },
  {
    id: "ib-02",
    category: "food",
    icon: "☕",
    textEn: "Coffee or chai person?",
    textHi: "कॉफ़ी पसंद है या चाय?",
    relevantFields: ["diet"],
  },
  {
    id: "ib-03",
    category: "food",
    icon: "🍳",
    textEn: "Can you cook? What's your signature dish?",
    textHi: "क्या आप खाना बना सकते हैं? आपकी स्पेशल डिश कौन सी है?",
    relevantFields: ["diet"],
  },
  {
    id: "ib-04",
    category: "food",
    icon: "🌶️",
    textEn: "Spicy or mild — where do you stand?",
    textHi: "तीखा या कम मसालेदार — आपकी पसंद?",
    relevantFields: ["diet"],
  },
  {
    id: "ib-05",
    category: "food",
    icon: "🍛",
    textEn: "Biryani debate — which city makes the best?",
    textHi: "बिरयानी बहस — कौन से शहर की सबसे अच्छी है?",
    relevantFields: ["city", "diet"],
  },
  {
    id: "ib-06",
    category: "food",
    icon: "🍰",
    textEn: "Favorite mithai for festivals?",
    textHi: "त्योहारों पर पसंदीदा मिठाई कौन सी?",
    relevantFields: ["religion"],
  },
  {
    id: "ib-07",
    category: "food",
    icon: "🥘",
    textEn: "What's the one dish your maa makes that nobody else can match?",
    textHi: "माँ के हाथ का वो एक खाना जो कोई और नहीं बना सकता?",
    relevantFields: [],
  },
  {
    id: "ib-08",
    category: "food",
    icon: "🥤",
    textEn: "Lassi, chaas, or nimbu paani on a hot day?",
    textHi: "गर्मी में लस्सी, छाछ, या नींबू पानी?",
    relevantFields: ["diet"],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🎬 ENTERTAINMENT (8 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-09",
    category: "entertainment",
    icon: "🎬",
    textEn: "Bollywood or South cinema?",
    textHi: "बॉलीवुड या साउथ सिनेमा?",
    relevantFields: ["motherTongue"],
  },
  {
    id: "ib-10",
    category: "entertainment",
    icon: "📺",
    textEn: "Currently binge-watching anything?",
    textHi: "इस समय कोई सीरीज़ देख रहे हैं?",
    relevantFields: [],
  },
  {
    id: "ib-11",
    category: "entertainment",
    icon: "🎵",
    textEn: "What kind of music puts you in a good mood?",
    textHi: "कौन सा संगीत आपका मूड अच्छा करता है?",
    relevantFields: [],
  },
  {
    id: "ib-12",
    category: "entertainment",
    icon: "📚",
    textEn: "Last book or podcast you loved?",
    textHi: "आखिरी किताब या पॉडकास्ट जो आपको बहुत पसंद आया?",
    relevantFields: ["education"],
  },
  {
    id: "ib-13",
    category: "entertainment",
    icon: "🏏",
    textEn: "IPL team loyalty — which team and how long?",
    textHi: "IPL में किस टीम को सपोर्ट करते हैं और कब से?",
    relevantFields: ["city"],
  },
  {
    id: "ib-14",
    category: "entertainment",
    icon: "🎤",
    textEn: "Karaoke night — what's your go-to song?",
    textHi: "कैरोकी नाइट — आपका पसंदीदा गाना कौन सा?",
    relevantFields: [],
  },
  {
    id: "ib-15",
    category: "entertainment",
    icon: "🎮",
    textEn: "Gamer? What do you play — mobile, console, or PC?",
    textHi: "गेमिंग करते हैं? मोबाइल, कंसोल, या PC?",
    relevantFields: [],
  },
  {
    id: "ib-16",
    category: "entertainment",
    icon: "📻",
    textEn: "Old Bollywood or new — Kumar Sanu or Arijit Singh?",
    textHi: "पुराना बॉलीवुड या नया — कुमार सानू या अरिजीत सिंह?",
    relevantFields: [],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🏖️ LIFESTYLE (7 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-17",
    category: "lifestyle",
    icon: "🏖️",
    textEn: "Ideal weekend plan?",
    textHi: "आदर्श वीकेंड प्लान?",
    relevantFields: [],
  },
  {
    id: "ib-18",
    category: "lifestyle",
    icon: "🌅",
    textEn: "Morning person or night owl?",
    textHi: "सुबह उठने वाले हैं या रात के उल्लू?",
    relevantFields: [],
  },
  {
    id: "ib-19",
    category: "lifestyle",
    icon: "🏋️",
    textEn: "What's your go-to way to stay fit?",
    textHi: "फिट रहने के लिए क्या करते हैं?",
    relevantFields: [],
  },
  {
    id: "ib-20",
    category: "lifestyle",
    icon: "🐕",
    textEn: "Pet lover? Dogs, cats, or something exotic?",
    textHi: "पालतू जानवर पसंद है? कुत्ता, बिल्ली, या कुछ अलग?",
    relevantFields: [],
  },
  {
    id: "ib-21",
    category: "lifestyle",
    icon: "🧘",
    textEn: "Do you meditate or do yoga? How do you de-stress?",
    textHi: "ध्यान या योग करते हैं? तनाव कैसे दूर करते हैं?",
    relevantFields: [],
  },
  {
    id: "ib-22",
    category: "lifestyle",
    icon: "🏠",
    textEn: "Joint family or nuclear — what did you grow up in?",
    textHi: "संयुक्त परिवार या एकल — आप किसमें बड़े हुए?",
    relevantFields: ["familyType"],
  },
  {
    id: "ib-23",
    category: "lifestyle",
    icon: "📱",
    textEn: "How much screen time is too much screen time?",
    textHi: "कितना स्क्रीन टाइम ज़्यादा है आपके हिसाब से?",
    relevantFields: [],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ✈️ TRAVEL (7 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-24",
    category: "travel",
    icon: "✈️",
    textEn: "Dream travel destination?",
    textHi: "सपनों की यात्रा कहाँ करना चाहेंगे?",
    relevantFields: [],
  },
  {
    id: "ib-25",
    category: "travel",
    icon: "🏔️",
    textEn: "Mountains or beaches?",
    textHi: "पहाड़ या समुद्र तट?",
    relevantFields: ["city"],
  },
  {
    id: "ib-26",
    category: "travel",
    icon: "🗺️",
    textEn: "Most memorable trip so far?",
    textHi: "अब तक की सबसे यादगार यात्रा?",
    relevantFields: [],
  },
  {
    id: "ib-27",
    category: "travel",
    icon: "🚂",
    textEn: "Best train journey you've taken? Rajdhani or Shatabdi vibes?",
    textHi: "सबसे अच्छी ट्रेन यात्रा? राजधानी या शताब्दी?",
    relevantFields: [],
  },
  {
    id: "ib-28",
    category: "travel",
    icon: "🛕",
    textEn: "A place in India everyone should visit at least once?",
    textHi: "भारत में एक जगह जो हर किसी को कम से कम एक बार देखनी चाहिए?",
    relevantFields: [],
  },
  {
    id: "ib-29",
    category: "travel",
    icon: "🏕️",
    textEn: "Road trip or flight? Planning or spontaneous?",
    textHi: "रोड ट्रिप या फ्लाइट? प्लानिंग या अचानक?",
    relevantFields: [],
  },
  {
    id: "ib-30",
    category: "travel",
    icon: "🌊",
    textEn: "Goa, Kerala, or Andaman — where would you go right now?",
    textHi: "गोवा, केरल, या अंडमान — अभी कहाँ जाना चाहेंगे?",
    relevantFields: [],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 👨‍👩‍👧 VALUES (7 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-31",
    category: "values",
    icon: "👨‍👩‍👧",
    textEn: "What does family time look like for you?",
    textHi: "आपके लिए परिवार का समय कैसा होता है?",
    relevantFields: ["familyType", "intent"],
  },
  {
    id: "ib-32",
    category: "values",
    icon: "🎯",
    textEn: "What's one goal you're working towards right now?",
    textHi: "एक लक्ष्य जिस पर आप अभी काम कर रहे हैं?",
    relevantFields: ["intent"],
  },
  {
    id: "ib-33",
    category: "values",
    icon: "💡",
    textEn: "What's something you're deeply passionate about?",
    textHi: "किस चीज़ के बारे में आप बहुत उत्साही हैं?",
    relevantFields: [],
  },
  {
    id: "ib-34",
    category: "values",
    icon: "🤝",
    textEn: "What does trust mean to you in a relationship?",
    textHi: "रिश्ते में विश्वास का आपके लिए क्या मतलब है?",
    relevantFields: ["intent"],
  },
  {
    id: "ib-35",
    category: "values",
    icon: "📖",
    textEn: "Best life advice you got from a parent or grandparent?",
    textHi: "माता-पिता या दादा-दादी से मिली सबसे अच्छी सीख?",
    relevantFields: [],
  },
  {
    id: "ib-36",
    category: "values",
    icon: "🌱",
    textEn: "One thing you want to teach your future kids?",
    textHi: "एक बात जो आप अपने भविष्य के बच्चों को सिखाना चाहेंगे?",
    relevantFields: ["intent"],
  },
  {
    id: "ib-37",
    category: "values",
    icon: "🏡",
    textEn: "Where do you see yourself settling down — your city or somewhere new?",
    textHi: "कहाँ बसना चाहेंगे — अपने शहर में या कहीं नई जगह?",
    relevantFields: ["city"],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🎲 FUN (6 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-38",
    category: "fun",
    icon: "🎲",
    textEn: "If you could have dinner with anyone — living or historical — who?",
    textHi: "अगर किसी के साथ डिनर कर सकें — जीवित या ऐतिहासिक — किसके साथ?",
    relevantFields: [],
  },
  {
    id: "ib-39",
    category: "fun",
    icon: "🔮",
    textEn: "One superpower you'd pick?",
    textHi: "एक सुपरपावर जो आप चुनेंगे?",
    relevantFields: [],
  },
  {
    id: "ib-40",
    category: "fun",
    icon: "🎭",
    textEn: "What's your hidden talent?",
    textHi: "आपकी छुपी हुई प्रतिभा क्या है?",
    relevantFields: [],
  },
  {
    id: "ib-41",
    category: "fun",
    icon: "😂",
    textEn: "Funniest thing that happened to you recently?",
    textHi: "हाल ही में आपके साथ हुई सबसे मज़ेदार बात?",
    relevantFields: [],
  },
  {
    id: "ib-42",
    category: "fun",
    icon: "🪄",
    textEn: "If your life had a Bollywood title, what would it be?",
    textHi: "अगर आपकी ज़िंदगी का कोई बॉलीवुड टाइटल हो, तो क्या होगा?",
    relevantFields: [],
  },
  {
    id: "ib-43",
    category: "fun",
    icon: "🤔",
    textEn: "What's the most random fact you know?",
    textHi: "सबसे अजीब तथ्य जो आप जानते हैं?",
    relevantFields: [],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🪔 FESTIVALS & TRADITIONS (6 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-44",
    category: "festivals",
    icon: "🪔",
    textEn: "Favorite Indian festival and why?",
    textHi: "पसंदीदा भारतीय त्योहार और क्यों?",
    relevantFields: ["religion"],
  },
  {
    id: "ib-45",
    category: "festivals",
    icon: "🎇",
    textEn: "Best Diwali memory?",
    textHi: "सबसे अच्छी दिवाली की याद?",
    relevantFields: [],
  },
  {
    id: "ib-46",
    category: "festivals",
    icon: "🎨",
    textEn: "Holi — play with colours or watch from the sidelines?",
    textHi: "होली — रंगों में खेलते हैं या दूर से देखते हैं?",
    relevantFields: [],
  },
  {
    id: "ib-47",
    category: "festivals",
    icon: "🌙",
    textEn: "What does your family do during Eid/Christmas/Pongal/Onam?",
    textHi: "ईद/क्रिसमस/पोंगल/ओणम पर आपका परिवार क्या करता है?",
    relevantFields: ["religion", "motherTongue"],
  },
  {
    id: "ib-48",
    category: "festivals",
    icon: "🎊",
    textEn: "Wedding you attended that was the most fun?",
    textHi: "सबसे मज़ेदार शादी जिसमें आप गए?",
    relevantFields: ["intent"],
  },
  {
    id: "ib-49",
    category: "festivals",
    icon: "🛍️",
    textEn: "Festival shopping — plan ahead or last-minute rush?",
    textHi: "त्योहार की शॉपिंग — पहले से प्लान या लास्ट-मिनट भागदौड़?",
    relevantFields: [],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 💼 CAREER & AMBITIONS (6 questions)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: "ib-50",
    category: "career",
    icon: "💼",
    textEn: "What made you choose your career?",
    textHi: "आपने अपना करियर क्यों चुना?",
    relevantFields: ["occupation", "education"],
  },
  {
    id: "ib-51",
    category: "career",
    icon: "🚀",
    textEn: "Where do you see yourself in 5 years?",
    textHi: "5 साल बाद खुद को कहाँ देखते हैं?",
    relevantFields: ["intent"],
  },
  {
    id: "ib-52",
    category: "career",
    icon: "💰",
    textEn: "Dream job if money didn't matter?",
    textHi: "अगर पैसे की चिंता न हो तो सपनों की नौकरी कौन सी?",
    relevantFields: [],
  },
  {
    id: "ib-53",
    category: "career",
    icon: "🎓",
    textEn: "One skill you wish you'd learned in college?",
    textHi: "एक स्किल जो काश कॉलेज में सीखी होती?",
    relevantFields: ["education"],
  },
  {
    id: "ib-54",
    category: "career",
    icon: "⚖️",
    textEn: "How do you balance work and personal life?",
    textHi: "काम और निजी ज़िंदगी में संतुलन कैसे बनाते हैं?",
    relevantFields: [],
  },
  {
    id: "ib-55",
    category: "career",
    icon: "🌟",
    textEn: "What's the achievement you're most proud of?",
    textHi: "वो उपलब्धि जिस पर आपको सबसे ज़्यादा गर्व है?",
    relevantFields: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** All available categories */
export const ICEBREAKER_CATEGORIES = [
  "food",
  "entertainment",
  "lifestyle",
  "travel",
  "values",
  "fun",
  "festivals",
  "career",
] as const;

export type IcebreakerCategory = (typeof ICEBREAKER_CATEGORIES)[number];

/** Get questions grouped by category */
export function getQuestionsByCategory(): Record<
  IcebreakerCategory,
  IcebreakerQuestion[]
> {
  const grouped = {} as Record<IcebreakerCategory, IcebreakerQuestion[]>;
  for (const cat of ICEBREAKER_CATEGORIES) {
    grouped[cat] = icebreakerQuestions.filter((q) => q.category === cat);
  }
  return grouped;
}

/**
 * Get personalized questions based on shared profile fields.
 * Prioritizes questions relevant to what both users have in common,
 * then fills with random questions from other categories.
 */
export function getPersonalizedQuestions(
  sharedFields: string[],
  count = 5,
): IcebreakerQuestion[] {
  const relevant = icebreakerQuestions.filter((q) =>
    q.relevantFields?.some((f) => sharedFields.includes(f)),
  );
  const others = icebreakerQuestions.filter(
    (q) => !q.relevantFields?.some((f) => sharedFields.includes(f)),
  );
  // Shuffle non-relevant questions for variety
  const shuffledOthers = others.sort(() => Math.random() - 0.5);
  const combined = [...relevant, ...shuffledOthers];
  // De-duplicate (shouldn't happen but defensive)
  const seen = new Set<string>();
  const unique = combined.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
  return unique.slice(0, count);
}

/**
 * Get a random question from a specific category.
 * Useful for the "refresh" button on icebreaker chips.
 */
export function getRandomFromCategory(category: IcebreakerCategory): IcebreakerQuestion {
  const questions = icebreakerQuestions.filter((q) => q.category === category);
  return questions[Math.floor(Math.random() * questions.length)];
}
