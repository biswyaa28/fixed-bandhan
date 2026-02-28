"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import {
  Heart,
  X,
  Mic,
  MapPin,
  Shield,
  ShieldCheck,
  GraduationCap,
  Church,
  Languages,
  Sparkles,
  Crown,
  ChevronDown,
  Lock,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  verificationLevel: "bronze" | "silver" | "gold";
  intent: string;
  compatibility: number;
  education: string;
  religion: string;
  motherTongue: string;
  imageUrl: string;
  isBlurred: boolean;
  bio?: string;
  hobbies?: string[];
  initials?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 26,
    city: "Bangalore",
    verificationLevel: "gold",
    intent: "Marriage",
    compatibility: 94,
    education: "IIT Delhi",
    religion: "Hindu",
    motherTongue: "Hindi",
    imageUrl: "",
    isBlurred: true,
    bio: "Software Engineer passionate about travel, books and finding a life partner who shares my values.",
    hobbies: ["🧘 Yoga", "📚 Reading", "✈️ Travel", "🎵 Music"],
    initials: "PS",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
  },
  {
    id: "2",
    name: "Ananya Iyer",
    age: 25,
    city: "Chennai",
    verificationLevel: "silver",
    intent: "Serious",
    compatibility: 87,
    education: "Anna University",
    religion: "Hindu",
    motherTongue: "Tamil",
    imageUrl: "",
    isBlurred: true,
    bio: "Doctor who loves classical music and long walks. Looking for someone kind and family-oriented.",
    hobbies: ["🎶 Carnatic", "🏃 Running", "🍳 Cooking"],
    initials: "AI",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
  },
  {
    id: "3",
    name: "Sneha Patel",
    age: 27,
    city: "Ahmedabad",
    verificationLevel: "gold",
    intent: "Marriage",
    compatibility: 82,
    education: "NIT Surathkal",
    religion: "Hindu",
    motherTongue: "Gujarati",
    imageUrl: "",
    isBlurred: true,
    bio: "Entrepreneur running a D2C brand. Family values matter most to me alongside individual growth.",
    hobbies: ["📊 Business", "🌿 Gardening", "✈️ Travel"],
    initials: "SP",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
  },
  {
    id: "4",
    name: "Kavya Nair",
    age: 24,
    city: "Kochi",
    verificationLevel: "bronze",
    intent: "Serious",
    compatibility: 78,
    education: "Cochin University",
    religion: "Christian",
    motherTongue: "Malayalam",
    imageUrl: "",
    isBlurred: true,
    bio: "Teacher and poet. Believe every relationship is built on friendship first.",
    hobbies: ["✍️ Writing", "🎭 Theatre", "🏊 Swimming"],
    initials: "KN",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
  },
  {
    id: "5",
    name: "Riya Gupta",
    age: 26,
    city: "Delhi",
    verificationLevel: "silver",
    intent: "Marriage",
    compatibility: 75,
    education: "Delhi University",
    religion: "Hindu",
    motherTongue: "Hindi",
    imageUrl: "",
    isBlurred: true,
    bio: "Fashion designer with a love for art history. Seek someone who appreciates culture and travel.",
    hobbies: ["👗 Fashion", "🎨 Art", "📸 Photography"],
    initials: "RG",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const intentStyle: Record<string, { bg: string; text: string }> = {
  Marriage: { bg: "bg-blush-100", text: "text-blush-700" },
  Serious: { bg: "bg-lavender-100", text: "text-lavender-700" },
  Friendship: { bg: "bg-sky-100", text: "text-sky-700" },
};

function VerifBadge({ level }: { level: "bronze" | "silver" | "gold" }) {
  const cfg = {
    bronze: {
      cls: "bg-peach-100 border-peach-200 text-peach-700",
      Icon: Shield,
    },
    silver: { cls: "bg-ink-100   border-ink-200   text-ink-600", Icon: Shield },
    gold: {
      cls: "bg-gold-100  border-gold-200  text-gold-700",
      Icon: ShieldCheck,
    },
  }[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold",
        cfg.cls,
      )}
    >
      <cfg.Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
      {level === "gold"
        ? "Gold Verified"
        : level === "silver"
          ? "ID Verified"
          : "Phone Verified"}
    </span>
  );
}

// ── Circular compatibility indicator ─────────────────────────────────────────
function CompatRing({ pct }: { pct: number }) {
  const r = 16,
    circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 90 ? "#22C55E" : pct >= 80 ? "#8B5CF6" : "#FB923C";
  return (
    <div className="relative flex items-center justify-center w-[42px] h-[42px] bg-white rounded-full shadow-sm border border-ink-100">
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 42 42"
      >
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="3"
        />
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[10px] font-bold text-ink-900 z-10">{pct}%</span>
    </div>
  );
}

// ─── Swipeable Profile Card ───────────────────────────────────────────────────
function SwipeCard({
  profile,
  zIndex,
  isTop,
  onLike,
  onPass,
}: {
  profile: Profile;
  zIndex: number;
  isTop: boolean;
  onLike: () => void;
  onPass: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [10, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, -10], [1, 0]);
  const controls = useAnimation();
  const intent = intentStyle[profile.intent] ?? {
    bg: "bg-ink-100",
    text: "text-ink-600",
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      controls
        .start({ x: 500, opacity: 0, transition: { duration: 0.3 } })
        .then(onLike);
    } else if (info.offset.x < -100) {
      controls
        .start({ x: -500, opacity: 0, transition: { duration: 0.3 } })
        .then(onPass);
    } else {
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  return (
    <motion.div
      animate={controls}
      style={{ x, rotate, zIndex, position: "absolute", inset: 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className={cn(
        "bg-white rounded-3xl overflow-hidden border border-ink-100 select-none",
        isTop ? "shadow-xl cursor-grab active:cursor-grabbing" : "shadow-md",
      )}
    >
      {/* ── Swipe overlays ── */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 z-20 rounded-3xl bg-sage-100/70 flex items-start justify-start p-6 pointer-events-none"
          >
            <span className="text-sage-600 font-black text-3xl border-[3px] border-sage-500 rounded-xl px-3 py-1 rotate-[-12deg]">
              LIKE
            </span>
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute inset-0 z-20 rounded-3xl bg-red-50/70 flex items-start justify-end p-6 pointer-events-none"
          >
            <span className="text-red-500 font-black text-3xl border-[3px] border-red-400 rounded-xl px-3 py-1 rotate-[12deg]">
              PASS
            </span>
          </motion.div>
        </>
      )}

      {/* ── Photo / avatar area ── */}
      <div
        className="relative h-64 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
        }}
      >
        {profile.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-ink-700">
                {profile.initials}
              </span>
            </div>
            {profile.isBlurred && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm">
                <Lock className="w-3 h-3 text-ink-500" strokeWidth={2} />
                <span className="text-[11px] text-ink-600 font-medium">
                  Photo hidden · Upgrade to reveal
                </span>
              </div>
            )}
          </div>
        )}

        {/* Gradient scrim at bottom of photo */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Name overlay */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white text-xl font-bold leading-tight drop-shadow-sm">
                {profile.name}, {profile.age}
              </h3>
              <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" strokeWidth={2} />
                {profile.city}
              </p>
            </div>
            <CompatRing pct={profile.compatibility} />
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <VerifBadge level={profile.verificationLevel} />
          <span
            className={cn(
              "text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
              intent.bg,
              intent.text,
            )}
          >
            {profile.intent}
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-4 pt-3">
        {/* Quick info chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { Icon: GraduationCap, val: profile.education },
            { Icon: Church, val: profile.religion },
            { Icon: Languages, val: profile.motherTongue },
          ].map(({ Icon, val }) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ink-50 border border-ink-100 text-xs text-ink-500"
            >
              <Icon className="w-3 h-3 text-ink-400" strokeWidth={1.5} />
              {val}
            </span>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-[13px] text-ink-500 leading-relaxed mb-2 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Expand */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="flex items-center gap-1 text-xs text-lavender-600 font-medium hover:text-lavender-700 transition-colors mb-1"
        >
          {expanded ? "Less" : "More details"}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 pt-2 pb-1 border-t border-ink-100">
                {profile.hobbies?.map((h) => (
                  <span
                    key={h}
                    className="px-2 py-0.5 rounded-md bg-lavender-50 border border-lavender-100 text-xs text-lavender-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action row ── */}
        <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-ink-100">
          <motion.button
            onClick={onPass}
            whileTap={{ scale: 0.93 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-ink-200 bg-white text-sm font-medium text-ink-500 hover:border-ink-300 hover:text-ink-700 hover:bg-ink-50 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2} />
            Pass
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.93 }}
            className="p-2.5 rounded-2xl border border-lavender-200 bg-lavender-50 text-lavender-600 hover:bg-lavender-100 transition-colors"
          >
            <Mic className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>

          <motion.button
            onClick={onLike}
            whileTap={{ scale: 0.93 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-ink-900 text-sm font-semibold text-white hover:bg-ink-700 transition-colors"
          >
            <Heart className="w-4 h-4" strokeWidth={2} />
            Like
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Match Celebration ────────────────────────────────────────────────────────
function MatchToast({
  name,
  onDismiss,
}: {
  name: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-ink-900 text-white shadow-xl"
    >
      <Heart className="w-5 h-5 text-blush-300 fill-blush-300" />
      <span className="text-sm font-semibold">
        You liked <strong>{name}</strong>!
      </span>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 overflow-hidden shadow-md">
      <div className="h-64 shimmer-bg" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 w-36 shimmer-bg rounded-lg" />
        <div className="h-3.5 w-24 shimmer-bg rounded" />
        <div className="flex gap-1.5 mt-3">
          {[80, 60, 72].map((w) => (
            <div
              key={w}
              className={`h-5 rounded-md shimmer-bg`}
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="h-3.5 w-full shimmer-bg rounded mt-2" />
        <div className="h-3.5 w-4/5  shimmer-bg rounded" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center px-6"
    >
      <div className="w-20 h-20 rounded-3xl bg-blush-100 border border-blush-200 flex items-center justify-center mb-5 shadow-sm">
        <Heart className="w-9 h-9 text-blush-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-ink-900 mb-1.5">
        You've seen everyone!
      </h3>
      <p className="text-sm text-ink-400 mb-7 max-w-xs leading-relaxed">
        You've reviewed all profiles for today. Upgrade for unlimited access or
        check back tomorrow.
      </p>
      <div className="flex flex-col gap-2.5 w-full max-w-[220px]">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-ink-200 text-sm font-medium text-ink-600 hover:bg-ink-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset (Demo)
        </button>
        <Link
          href="/premium"
          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-700 transition-colors"
        >
          <Crown className="w-4 h-4 text-gold-300" strokeWidth={2} />
          Upgrade
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Filter Sheet ─────────────────────────────────────────────────────────────
function FilterSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const filters = [
    { label: "Age Range", options: ["Any", "22–27", "25–32", "28–36"] },
    {
      label: "Location",
      options: ["Any", "Same City", "Same State", "Pan India"],
    },
    {
      label: "Education",
      options: ["Any", "Graduate", "Post-Graduate", "PhD"],
    },
    { label: "Intent", options: ["Any", "Marriage", "Serious", "Friendship"] },
  ];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-900/20 z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-5 pb-10 safe-bottom max-h-[85vh] overflow-y-auto"
          >
            <div className="w-10 h-1 rounded-full bg-ink-200 mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-ink-900">
                Filter Matches
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filters.map(({ label, options }) => (
                <div key={label}>
                  <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-1.5">
                    {label}
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl border border-ink-200 bg-white text-sm text-ink-700 focus:outline-none focus:border-lavender-400">
                    {options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full mt-6 py-3 rounded-2xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-700 transition-colors"
            >
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [daily, setDaily] = useState({ used: 3, total: 5 });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [lastLiked, setLastLiked] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setProfiles(mockProfiles);
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const handleLike = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (p) setLastLiked(p.name);
    setProfiles((prev) => prev.filter((x) => x.id !== id));
    setDaily((prev) => ({
      ...prev,
      used: Math.min(prev.used + 1, prev.total),
    }));
  };
  const handlePass = (id: string) =>
    setProfiles((prev) => prev.filter((x) => x.id !== id));
  const remaining = daily.total - daily.used;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-ink-100 px-4 safe-top">
        <div className="max-w-md mx-auto py-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h1 className="text-[1.15rem] font-bold text-ink-900 tracking-tight">
                Discover
              </h1>
              <p className="text-[11px] text-ink-400">
                {profiles.length} profiles for you
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-ink-200 text-ink-600 hover:border-ink-400 hover:bg-ink-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                Filter
              </button>
            </div>
          </div>

          {/* Daily limit bar */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1 rounded-full bg-ink-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(daily.used / daily.total) * 100}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  remaining > 1 ? "bg-lavender-400" : "bg-blush-500",
                )}
              />
            </div>
            <span className="text-[11px] text-ink-400 shrink-0 tabular-nums">
              {daily.used}/{daily.total} today
            </span>
            {remaining === 0 && (
              <Link
                href="/premium"
                className="shrink-0 text-[11px] font-bold text-gold-600 flex items-center gap-0.5 hover:text-gold-700"
              >
                <Crown className="w-3 h-3" strokeWidth={2.5} /> Upgrade
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Card Area ── */}
      <main className="max-w-md mx-auto px-4 pt-5 pb-36">
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <div className="opacity-50">
              <CardSkeleton />
            </div>
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState
            onReset={() => {
              setProfiles(mockProfiles);
              setDaily({ used: 0, total: 5 });
            }}
          />
        ) : (
          <div className="relative" style={{ height: 580 }}>
            <AnimatePresence>
              {profiles.slice(0, 3).map((p, i) => (
                <SwipeCard
                  key={p.id}
                  profile={p}
                  zIndex={10 - i}
                  isTop={i === 0}
                  onLike={() => handleLike(p.id)}
                  onPass={() => handlePass(p.id)}
                />
              ))}
            </AnimatePresence>

            {/* Stack shadow cards */}
            {profiles.length > 1 && (
              <div className="absolute inset-x-2 bottom-0 -z-10 h-4 bg-white rounded-3xl border border-ink-100 shadow-sm opacity-60" />
            )}
            {profiles.length > 2 && (
              <div className="absolute inset-x-4 bottom-0 -z-20 h-4 bg-white rounded-3xl border border-ink-100 opacity-30" />
            )}
          </div>
        )}

        {/* Swipe hint */}
        {!isLoading && profiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-4 mt-4 text-[11px] text-ink-300"
          >
            <span className="flex items-center gap-1">
              <X className="w-3 h-3" /> Swipe left to pass
            </span>
            <span className="w-px h-3 bg-ink-200" />
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> Swipe right to like
            </span>
          </motion.div>
        )}
      </main>

      {/* ── Upgrade Banner ── */}
      <AnimatePresence>
        {remaining <= 1 && !isLoading && profiles.length > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 z-20 px-4 safe-bottom"
          >
            <div className="max-w-md mx-auto flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gold-200 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-gold-100 flex items-center justify-center shrink-0">
                <Crown
                  className="w-4.5 h-4.5 text-gold-600"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink-900">
                  Daily limit reached
                </p>
                <p className="text-[11px] text-ink-400 truncate">
                  Upgrade for unlimited profiles
                </p>
              </div>
              <Link
                href="/premium"
                className="shrink-0 px-3.5 py-2 rounded-xl bg-ink-900 text-white text-xs font-bold hover:bg-ink-700 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Like toast ── */}
      <AnimatePresence>
        {lastLiked && (
          <MatchToast name={lastLiked} onDismiss={() => setLastLiked(null)} />
        )}
      </AnimatePresence>

      {/* ── Filter Sheet ── */}
      <FilterSheet open={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
}
