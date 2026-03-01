/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Matches & Likes Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: /matches
 *
 * Two-tab view:
 *   Tab 1 – Matches: New (horizontal), Active (vertical), Past (collapsed)
 *   Tab 2 – Likes Received: Special, Premium, Regular interest cards
 *
 * Uses the AppShell (AppBar + BottomNav) from root layout.
 * Comic-book aesthetic throughout.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect } from "react";

import { type MatchesTabId, MatchesTabs } from "@/components/matches/MatchesTabs";
import { type MatchProfile, ActiveMatches } from "@/components/matches/ActiveMatches";
import { type LikeProfile, LikesReceived } from "@/components/matches/LikesReceived";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — Matches
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_MATCHES: MatchProfile[] = [
  // ── New (last 7 days) ──
  {
    id: "m1",
    name: "Priya Sharma",
    age: 26,
    city: "Mumbai",
    initials: "PS",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
    verificationLevel: "gold",
    compatibility: 92,
    matchedDate: "Today",
    matchedDaysAgo: 0,
    lastMessage: "Hi! Loved your profile 😊",
    lastMessageTime: "2m",
    unread: 1,
    isOnline: true,
    status: "new",
  },
  {
    id: "m2",
    name: "Sneha Patel",
    age: 25,
    city: "Ahmedabad",
    initials: "SP",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    verificationLevel: "gold",
    compatibility: 88,
    matchedDate: "2 days ago",
    matchedDaysAgo: 2,
    isOnline: true,
    status: "new",
  },
  {
    id: "m3",
    name: "Kavya Nair",
    age: 24,
    city: "Kochi",
    initials: "KN",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
    verificationLevel: "silver",
    compatibility: 85,
    matchedDate: "5 days ago",
    matchedDaysAgo: 5,
    status: "new",
  },

  // ── Active ──
  {
    id: "m4",
    name: "Ananya Iyer",
    age: 27,
    city: "Chennai",
    initials: "AI",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
    verificationLevel: "silver",
    compatibility: 87,
    matchedDate: "2 weeks ago",
    matchedDaysAgo: 14,
    lastMessage: "Would love to know more about your family values",
    lastMessageTime: "5h",
    isOnline: false,
    status: "active",
  },
  {
    id: "m5",
    name: "Riya Gupta",
    age: 26,
    city: "Delhi",
    initials: "RG",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
    verificationLevel: "silver",
    compatibility: 82,
    matchedDate: "3 weeks ago",
    matchedDaysAgo: 21,
    lastMessage: "That's so interesting! Tell me more about Jaipur",
    lastMessageTime: "2d",
    isOnline: false,
    status: "active",
  },
  {
    id: "m6",
    name: "Megha Reddy",
    age: 25,
    city: "Hyderabad",
    initials: "MR",
    gradientFrom: "#FFF7ED",
    gradientTo: "#FFEDD5",
    verificationLevel: "gold",
    compatibility: 91,
    matchedDate: "1 month ago",
    matchedDaysAgo: 30,
    lastMessage: "Sent you a voice introduction 🎤",
    lastMessageTime: "3d",
    unread: 2,
    isOnline: true,
    status: "active",
  },
  {
    id: "m7",
    name: "Isha Kapoor",
    age: 28,
    city: "Pune",
    initials: "IK",
    gradientFrom: "#FCE7F3",
    gradientTo: "#FBCFE8",
    verificationLevel: "bronze",
    compatibility: 79,
    matchedDate: "1 month ago",
    matchedDaysAgo: 35,
    lastMessage: "Coffee or chai person? ☕",
    lastMessageTime: "5d",
    status: "active",
  },
  {
    id: "m8",
    name: "Nandini Das",
    age: 26,
    city: "Kolkata",
    initials: "ND",
    gradientFrom: "#EDE9FE",
    gradientTo: "#C4B5FD",
    verificationLevel: "gold",
    compatibility: 94,
    matchedDate: "6 weeks ago",
    matchedDaysAgo: 42,
    lastMessage: "My family would love to connect!",
    lastMessageTime: "1w",
    status: "active",
  },
  {
    id: "m9",
    name: "Sanya Mehta",
    age: 27,
    city: "Jaipur",
    initials: "SM",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FCD34D",
    verificationLevel: "silver",
    compatibility: 86,
    matchedDate: "2 months ago",
    matchedDaysAgo: 55,
    lastMessage: "Looking forward to meeting sometime!",
    lastMessageTime: "2w",
    status: "active",
  },
  {
    id: "m10",
    name: "Tanya Joshi",
    age: 25,
    city: "Lucknow",
    initials: "TJ",
    gradientFrom: "#DCFCE7",
    gradientTo: "#86EFAC",
    verificationLevel: "gold",
    compatibility: 90,
    matchedDate: "2 months ago",
    matchedDaysAgo: 60,
    lastMessage: "Great taste in music! 🎵",
    lastMessageTime: "2w",
    status: "active",
  },
  {
    id: "m11",
    name: "Pooja Singh",
    age: 27,
    city: "Chandigarh",
    initials: "PS",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FDA4AF",
    verificationLevel: "bronze",
    compatibility: 77,
    matchedDate: "3 months ago",
    matchedDaysAgo: 80,
    lastMessage: "What are your thoughts on relocation?",
    lastMessageTime: "3w",
    status: "active",
  },
  {
    id: "m12",
    name: "Deepa Murthy",
    age: 26,
    city: "Bangalore",
    initials: "DM",
    gradientFrom: "#E0F2FE",
    gradientTo: "#7DD3FC",
    verificationLevel: "silver",
    compatibility: 83,
    matchedDate: "3 months ago",
    matchedDaysAgo: 90,
    lastMessage: "Weekend plans? 🌞",
    lastMessageTime: "1m",
    status: "active",
  },
  {
    id: "m13",
    name: "Aisha Khan",
    age: 24,
    city: "Mumbai",
    initials: "AK",
    gradientFrom: "#FFF7ED",
    gradientTo: "#FED7AA",
    verificationLevel: "gold",
    compatibility: 88,
    matchedDate: "3 months ago",
    matchedDaysAgo: 92,
    lastMessage: "Let's continue this conversation!",
    lastMessageTime: "1m",
    status: "active",
  },
  {
    id: "m14",
    name: "Rhea Bose",
    age: 25,
    city: "Kolkata",
    initials: "RB",
    gradientFrom: "#FCE7F3",
    gradientTo: "#F9A8D4",
    verificationLevel: "bronze",
    compatibility: 75,
    matchedDate: "4 months ago",
    matchedDaysAgo: 110,
    lastMessage: "It was nice chatting with you!",
    lastMessageTime: "2m",
    status: "active",
  },
  {
    id: "m15",
    name: "Shruti Saxena",
    age: 28,
    city: "Delhi",
    initials: "SS",
    gradientFrom: "#EDE9FE",
    gradientTo: "#A78BFA",
    verificationLevel: "silver",
    compatibility: 81,
    matchedDate: "4 months ago",
    matchedDaysAgo: 120,
    lastMessage: "Your bio about cooking resonated!",
    lastMessageTime: "2m",
    status: "active",
  },

  // ── Past ──
  {
    id: "m16",
    name: "Vaishali Jain",
    age: 27,
    city: "Indore",
    initials: "VJ",
    gradientFrom: "#F5F5F5",
    gradientTo: "#E0E0E0",
    verificationLevel: "bronze",
    compatibility: 72,
    matchedDate: "5 months ago",
    matchedDaysAgo: 150,
    lastMessage: "All the best! 🙏",
    lastMessageTime: "3m",
    status: "past",
  },
  {
    id: "m17",
    name: "Neha Rawat",
    age: 25,
    city: "Dehradun",
    initials: "NR",
    gradientFrom: "#F5F5F5",
    gradientTo: "#E0E0E0",
    verificationLevel: "silver",
    compatibility: 68,
    matchedDate: "6 months ago",
    matchedDaysAgo: 180,
    status: "past",
  },
  {
    id: "m18",
    name: "Pallavi Mohan",
    age: 26,
    city: "Mysore",
    initials: "PM",
    gradientFrom: "#F5F5F5",
    gradientTo: "#E0E0E0",
    verificationLevel: "bronze",
    compatibility: 65,
    matchedDate: "7 months ago",
    matchedDaysAgo: 210,
    status: "past",
  },
  {
    id: "m19",
    name: "Zara Sheikh",
    age: 24,
    city: "Pune",
    initials: "ZS",
    gradientFrom: "#F5F5F5",
    gradientTo: "#E0E0E0",
    verificationLevel: "silver",
    compatibility: 71,
    matchedDate: "8 months ago",
    matchedDaysAgo: 240,
    status: "past",
  },
  {
    id: "m20",
    name: "Mira Chopra",
    age: 27,
    city: "Gurgaon",
    initials: "MC",
    gradientFrom: "#F5F5F5",
    gradientTo: "#E0E0E0",
    verificationLevel: "gold",
    compatibility: 74,
    matchedDate: "9 months ago",
    matchedDaysAgo: 270,
    status: "past",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — Likes Received
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_LIKES: LikeProfile[] = [
  // ── Special Interests ──
  {
    id: "l1",
    name: "Diya Menon",
    age: 25,
    city: "Kochi",
    initials: "DM",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    verificationLevel: "gold",
    compatibility: 93,
    likedAt: "1h ago",
    interestType: "special",
    appreciationMessage: "Your travel photos and family values really stood out to me!",
  },
  {
    id: "l2",
    name: "Meera Jain",
    age: 26,
    city: "Jaipur",
    initials: "MJ",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
    verificationLevel: "silver",
    compatibility: 89,
    likedAt: "3h ago",
    interestType: "special",
    appreciationMessage: "We both love cooking and have similar values 🙏",
  },

  // ── Premium Interests ──
  {
    id: "l3",
    name: "Anika Roy",
    age: 24,
    city: "Kolkata",
    initials: "AR",
    gradientFrom: "#FCE7F3",
    gradientTo: "#FBCFE8",
    verificationLevel: "gold",
    compatibility: 91,
    likedAt: "5h ago",
    interestType: "premium",
    appreciationMessage: "Your bio about ambition and warmth resonated deeply.",
  },
  {
    id: "l4",
    name: "Sakshi Verma",
    age: 27,
    city: "Delhi",
    initials: "SV",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
    verificationLevel: "silver",
    compatibility: 86,
    likedAt: "1d ago",
    interestType: "premium",
  },
  {
    id: "l5",
    name: "Trisha Nambiar",
    age: 25,
    city: "Trivandrum",
    initials: "TN",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
    verificationLevel: "gold",
    compatibility: 88,
    likedAt: "2d ago",
    interestType: "premium",
  },

  // ── Regular Likes ──
  {
    id: "l6",
    name: "Kriti Agarwal",
    age: 26,
    city: "Lucknow",
    initials: "KA",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
    verificationLevel: "bronze",
    compatibility: 78,
    likedAt: "1d ago",
    interestType: "regular",
  },
  {
    id: "l7",
    name: "Nikita Sen",
    age: 25,
    city: "Bhubaneswar",
    initials: "NS",
    gradientFrom: "#FFF7ED",
    gradientTo: "#FFEDD5",
    verificationLevel: "silver",
    compatibility: 82,
    likedAt: "2d ago",
    interestType: "regular",
  },
  {
    id: "l8",
    name: "Simran Kaur",
    age: 27,
    city: "Amritsar",
    initials: "SK",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    verificationLevel: "gold",
    compatibility: 85,
    likedAt: "2d ago",
    interestType: "regular",
  },
  {
    id: "l9",
    name: "Aditi Bhatt",
    age: 24,
    city: "Dehradun",
    initials: "AB",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
    verificationLevel: "bronze",
    compatibility: 74,
    likedAt: "3d ago",
    interestType: "regular",
  },
  {
    id: "l10",
    name: "Vidya Krishnan",
    age: 28,
    city: "Coimbatore",
    initials: "VK",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
    verificationLevel: "silver",
    compatibility: 80,
    likedAt: "3d ago",
    interestType: "regular",
  },
  {
    id: "l11",
    name: "Janhvi Desai",
    age: 26,
    city: "Surat",
    initials: "JD",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
    verificationLevel: "bronze",
    compatibility: 73,
    likedAt: "4d ago",
    interestType: "regular",
  },
  {
    id: "l12",
    name: "Nisha Rajan",
    age: 25,
    city: "Bangalore",
    initials: "NR",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
    verificationLevel: "gold",
    compatibility: 87,
    likedAt: "4d ago",
    interestType: "regular",
  },
  {
    id: "l13",
    name: "Radhika Sharma",
    age: 27,
    city: "Nagpur",
    initials: "RS",
    gradientFrom: "#FFF7ED",
    gradientTo: "#FFEDD5",
    verificationLevel: "bronze",
    compatibility: 71,
    likedAt: "5d ago",
    interestType: "regular",
  },
  {
    id: "l14",
    name: "Swati Mishra",
    age: 24,
    city: "Varanasi",
    initials: "SM",
    gradientFrom: "#FCE7F3",
    gradientTo: "#FBCFE8",
    verificationLevel: "silver",
    compatibility: 79,
    likedAt: "5d ago",
    interestType: "regular",
  },
  {
    id: "l15",
    name: "Fatima Syed",
    age: 26,
    city: "Hyderabad",
    initials: "FS",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    verificationLevel: "gold",
    compatibility: 84,
    likedAt: "6d ago",
    interestType: "regular",
  },
  {
    id: "l16",
    name: "Ritika Goel",
    age: 25,
    city: "Chandigarh",
    initials: "RG",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
    verificationLevel: "bronze",
    compatibility: 76,
    likedAt: "6d ago",
    interestType: "regular",
  },
  {
    id: "l17",
    name: "Anjali Thakur",
    age: 27,
    city: "Shimla",
    initials: "AT",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
    verificationLevel: "silver",
    compatibility: 81,
    likedAt: "1w ago",
    interestType: "regular",
  },
  {
    id: "l18",
    name: "Charvi Malhotra",
    age: 24,
    city: "Noida",
    initials: "CM",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
    verificationLevel: "bronze",
    compatibility: 72,
    likedAt: "1w ago",
    interestType: "regular",
  },
  {
    id: "l19",
    name: "Divya Pillai",
    age: 26,
    city: "Chennai",
    initials: "DP",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
    verificationLevel: "gold",
    compatibility: 90,
    likedAt: "1w ago",
    interestType: "regular",
  },
  {
    id: "l20",
    name: "Gauri Pandey",
    age: 25,
    city: "Patna",
    initials: "GP",
    gradientFrom: "#FFF7ED",
    gradientTo: "#FFEDD5",
    verificationLevel: "silver",
    compatibility: 77,
    likedAt: "1w ago",
    interestType: "regular",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<MatchesTabId>("matches");
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [likes, setLikes] = useState<LikeProfile[]>([]);

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => {
      setMatches(MOCK_MATCHES);
      setLikes(MOCK_LIKES);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const totalMatches = matches.length;
  const totalLikes = likes.length;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Tab Switcher ── */}
      <MatchesTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchCount={totalMatches}
        likesCount={totalLikes}
      />

      {/* ── Tab Panels ── */}
      <div>
        {activeTab === "matches" && (
          <div role="tabpanel" id="panel-matches" aria-labelledby="tab-matches">
            <ActiveMatches matches={matches} isLoading={isLoading} />
          </div>
        )}

        {activeTab === "likes" && (
          <div role="tabpanel" id="panel-likes" aria-labelledby="tab-likes">
            <LikesReceived
              likes={likes}
              isLoading={isLoading}
              onLikeBack={(id) => {
                setLikes((prev) => prev.filter((l) => l.id !== id));
                // TODO: wire to API → create mutual match
              }}
              onPass={(id) => {
                setLikes((prev) => prev.filter((l) => l.id !== id));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
