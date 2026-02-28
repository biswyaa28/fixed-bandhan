/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Firestore Seed Script
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Populates the Firestore emulator (or a dev project) with realistic demo
 * data for all 8 collections. Uses firebase-admin so it bypasses security
 * rules — exactly like Cloud Functions would.
 *
 * USAGE:
 *   # Start emulator first
 *   firebase emulators:start
 *
 *   # Then seed
 *   npx tsx lib/firebase/seed.ts
 *
 *   # Or add to package.json scripts:
 *   "seed": "npx tsx lib/firebase/seed.ts"
 *
 * ENVIRONMENT:
 *   Set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 to target the emulator.
 *   Without it, this script will write to the REAL project — be careful.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as admin from "firebase-admin";

// ─────────────────────────────────────────────────────────────────────────────
// Init Admin SDK (emulator-aware)
// ─────────────────────────────────────────────────────────────────────────────

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT ?? "bandhan-ai-dev",
  });
}

const db = admin.firestore();
const TS = admin.firestore.FieldValue.serverTimestamp();
const NOW = admin.firestore.Timestamp.now();

function hoursAgo(h: number): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromMillis(Date.now() - h * 3600_000);
}

function daysAgo(d: number): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromMillis(Date.now() - d * 86_400_000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. USERS
// ─────────────────────────────────────────────────────────────────────────────

const USERS: Record<string, Record<string, any>> = {
  demo_priya: {
    uid: "demo_priya",
    name: "Priya Sharma",
    email: "priya.demo@bandhan.ai",
    phone: "+919876543210",
    gender: "female",
    dateOfBirth: "1999-08-15",
    age: 26,
    bio: "Ambitious yet family-oriented. Love traveling, reading, and trying new cuisines. Looking for someone who values both career and family equally.",
    city: "Mumbai",
    state: "Maharashtra",
    height: '5\'4"',
    weight: "55 kg",
    education: "MBA, IIM Ahmedabad",
    occupation: "Product Manager at Google",
    annualIncome: 3500000,
    religion: "Hindu",
    caste: "Brahmin",
    gotra: "Bharadwaj",
    manglik: false,
    motherTongue: "Hindi",
    familyType: "nuclear",
    fatherOccupation: "Business Owner",
    motherOccupation: "Teacher",
    siblings: "1 younger brother (studying)",
    diet: "vegetarian",
    smoking: "never",
    drinking: "occasionally",
    intent: "marriage-soon",
    avatarUrl: "https://ui-avatars.com/api/?name=Priya+Sharma&background=FF9933&color=fff&size=256",
    photos: [
      { url: "https://ui-avatars.com/api/?name=Priya+Sharma&background=FF9933&color=fff&size=512", isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 26, max: 32 },
      locations: ["Mumbai", "Bangalore", "Delhi", "Pune"],
      diets: ["vegetarian", "eggetarian"],
      intents: ["marriage-soon", "serious-relationship"],
    },
    dealbreakers: {
      smoking: "non-negotiable",
      drinking: "okay-occasionally",
      diet: "strict-veg",
      familyValues: "flexible",
      relocation: "open-discuss",
    },
    privacy: {
      showOnlineStatus: true,
      showProfileVisits: true,
      showReadReceipts: true,
      showLastSeen: true,
      showDistance: true,
    },
    isVerified: true,
    verificationLevel: "gold",
    verifiedAt: daysAgo(30),
    isPremium: false,
    premiumExpiresAt: null,
    isOnline: true,
    lastSeenAt: NOW,
    profileCompletion: 95,
    reportCount: 0,
    blockedUserIds: [],
    isDeactivated: false,
    createdAt: daysAgo(60),
    updatedAt: NOW,
  },

  demo_rohan: {
    uid: "demo_rohan",
    name: "Rohan Verma",
    email: "rohan.demo@bandhan.ai",
    phone: "+919876543211",
    gender: "male",
    dateOfBirth: "1997-12-03",
    age: 28,
    bio: "Tech enthusiast with a passion for music and sports. Believe in traditional values with a modern outlook. Looking for a life partner who is understanding and supportive.",
    city: "New Delhi",
    state: "Delhi",
    height: '5\'10"',
    weight: "75 kg",
    education: "B.Tech, IIT Delhi",
    occupation: "Software Engineer at Microsoft",
    annualIncome: 2800000,
    religion: "Hindu",
    caste: "Khatri",
    gotra: "Kashyap",
    manglik: false,
    motherTongue: "Punjabi",
    familyType: "joint",
    fatherOccupation: "Government Officer",
    motherOccupation: "Homemaker",
    siblings: "1 elder sister (married)",
    diet: "non-vegetarian",
    smoking: "never",
    drinking: "occasionally",
    intent: "serious-relationship",
    avatarUrl: "https://ui-avatars.com/api/?name=Rohan+Verma&background=6366f1&color=fff&size=256",
    photos: [
      { url: "https://ui-avatars.com/api/?name=Rohan+Verma&background=6366f1&color=fff&size=512", isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 28 },
      locations: ["Delhi", "Bangalore", "Mumbai", "Chandigarh"],
      diets: ["vegetarian", "eggetarian", "non-vegetarian"],
      intents: ["marriage-soon", "serious-relationship"],
    },
    dealbreakers: {
      smoking: "non-negotiable",
      drinking: "okay-occasionally",
      diet: "dont-care",
      familyValues: "flexible",
      relocation: "open-discuss",
    },
    privacy: {
      showOnlineStatus: true,
      showProfileVisits: true,
      showReadReceipts: true,
      showLastSeen: true,
      showDistance: false,
    },
    isVerified: true,
    verificationLevel: "silver",
    verifiedAt: daysAgo(20),
    isPremium: true,
    premiumExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 90 * 86_400_000),
    isOnline: false,
    lastSeenAt: hoursAgo(2),
    profileCompletion: 88,
    reportCount: 0,
    blockedUserIds: [],
    isDeactivated: false,
    createdAt: daysAgo(45),
    updatedAt: hoursAgo(2),
  },

  demo_anjali: {
    uid: "demo_anjali",
    name: "Anjali Iyer",
    email: "anjali.demo@bandhan.ai",
    phone: "+919876543212",
    gender: "female",
    dateOfBirth: "2001-06-22",
    age: 24,
    bio: "Creative soul who loves art, dance, and exploring new places. Looking for genuine connections and meaningful friendships. Not in a hurry for marriage.",
    city: "Bangalore",
    state: "Karnataka",
    height: '5\'3"',
    weight: "50 kg",
    education: "B.Des, NID Bangalore",
    occupation: "UX Designer at Flipkart",
    annualIncome: 1800000,
    religion: "Hindu",
    caste: "Iyer",
    gotra: null,
    manglik: false,
    motherTongue: "Tamil",
    familyType: "nuclear",
    fatherOccupation: "Bank Manager",
    motherOccupation: "Doctor",
    siblings: "Only child",
    diet: "vegetarian",
    smoking: "never",
    drinking: "never",
    intent: "friendship",
    avatarUrl: "https://ui-avatars.com/api/?name=Anjali+Iyer&background=ec4899&color=fff&size=256",
    photos: [
      { url: "https://ui-avatars.com/api/?name=Anjali+Iyer&background=ec4899&color=fff&size=512", isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 30 },
      locations: ["Bangalore", "Chennai", "Hyderabad", "Pune"],
      diets: ["vegetarian"],
      intents: ["friendship", "serious-relationship"],
    },
    dealbreakers: {
      smoking: "non-negotiable",
      drinking: "non-negotiable",
      diet: "strict-veg",
      familyValues: "modern",
      relocation: "not-willing",
    },
    privacy: {
      showOnlineStatus: false,
      showProfileVisits: false,
      showReadReceipts: true,
      showLastSeen: false,
      showDistance: true,
    },
    isVerified: true,
    verificationLevel: "bronze",
    verifiedAt: daysAgo(10),
    isPremium: false,
    premiumExpiresAt: null,
    isOnline: true,
    lastSeenAt: NOW,
    profileCompletion: 72,
    reportCount: 0,
    blockedUserIds: [],
    isDeactivated: false,
    createdAt: daysAgo(15),
    updatedAt: hoursAgo(1),
  },

  demo_vikram: {
    uid: "demo_vikram",
    name: "Vikram Krishnan",
    email: "vikram.demo@bandhan.ai",
    phone: "+919876543213",
    gender: "male",
    dateOfBirth: "1995-11-10",
    age: 30,
    bio: "Family-oriented person with strong values. Love Carnatic music, cricket, and cooking. Looking for a life partner who shares similar values and interests.",
    city: "Chennai",
    state: "Tamil Nadu",
    height: '5\'9"',
    weight: "72 kg",
    education: "MS, IIT Madras",
    occupation: "Data Scientist at Amazon",
    annualIncome: 3200000,
    religion: "Hindu",
    caste: "Iyengar",
    gotra: "Bharadwaj",
    manglik: true,
    motherTongue: "Tamil",
    familyType: "joint",
    fatherOccupation: "Retired Professor",
    motherOccupation: "Classical Dancer",
    siblings: "1 younger brother (working)",
    diet: "vegetarian",
    smoking: "never",
    drinking: "never",
    intent: "marriage-soon",
    avatarUrl: "https://ui-avatars.com/api/?name=Vikram+Krishnan&background=10b981&color=fff&size=256",
    photos: [
      { url: "https://ui-avatars.com/api/?name=Vikram+Krishnan&background=10b981&color=fff&size=512", isPrimary: true },
    ],
    preferences: {
      ageRange: { min: 24, max: 28 },
      locations: ["Chennai", "Bangalore", "Hyderabad", "Mumbai"],
      diets: ["vegetarian", "jain"],
      intents: ["marriage-soon"],
    },
    dealbreakers: {
      smoking: "non-negotiable",
      drinking: "non-negotiable",
      diet: "strict-veg",
      familyValues: "traditional",
      relocation: "open-discuss",
    },
    privacy: {
      showOnlineStatus: true,
      showProfileVisits: true,
      showReadReceipts: true,
      showLastSeen: true,
      showDistance: true,
    },
    isVerified: true,
    verificationLevel: "gold",
    verifiedAt: daysAgo(40),
    isPremium: true,
    premiumExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 180 * 86_400_000),
    isOnline: false,
    lastSeenAt: hoursAgo(5),
    profileCompletion: 100,
    reportCount: 0,
    blockedUserIds: [],
    isDeactivated: false,
    createdAt: daysAgo(90),
    updatedAt: hoursAgo(5),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MATCHES
// ─────────────────────────────────────────────────────────────────────────────

const MATCHES: Record<string, Record<string, any>> = {
  match_priya_rohan: {
    userIds: ["demo_priya", "demo_rohan"],
    user1Id: "demo_priya",
    user2Id: "demo_rohan",
    status: "active",
    matchedAt: daysAgo(5),
    lastMessageAt: hoursAgo(3),
    lastMessagePreview: "That sounds great! When are you free this weekend?",
    lastMessageSenderId: "demo_rohan",
    unreadCount: { demo_priya: 1, demo_rohan: 0 },
    initiatorId: null,
    initiationDeadline: null,
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(3),
  },

  match_anjali_vikram: {
    userIds: ["demo_anjali", "demo_vikram"],
    user1Id: "demo_anjali",
    user2Id: "demo_vikram",
    status: "active",
    matchedAt: daysAgo(2),
    lastMessageAt: hoursAgo(8),
    lastMessagePreview: "I love Carnatic music too! Have you been to the December season?",
    lastMessageSenderId: "demo_anjali",
    unreadCount: { demo_anjali: 0, demo_vikram: 1 },
    initiatorId: null,
    initiationDeadline: null,
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(8),
  },

  match_priya_vikram: {
    userIds: ["demo_priya", "demo_vikram"],
    user1Id: "demo_priya",
    user2Id: "demo_vikram",
    status: "active",
    matchedAt: daysAgo(1),
    lastMessageAt: null,
    lastMessagePreview: null,
    lastMessageSenderId: null,
    unreadCount: { demo_priya: 0, demo_vikram: 0 },
    initiatorId: "demo_priya",
    initiationDeadline: admin.firestore.Timestamp.fromMillis(
      Date.now() - 1 * 86_400_000 + 48 * 3600_000,
    ),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

const MESSAGES: Record<string, Record<string, any>> = {
  msg_1: {
    matchId: "match_priya_rohan",
    senderId: "demo_priya",
    content: "Hi Rohan! I noticed we both love traveling. What was your most memorable trip?",
    type: "text",
    mediaUrl: null,
    mediaDurationSec: null,
    status: "read",
    readAt: daysAgo(4),
    replyToId: null,
    isDeleted: false,
    timestamp: daysAgo(5),
  },
  msg_2: {
    matchId: "match_priya_rohan",
    senderId: "demo_rohan",
    content: "Hey Priya! I went to Ladakh last year — the Pangong Lake was surreal. Have you been to the Northeast?",
    type: "text",
    mediaUrl: null,
    mediaDurationSec: null,
    status: "read",
    readAt: daysAgo(4),
    replyToId: null,
    isDeleted: false,
    timestamp: daysAgo(4),
  },
  msg_3: {
    matchId: "match_priya_rohan",
    senderId: "demo_priya",
    content: "Not yet, but Meghalaya is on my bucket list! The living root bridges look incredible.",
    type: "text",
    mediaUrl: null,
    mediaDurationSec: null,
    status: "read",
    readAt: daysAgo(3),
    replyToId: "msg_2",
    isDeleted: false,
    timestamp: daysAgo(3),
  },
  msg_4: {
    matchId: "match_priya_rohan",
    senderId: "demo_rohan",
    content: "That sounds great! When are you free this weekend?",
    type: "text",
    mediaUrl: null,
    mediaDurationSec: null,
    status: "delivered",
    readAt: null,
    replyToId: null,
    isDeleted: false,
    timestamp: hoursAgo(3),
  },
  msg_5: {
    matchId: "match_anjali_vikram",
    senderId: "demo_vikram",
    content: "Namaste Anjali! Your design portfolio is impressive. Flipkart must be exciting!",
    type: "text",
    mediaUrl: null,
    mediaDurationSec: null,
    status: "read",
    readAt: daysAgo(1),
    replyToId: null,
    isDeleted: false,
    timestamp: daysAgo(2),
  },
  msg_6: {
    matchId: "match_anjali_vikram",
    senderId: "demo_anjali",
    content: "I love Carnatic music too! Have you been to the December season?",
    type: "text",
    mediaUrl: null,
    mediaDurationSec: null,
    status: "delivered",
    readAt: null,
    replyToId: null,
    isDeleted: false,
    timestamp: hoursAgo(8),
  },
  msg_7: {
    matchId: "match_priya_rohan",
    senderId: "demo_priya",
    content: "",
    type: "voice",
    mediaUrl: "https://storage.example.com/voice/demo_voice_note.ogg",
    mediaDurationSec: 12,
    status: "read",
    readAt: daysAgo(2),
    replyToId: null,
    isDeleted: false,
    timestamp: daysAgo(2),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. INTERESTS
// ─────────────────────────────────────────────────────────────────────────────

const INTERESTS: Record<string, Record<string, any>> = {
  int_priya_rohan: {
    fromUserId: "demo_priya",
    toUserId: "demo_rohan",
    type: "like",
    comment: null,
    appreciatedElement: null,
    isMutual: true,
    isSeen: true,
    isSkipped: false,
    timestamp: daysAgo(6),
  },
  int_rohan_priya: {
    fromUserId: "demo_rohan",
    toUserId: "demo_priya",
    type: "special",
    comment: "Your IIM background is impressive — I'd love to chat!",
    appreciatedElement: "education",
    isMutual: true,
    isSeen: true,
    isSkipped: false,
    timestamp: daysAgo(5),
  },
  int_vikram_anjali: {
    fromUserId: "demo_vikram",
    toUserId: "demo_anjali",
    type: "like",
    comment: null,
    appreciatedElement: null,
    isMutual: true,
    isSeen: true,
    isSkipped: false,
    timestamp: daysAgo(3),
  },
  int_anjali_vikram: {
    fromUserId: "demo_anjali",
    toUserId: "demo_vikram",
    type: "like",
    comment: "Love your taste in Carnatic music!",
    appreciatedElement: "bio",
    isMutual: true,
    isSeen: true,
    isSkipped: false,
    timestamp: daysAgo(2),
  },
  int_priya_vikram: {
    fromUserId: "demo_priya",
    toUserId: "demo_vikram",
    type: "premium",
    comment: "Fellow vegetarian who cooks — yes please!",
    appreciatedElement: "diet",
    isMutual: true,
    isSeen: true,
    isSkipped: false,
    timestamp: daysAgo(1),
  },
  int_vikram_priya: {
    fromUserId: "demo_vikram",
    toUserId: "demo_priya",
    type: "like",
    comment: null,
    appreciatedElement: null,
    isMutual: true,
    isSeen: true,
    isSkipped: false,
    timestamp: daysAgo(1),
  },
  int_rohan_anjali_skip: {
    fromUserId: "demo_rohan",
    toUserId: "demo_anjali",
    type: "like",
    comment: null,
    appreciatedElement: null,
    isMutual: false,
    isSeen: false,
    isSkipped: false,
    timestamp: hoursAgo(12),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROFILE VISITS
// ─────────────────────────────────────────────────────────────────────────────

const PROFILE_VISITS: Record<string, Record<string, any>> = {
  visit_1: {
    visitorId: "demo_rohan",
    visitedUserId: "demo_priya",
    isHidden: false,
    durationSec: 45,
    timestamp: daysAgo(7),
  },
  visit_2: {
    visitorId: "demo_priya",
    visitedUserId: "demo_rohan",
    isHidden: false,
    durationSec: 30,
    timestamp: daysAgo(6),
  },
  visit_3: {
    visitorId: "demo_vikram",
    visitedUserId: "demo_priya",
    isHidden: false,
    durationSec: 60,
    timestamp: daysAgo(3),
  },
  visit_4: {
    visitorId: "demo_anjali",
    visitedUserId: "demo_vikram",
    isHidden: true,
    durationSec: 20,
    timestamp: daysAgo(4),
  },
  visit_5: {
    visitorId: "demo_priya",
    visitedUserId: "demo_anjali",
    isHidden: false,
    durationSec: 15,
    timestamp: hoursAgo(6),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATIONS: Record<string, Record<string, any>> = {
  notif_1: {
    userId: "demo_priya",
    type: "match",
    title: "New Match! 🎉",
    titleHi: "नया मैच! 🎉",
    message: "You matched with Rohan Verma! Start a conversation.",
    messageHi: "आपका Rohan Verma से मैच हुआ! बातचीत शुरू करें।",
    data: { matchId: "match_priya_rohan", userId: "demo_rohan" },
    targetId: "match_priya_rohan",
    isRead: true,
    groupCount: 1,
    createdAt: daysAgo(5),
  },
  notif_2: {
    userId: "demo_priya",
    type: "message",
    title: "New Message",
    titleHi: "नया संदेश",
    message: "Rohan: That sounds great! When are you free this weekend?",
    messageHi: "Rohan: बहुत अच्छा! इस वीकेंड कब फ्री हो?",
    data: { matchId: "match_priya_rohan", senderId: "demo_rohan" },
    targetId: "match_priya_rohan",
    isRead: false,
    groupCount: 1,
    createdAt: hoursAgo(3),
  },
  notif_3: {
    userId: "demo_priya",
    type: "like",
    title: "Someone liked your profile!",
    titleHi: "किसी ने आपकी प्रोफ़ाइल पसंद की!",
    message: "A new person showed interest in your profile.",
    messageHi: "एक नए व्यक्ति ने आपकी प्रोफ़ाइल में रुचि दिखाई।",
    data: null,
    targetId: null,
    isRead: false,
    groupCount: 3,
    createdAt: hoursAgo(12),
  },
  notif_4: {
    userId: "demo_vikram",
    type: "special",
    title: "Special Interest Received ⭐",
    titleHi: "विशेष रुचि प्राप्त ⭐",
    message: "Priya Sharma sent you a Premium Interest!",
    messageHi: "Priya Sharma ने आपको प्रीमियम रुचि भेजी!",
    data: { interestId: "int_priya_vikram", userId: "demo_priya" },
    targetId: "demo_priya",
    isRead: false,
    groupCount: 1,
    createdAt: daysAgo(1),
  },
  notif_5: {
    userId: "demo_rohan",
    type: "verification",
    title: "Verification Level Up! 🛡️",
    titleHi: "सत्यापन स्तर बढ़ा! 🛡️",
    message: "Congratulations! You're now Silver verified.",
    messageHi: "बधाई हो! अब आप सिल्वर सत्यापित हैं।",
    data: { level: "silver" },
    targetId: null,
    isRead: true,
    groupCount: 1,
    createdAt: daysAgo(20),
  },
  notif_6: {
    userId: "demo_anjali",
    type: "reminder",
    title: "Complete your profile",
    titleHi: "अपनी प्रोफ़ाइल पूरी करें",
    message: "Add 3 more photos to boost your visibility by 40%!",
    messageHi: "अपनी दृश्यता 40% बढ़ाने के लिए 3 और फ़ोटो जोड़ें!",
    data: { section: "photos" },
    targetId: null,
    isRead: false,
    groupCount: 1,
    createdAt: daysAgo(3),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. SUCCESS STORIES
// ─────────────────────────────────────────────────────────────────────────────

const SUCCESS_STORIES: Record<string, Record<string, any>> = {
  story_1: {
    userId1: "demo_priya",
    userId2: "demo_rohan",
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
    isApproved: true,
    isFeatured: true,
    submittedAt: daysAgo(10),
    approvedAt: daysAgo(8),
  },
  story_2: {
    userId1: "demo_anjali",
    userId2: "demo_vikram",
    nameA: "Anjali",
    nameB: "Vikram",
    cityA: "Bangalore",
    cityB: "Chennai",
    quoteEn:
      "We bonded over Carnatic music and South Indian culture. Bandhan understood what mattered to us beyond just job titles.",
    quoteHi:
      "कर्नाटक संगीत और दक्षिण भारतीय संस्कृति पर हमारा जुड़ाव हुआ। बंधन ने नौकरी से परे हमारी असली ज़रूरतें समझीं।",
    matchedVia: "Values + Culture Match",
    durationMonths: 2,
    verificationLevel: "silver",
    isApproved: true,
    isFeatured: false,
    submittedAt: daysAgo(5),
    approvedAt: daysAgo(3),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. REPORTS (one sample — Rohan flagged a suspicious profile earlier)
// ─────────────────────────────────────────────────────────────────────────────

const REPORTS: Record<string, Record<string, any>> = {
  report_1: {
    reporterId: "demo_rohan",
    reportedUserId: "fake_user_001",
    reason: "fake-profile",
    comment: "The photos look like stock images and the bio is copy-pasted from another app.",
    evidenceUrls: [],
    status: "pending",
    moderatorNotes: null,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Seed runner
// ─────────────────────────────────────────────────────────────────────────────

async function seedCollection(
  collectionName: string,
  data: Record<string, Record<string, any>>,
): Promise<void> {
  const batch = db.batch();
  let count = 0;

  for (const [docId, docData] of Object.entries(data)) {
    const ref = db.collection(collectionName).doc(docId);
    batch.set(ref, docData, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`  ✅ ${collectionName}: ${count} documents`);
}

async function main(): Promise<void> {
  const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" Bandhan AI — Firestore Seed");
  console.log(`  Target: ${isEmulator ? "EMULATOR (" + process.env.FIRESTORE_EMULATOR_HOST + ")" : "⚠️  PRODUCTION"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  if (!isEmulator) {
    console.warn("  ⚠️  WARNING: You are writing to a REAL Firestore database.");
    console.warn("  Set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 to use the emulator.");
    console.warn("  Continuing in 3 seconds...\n");
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("  Seeding collections...\n");

  await seedCollection("users", USERS);
  await seedCollection("matches", MATCHES);
  await seedCollection("messages", MESSAGES);
  await seedCollection("interests", INTERESTS);
  await seedCollection("profileVisits", PROFILE_VISITS);
  await seedCollection("notifications", NOTIFICATIONS);
  await seedCollection("successStories", SUCCESS_STORIES);
  await seedCollection("reports", REPORTS);

  console.log("");
  console.log("  ✅ All collections seeded successfully!");
  console.log("");
  console.log("  Demo accounts:");
  console.log("    Priya Sharma   — demo_priya   — +919876543210 — Gold verified");
  console.log("    Rohan Verma    — demo_rohan   — +919876543211 — Silver, Premium");
  console.log("    Anjali Iyer    — demo_anjali  — +919876543212 — Bronze");
  console.log("    Vikram Krishnan— demo_vikram  — +919876543213 — Gold, Premium");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  process.exit(0);
}

main().catch((err) => {
  console.error("\n  ❌ Seed failed:", err);
  process.exit(1);
});
