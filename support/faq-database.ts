/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — FAQ Knowledge Base
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Bilingual FAQ entries (English + Hindi).
 * Used by: FAQ page, AI chatbot, support search.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface FAQEntry {
  id: string;
  category: string;
  question: string;
  questionHi: string;
  answer: string;
  answerHi: string;
  keywords: string[];
}

export const FAQ_CATEGORIES = [
  "Getting Started",
  "Account & Profile",
  "Matching & Likes",
  "Chat & Communication",
  "Safety & Privacy",
  "Premium & Billing",
  "Verification",
  "Technical Issues",
] as const;

export const FAQ_DATABASE: FAQEntry[] = [
  // ─── Getting Started ────────────────────────────────────────────────
  {
    id: "gs-1",
    category: "Getting Started",
    question: "How do I create an account?",
    questionHi: "मैं अकाउंट कैसे बनाऊं?",
    answer: "Download Bandhan AI from the App Store or Play Store. Tap 'Get Started', enter your phone number, verify with OTP, and complete your profile. The whole process takes about 3 minutes.",
    answerHi: "App Store या Play Store से Bandhan AI डाउनलोड करें। 'शुरू करें' पर टैप करें, अपना फ़ोन नंबर दर्ज करें, OTP से सत्यापित करें, और अपनी प्रोफ़ाइल पूरी करें। पूरी प्रक्रिया में लगभग 3 मिनट लगते हैं।",
    keywords: ["signup", "register", "create", "new", "account", "start"],
  },
  {
    id: "gs-2",
    category: "Getting Started",
    question: "Is Bandhan AI free to use?",
    questionHi: "क्या Bandhan AI मुफ़्त है?",
    answer: "Yes! The free plan includes 5 profile views per day, 2 new conversations per day, basic filters, and all safety features. Premium (₹499/month) unlocks unlimited access with a 7-day free trial.",
    answerHi: "हाँ! मुफ़्त प्लान में प्रतिदिन 5 प्रोफ़ाइल व्यू, 2 नई बातचीत, बुनियादी फ़िल्टर और सभी सुरक्षा सुविधाएं शामिल हैं। प्रीमियम (₹499/माह) 7-दिन के फ्री ट्रायल के साथ असीमित एक्सेस देता है।",
    keywords: ["free", "cost", "price", "pay", "premium", "money"],
  },
  {
    id: "gs-3",
    category: "Getting Started",
    question: "What age group is this app for?",
    questionHi: "यह ऐप किस आयु वर्ग के लिए है?",
    answer: "Bandhan AI is for adults aged 18 and above who are interested in serious relationships and marriage. You must be 18+ to create an account.",
    answerHi: "Bandhan AI 18 वर्ष और उससे अधिक उम्र के वयस्कों के लिए है जो गंभीर संबंधों और विवाह में रुचि रखते हैं। अकाउंट बनाने के लिए आपकी उम्र 18+ होनी चाहिए।",
    keywords: ["age", "minimum", "18", "young", "old"],
  },

  // ─── Account & Profile ──────────────────────────────────────────────
  {
    id: "ap-1",
    category: "Account & Profile",
    question: "How do I edit my profile?",
    questionHi: "मैं अपनी प्रोफ़ाइल कैसे बदलूं?",
    answer: "Go to Profile tab → tap 'Edit Profile'. You can update your photos, bio, life details, values, and prompts at any time. Changes are saved automatically.",
    answerHi: "प्रोफ़ाइल टैब पर जाएं → 'प्रोफ़ाइल संपादित करें' पर टैप करें। आप कभी भी अपने फ़ोटो, बायो, जीवन विवरण और मूल्य अपडेट कर सकते हैं। परिवर्तन अपने आप सेव होते हैं।",
    keywords: ["edit", "change", "update", "profile", "bio", "photo"],
  },
  {
    id: "ap-2",
    category: "Account & Profile",
    question: "How do I delete my account?",
    questionHi: "मैं अपना अकाउंट कैसे हटाऊं?",
    answer: "Go to Settings → Account → Delete Account. You'll be asked to confirm. All your data will be permanently deleted within 30 days as per DPDP Act requirements. This action cannot be undone.",
    answerHi: "सेटिंग्स → अकाउंट → अकाउंट हटाएं पर जाएं। आपसे पुष्टि मांगी जाएगी। DPDP अधिनियम के अनुसार 30 दिनों के भीतर आपका सारा डेटा स्थायी रूप से हटा दिया जाएगा।",
    keywords: ["delete", "remove", "deactivate", "account", "data"],
  },

  // ─── Matching & Likes ───────────────────────────────────────────────
  {
    id: "ml-1",
    category: "Matching & Likes",
    question: "How does the matching algorithm work?",
    questionHi: "मैचिंग एल्गोरिद्म कैसे काम करता है?",
    answer: "Our AI scores compatibility on 5 factors: Intent alignment (35%), shared values (25%), lifestyle match (20%), location proximity (12%), and family compatibility (8%). You'll see a percentage score on each profile.",
    answerHi: "हमारा AI 5 कारकों पर अनुकूलता स्कोर करता है: इरादे का मिलान (35%), साझा मूल्य (25%), जीवनशैली (20%), स्थान (12%), और पारिवारिक अनुकूलता (8%)।",
    keywords: ["algorithm", "match", "compatibility", "score", "how", "work"],
  },
  {
    id: "ml-2",
    category: "Matching & Likes",
    question: "What is the daily profile limit?",
    questionHi: "दैनिक प्रोफ़ाइल सीमा क्या है?",
    answer: "Free users can view 5 profiles per day and start 2 new conversations. Premium users have unlimited access. Limits reset at midnight IST.",
    answerHi: "मुफ़्त उपयोगकर्ता प्रतिदिन 5 प्रोफ़ाइल देख सकते हैं और 2 नई बातचीत शुरू कर सकते हैं। प्रीमियम के लिए कोई सीमा नहीं। सीमा रात 12 बजे IST पर रीसेट होती है।",
    keywords: ["limit", "daily", "profile", "view", "how many"],
  },

  // ─── Chat & Communication ──────────────────────────────────────────
  {
    id: "cc-1",
    category: "Chat & Communication",
    question: "How do voice notes work?",
    questionHi: "वॉइस नोट कैसे काम करता है?",
    answer: "In any chat, tap the microphone icon to record a voice note (max 15 seconds). You can preview and re-record before sending. Voice notes help you connect more personally than text.",
    answerHi: "किसी भी चैट में, वॉइस नोट रिकॉर्ड करने के लिए माइक्रोफ़ोन आइकन पर टैप करें (अधिकतम 15 सेकंड)। भेजने से पहले आप सुन और दोबारा रिकॉर्ड कर सकते हैं।",
    keywords: ["voice", "note", "audio", "record", "microphone"],
  },

  // ─── Safety & Privacy ──────────────────────────────────────────────
  {
    id: "sp-1",
    category: "Safety & Privacy",
    question: "How does the safety button work?",
    questionHi: "सुरक्षा बटन कैसे काम करता है?",
    answer: "The red shield button in chat sends your live location to a trusted contact via SMS for 2 hours. Your contact receives a message: '[Name] is sharing their location with you from Bandhan AI.' You can stop sharing at any time.",
    answerHi: "चैट में लाल शील्ड बटन आपका लाइव लोकेशन 2 घंटे के लिए SMS से एक विश्वसनीय संपर्क को भेजता है। आप कभी भी शेयरिंग बंद कर सकते हैं।",
    keywords: ["safety", "button", "emergency", "location", "share", "date"],
  },
  {
    id: "sp-2",
    category: "Safety & Privacy",
    question: "Can I see who viewed my profile?",
    questionHi: "क्या मैं देख सकता हूँ कि मेरी प्रोफ़ाइल किसने देखी?",
    answer: "Yes! Go to Profile → Visitors to see who viewed your profile. Photos are blurred until you match. You can hide your own visits in Settings → Privacy → Hide Profile Visits.",
    answerHi: "हाँ! प्रोफ़ाइल → विज़िटर पर जाएं। फ़ोटो मैच तक ब्लर रहती हैं। आप सेटिंग्स → गोपनीयता में अपनी विज़िट छिपा सकते हैं।",
    keywords: ["view", "visit", "who", "seen", "profile", "visitor"],
  },
  {
    id: "sp-3",
    category: "Safety & Privacy",
    question: "How do I report or block someone?",
    questionHi: "मैं किसी को रिपोर्ट या ब्लॉक कैसे करूं?",
    answer: "Open their profile → tap the three-dot menu (top right) → choose 'Report' or 'Block'. Reports are reviewed by our moderation team within 24 hours. Blocked users cannot see your profile or message you.",
    answerHi: "उनकी प्रोफ़ाइल खोलें → तीन-डॉट मेन्यू (ऊपर दाएं) पर टैप करें → 'रिपोर्ट' या 'ब्लॉक' चुनें। रिपोर्ट 24 घंटे में समीक्षा की जाती है।",
    keywords: ["report", "block", "abuse", "harassment", "fake", "spam"],
  },

  // ─── Premium & Billing ─────────────────────────────────────────────
  {
    id: "pb-1",
    category: "Premium & Billing",
    question: "How do I cancel my subscription?",
    questionHi: "मैं सब्सक्रिप्शन कैसे रद्द करूं?",
    answer: "Go to Settings → Premium → Manage Subscription → Cancel. Your access continues until the end of the billing period. No questions asked, no cancellation fees. You can also cancel through your App Store or Play Store settings.",
    answerHi: "सेटिंग्स → प्रीमियम → सब्सक्रिप्शन प्रबंधित करें → रद्द करें पर जाएं। बिलिंग अवधि के अंत तक एक्सेस जारी रहता है। कोई सवाल नहीं, कोई शुल्क नहीं।",
    keywords: ["cancel", "subscription", "unsubscribe", "stop", "payment"],
  },
  {
    id: "pb-2",
    category: "Premium & Billing",
    question: "What payment methods do you accept?",
    questionHi: "आप कौन से भुगतान तरीके स्वीकार करते हैं?",
    answer: "We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), and net banking. UPI is the fastest and recommended method. All prices include GST.",
    answerHi: "हम UPI (Google Pay, PhonePe, Paytm), क्रेडिट/डेबिट कार्ड (Visa, Mastercard, RuPay), और नेट बैंकिंग स्वीकार करते हैं। सभी कीमतों में GST शामिल है।",
    keywords: ["payment", "UPI", "card", "pay", "method", "billing"],
  },

  // ─── Verification ──────────────────────────────────────────────────
  {
    id: "vf-1",
    category: "Verification",
    question: "What are the verification levels?",
    questionHi: "सत्यापन के स्तर क्या हैं?",
    answer: "Bronze: Phone number verified. Silver: Aadhaar verified through DigiLocker. Gold: Photo verification + government ID match. Higher verification levels get more matches and trust badges on your profile.",
    answerHi: "ब्रॉन्ज़: फ़ोन नंबर सत्यापित। सिल्वर: DigiLocker से आधार सत्यापित। गोल्ड: फ़ोटो + सरकारी ID मैच। उच्च सत्यापन से अधिक मैच और ट्रस्ट बैज मिलते हैं।",
    keywords: ["verification", "verify", "bronze", "silver", "gold", "DigiLocker", "Aadhaar"],
  },

  // ─── Technical Issues ──────────────────────────────────────────────
  {
    id: "ti-1",
    category: "Technical Issues",
    question: "The app is slow or not loading. What should I do?",
    questionHi: "ऐप धीमा है या लोड नहीं हो रहा। क्या करूं?",
    answer: "Try these steps: 1) Check your internet connection. 2) Close and reopen the app. 3) Clear the app cache (Settings → Apps → Bandhan AI → Clear Cache). 4) Update to the latest version. 5) If the issue persists, contact support@bandhan.ai.",
    answerHi: "ये कदम आज़माएं: 1) इंटरनेट कनेक्शन जाँचें। 2) ऐप बंद करके दोबारा खोलें। 3) ऐप कैश साफ़ करें। 4) नवीनतम संस्करण में अपडेट करें। 5) समस्या बनी रहे तो support@bandhan.ai पर संपर्क करें।",
    keywords: ["slow", "loading", "crash", "error", "not working", "bug"],
  },
];

/**
 * Search FAQs by keyword (simple text match).
 */
export function searchFAQ(query: string): FAQEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return FAQ_DATABASE.filter(
    (faq) =>
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.keywords.some((k) => k.includes(q)),
  );
}

/**
 * Get FAQs by category.
 */
export function getFAQsByCategory(category: string): FAQEntry[] {
  return FAQ_DATABASE.filter((faq) => faq.category === category);
}
