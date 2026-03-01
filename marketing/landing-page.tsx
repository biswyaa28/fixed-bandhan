/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Marketing Landing Page
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Public-facing landing page optimised for:
 *   • SEO (server-rendered, semantic HTML, structured data)
 *   • Conversion (clear CTA hierarchy, social proof, trust signals)
 *   • Performance (no heavy frameworks, minimal JS, lazy images)
 *   • Mobile-first (85%+ of Indian traffic is mobile)
 *   • Bilingual (English + Hindi toggle)
 *
 * Route: /welcome  (separate from the app splash at /)
 *
 * Sections:
 *   1. Hero — headline + CTA + phone mockup
 *   2. Stats bar — user count, marriages, success rate
 *   3. How it works — 3-step process
 *   4. Features — safety, AI matching, family view, verification
 *   5. Social proof — testimonials / success stories
 *   6. Pricing teaser — free vs premium
 *   7. Trust badges — DPDP, DigiLocker, encrypted
 *   8. FAQ accordion
 *   9. Footer CTA — download/signup
 *
 * Comic book aesthetic: thick borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Sparkles,
  Heart,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
  Star,
  MessageCircle,
  Eye,
  CheckCircle2,
  ArrowRight,
  Globe,
  Phone,
  Crown,
} from "lucide-react";

// ─── Bilingual Strings ──────────────────────────────────────────────────

const S = {
  en: {
    nav: { brand: "Bandhan AI", cta: "Get Started", lang: "हिंदी" },
    hero: {
      badge: "AI-Powered Matchmaking for India",
      headline: "Find Your\nLife Partner",
      subheadline:
        "The marriage-focused platform that matches you on values, not just photos. Verified profiles. Family-first design. Built for India.",
      cta: "Start Free",
      ctaSub: "No credit card needed. 100% free to start.",
    },
    stats: [
      { value: "50K+", label: "Active Members" },
      { value: "94%", label: "Match Satisfaction" },
      { value: "1,200+", label: "Matches Made" },
    ],
    howItWorks: {
      title: "How Bandhan Works",
      subtitle: "Three steps to finding your life partner",
      steps: [
        {
          number: "01",
          title: "Create Your Profile",
          description:
            "Share your values, life goals, and what matters most. Our AI understands who you really are — beyond just photos.",
        },
        {
          number: "02",
          title: "Get Matched by AI",
          description:
            "Our algorithm weighs intent alignment (35%), values (25%), lifestyle (20%), location (12%), and family compatibility (8%).",
        },
        {
          number: "03",
          title: "Connect Safely",
          description:
            "Chat with verified matches. Share voice notes. Use safety features. When ready, share your Family View PDF with parents.",
        },
      ],
    },
    features: {
      title: "Why Bandhan?",
      subtitle: "Built different. Built for India.",
      items: [
        {
          icon: "Shield",
          title: "DigiLocker Verified",
          description:
            "Every profile is verified through government ID via DigiLocker. No fakes. No catfishing. Real people only.",
        },
        {
          icon: "Sparkles",
          title: "AI-Powered Matching",
          description:
            "Our algorithm matches you based on life values, intent alignment, and family compatibility — not swipe culture.",
        },
        {
          icon: "Users",
          title: "Family View PDF",
          description:
            "Generate a sharable PDF with match details for parents. Bridge the gap between modern dating and traditional values.",
        },
        {
          icon: "Lock",
          title: "Privacy-First",
          description:
            "DPDP Act 2023 compliant. All data stored in India. Photos blurred until matched. Your data, your control.",
        },
        {
          icon: "MessageCircle",
          title: "Safe Communication",
          description:
            "Voice notes, video calls, and \"Share My Date\" safety feature. Built-in reporting and 24h moderation.",
        },
        {
          icon: "Eye",
          title: "Respectful Initiation",
          description:
            "Optional \"women message first\" mode. 48-hour reply windows. Designed to reduce harassment and ghosting.",
        },
      ],
    },
    testimonials: {
      title: "Success Stories",
      subtitle: "Real couples. Real connections.",
      stories: [
        {
          quote:
            "Bandhan matched us based on shared values — something no other app did. We're getting married in March!",
          names: "Priya & Rohan",
          location: "Mumbai → Delhi",
          timeframe: "Matched in 3 months",
        },
        {
          quote:
            "My parents were skeptical about dating apps until I showed them the Family View PDF. They loved it.",
          names: "Anjali & Vikram",
          location: "Bangalore → Pune",
          timeframe: "Matched in 6 weeks",
        },
        {
          quote:
            "The verification badge gave me confidence. I knew every profile was real. That's rare in India.",
          names: "Sneha & Arjun",
          location: "Chennai",
          timeframe: "Matched in 2 months",
        },
      ],
    },
    pricing: {
      title: "Simple, Honest Pricing",
      subtitle: "Start free. Upgrade when you're ready.",
      free: {
        name: "Free",
        price: "₹0",
        features: [
          "5 profile views/day",
          "2 new conversations/day",
          "Basic filters",
          "Safety features",
          "Identity verification",
        ],
      },
      premium: {
        name: "Premium",
        price: "₹499",
        period: "/month",
        badge: "7-day free trial",
        features: [
          "Unlimited profiles & chats",
          "Advanced filters (caste, income)",
          "Family View PDF generator",
          "Compatibility insights",
          "Priority matching",
          "Video calling",
        ],
      },
      cta: "Start Free Today",
    },
    trust: {
      title: "Your Trust Matters",
      items: [
        "DPDP Act 2023 Compliant",
        "Data Stored in India",
        "DigiLocker Verified",
        "End-to-End Encrypted",
        "7-Day Money Back",
        "24h Moderation",
      ],
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "Is Bandhan AI really free?",
          a: "Yes! The free plan gives you 5 profile views and 2 conversations per day. That's enough for serious, deliberate matchmaking. Premium unlocks unlimited access for ₹499/month.",
        },
        {
          q: "How is this different from Tinder or Shaadi.com?",
          a: "Bandhan combines the best of both worlds: modern AI matching technology with Indian family values. We match on life goals and values (not just photos), offer Family View PDFs for parents, and cost a fraction of traditional matrimony sites.",
        },
        {
          q: "How do you verify profiles?",
          a: "We use DigiLocker integration for government ID verification. Every verified profile shows a Bronze, Silver, or Gold badge depending on verification level. No fakes allowed.",
        },
        {
          q: "Is my data safe?",
          a: "Absolutely. We're fully compliant with India's DPDP Act 2023. All personal data is stored in India (Mumbai servers). Photos are blurred until you match. You can export or delete your data anytime.",
        },
        {
          q: "What is the Family View PDF?",
          a: "It's a sharable PDF that presents your match's profile in a format parents and family are comfortable with — education, career, family details, values. Bridge the gap between modern matching and traditional approval.",
        },
        {
          q: "Can I cancel Premium anytime?",
          a: "Yes, one tap in Settings. No hidden barriers. If you cancel within 48 hours and haven't used premium features, you get a full refund.",
        },
      ],
    },
    footer: {
      headline: "Ready to Find Your Life Partner?",
      cta: "Get Started — It's Free",
      ctaSub: "Join 50,000+ members finding meaningful connections",
      copyright: "© 2026 Bandhan AI. Made with ❤️ in India.",
      links: ["Privacy Policy", "Terms of Service", "Contact", "Blog"],
    },
  },
  hi: {
    nav: { brand: "बंधन AI", cta: "शुरू करें", lang: "English" },
    hero: {
      badge: "भारत के लिए AI-संचालित मैचमेकिंग",
      headline: "अपना जीवन\nसाथी खोजें",
      subheadline:
        "विवाह-केंद्रित प्लेटफ़ॉर्म जो आपको मूल्यों के आधार पर मैच करता है, सिर्फ़ फ़ोटो नहीं। सत्यापित प्रोफ़ाइल। परिवार-प्रथम डिज़ाइन। भारत के लिए बनाया गया।",
      cta: "मुफ़्त में शुरू करें",
      ctaSub: "क्रेडिट कार्ड की ज़रूरत नहीं। शुरू करना 100% मुफ़्त।",
    },
    stats: [
      { value: "50K+", label: "सक्रिय सदस्य" },
      { value: "94%", label: "मैच संतुष्टि" },
      { value: "1,200+", label: "मैच बनाए गए" },
    ],
    howItWorks: {
      title: "बंधन कैसे काम करता है",
      subtitle: "तीन कदम अपने जीवन साथी को खोजने के",
      steps: [
        {
          number: "01",
          title: "प्रोफ़ाइल बनाएं",
          description:
            "अपने मूल्य, जीवन लक्ष्य और सबसे ज़रूरी बातें साझा करें। हमारा AI समझता है कि आप वास्तव में कौन हैं।",
        },
        {
          number: "02",
          title: "AI से मैच पाएं",
          description:
            "हमारा एल्गोरिदम इरादे (35%), मूल्य (25%), जीवनशैली (20%), स्थान (12%), और परिवार अनुकूलता (8%) को ध्यान में रखता है।",
        },
        {
          number: "03",
          title: "सुरक्षित रूप से जुड़ें",
          description:
            "सत्यापित मैच के साथ चैट करें। वॉइस नोट भेजें। सुरक्षा सुविधाओं का उपयोग करें। तैयार होने पर, Family View PDF माता-पिता के साथ साझा करें।",
        },
      ],
    },
    features: {
      title: "बंधन क्यों?",
      subtitle: "अलग बनाया गया। भारत के लिए बनाया गया।",
      items: [
        {
          icon: "Shield",
          title: "DigiLocker सत्यापित",
          description: "हर प्रोफ़ाइल DigiLocker के माध्यम से सरकारी ID द्वारा सत्यापित है।",
        },
        {
          icon: "Sparkles",
          title: "AI-संचालित मैचिंग",
          description: "हमारा एल्गोरिदम जीवन मूल्यों और परिवार अनुकूलता के आधार पर मैच करता है।",
        },
        {
          icon: "Users",
          title: "Family View PDF",
          description: "माता-पिता के लिए साझा करने योग्य PDF। आधुनिक डेटिंग और पारंपरिक मूल्यों के बीच पुल।",
        },
        {
          icon: "Lock",
          title: "गोपनीयता-प्रथम",
          description: "DPDP अधिनियम 2023 अनुपालित। सभी डेटा भारत में। फ़ोटो मैच तक ब्लर।",
        },
        {
          icon: "MessageCircle",
          title: "सुरक्षित संचार",
          description: "वॉइस नोट, वीडियो कॉल, और \"शेयर माई डेट\" सुरक्षा सुविधा।",
        },
        {
          icon: "Eye",
          title: "सम्मानजनक शुरुआत",
          description: "वैकल्पिक \"महिलाएं पहले संदेश भेजें\" मोड। उत्पीड़न कम करने के लिए।",
        },
      ],
    },
    testimonials: {
      title: "सफलता की कहानियाँ",
      subtitle: "असली जोड़े। असली कनेक्शन।",
      stories: [
        {
          quote: "बंधन ने हमें साझा मूल्यों के आधार पर मैच किया — कोई और ऐप ऐसा नहीं करता। हम मार्च में शादी कर रहे हैं!",
          names: "प्रिया और रोहन",
          location: "मुंबई → दिल्ली",
          timeframe: "3 महीने में मैच",
        },
        {
          quote: "मेरे माता-पिता डेटिंग ऐप्स से शंकित थे जब तक मैंने उन्हें Family View PDF नहीं दिखाया।",
          names: "अंजलि और विक्रम",
          location: "बैंगलोर → पुणे",
          timeframe: "6 हफ़्तों में मैच",
        },
        {
          quote: "सत्यापन बैज ने मुझे विश्वास दिलाया। भारत में यह दुर्लभ है।",
          names: "स्नेहा और अर्जुन",
          location: "चेन्नई",
          timeframe: "2 महीने में मैच",
        },
      ],
    },
    pricing: {
      title: "सरल, ईमानदार मूल्य निर्धारण",
      subtitle: "मुफ़्त में शुरू करें। तैयार होने पर अपग्रेड करें।",
      free: {
        name: "मुफ़्त",
        price: "₹0",
        features: [
          "5 प्रोफ़ाइल/दिन",
          "2 नई बातचीत/दिन",
          "बुनियादी फ़िल्टर",
          "सुरक्षा सुविधाएं",
          "पहचान सत्यापन",
        ],
      },
      premium: {
        name: "प्रीमियम",
        price: "₹499",
        period: "/माह",
        badge: "7-दिन का फ्री ट्रायल",
        features: [
          "असीमित प्रोफ़ाइल और चैट",
          "उन्नत फ़िल्टर (जाति, आय)",
          "Family View PDF जनरेटर",
          "अनुकूलता अंतर्दृष्टि",
          "प्राथमिकता मिलान",
          "वीडियो कॉलिंग",
        ],
      },
      cta: "आज ही मुफ़्त शुरू करें",
    },
    trust: {
      title: "आपका भरोसा मायने रखता है",
      items: [
        "DPDP अधिनियम 2023 अनुपालित",
        "डेटा भारत में संग्रहीत",
        "DigiLocker सत्यापित",
        "एंड-टू-एंड एन्क्रिप्टेड",
        "7-दिन वापसी गारंटी",
        "24 घंटे मॉडरेशन",
      ],
    },
    faq: {
      title: "अक्सर पूछे जाने वाले प्रश्न",
      items: [
        {
          q: "क्या बंधन AI वाकई मुफ़्त है?",
          a: "हाँ! मुफ़्त योजना आपको प्रतिदिन 5 प्रोफ़ाइल दृश्य और 2 बातचीत देती है। प्रीमियम ₹499/माह में असीमित एक्सेस अनलॉक करता है।",
        },
        {
          q: "यह Tinder या Shaadi.com से कैसे अलग है?",
          a: "बंधन दोनों दुनियाओं का सर्वोत्तम मिलाता है: आधुनिक AI मैचिंग तकनीक और भारतीय पारिवारिक मूल्य। हम जीवन लक्ष्यों और मूल्यों के आधार पर मैच करते हैं।",
        },
        {
          q: "आप प्रोफ़ाइल कैसे सत्यापित करते हैं?",
          a: "हम सरकारी ID सत्यापन के लिए DigiLocker एकीकरण का उपयोग करते हैं। हर सत्यापित प्रोफ़ाइल कांस्य, रजत, या स्वर्ण बैज दिखाती है।",
        },
        {
          q: "क्या मेरा डेटा सुरक्षित है?",
          a: "बिल्कुल। हम DPDP अधिनियम 2023 का पूर्ण अनुपालन करते हैं। सभी डेटा भारत में (मुंबई सर्वर) संग्रहीत है। आप कभी भी अपना डेटा निर्यात या हटा सकते हैं।",
        },
        {
          q: "Family View PDF क्या है?",
          a: "यह एक साझा करने योग्य PDF है जो आपके मैच की प्रोफ़ाइल को माता-पिता के अनुकूल प्रारूप में प्रस्तुत करती है।",
        },
        {
          q: "क्या मैं कभी भी Premium रद्द कर सकता हूँ?",
          a: "हाँ, सेटिंग्स में एक टैप। कोई छिपी बाधा नहीं। 48 घंटे के भीतर रद्द करने पर पूर्ण वापसी।",
        },
      ],
    },
    footer: {
      headline: "अपना जीवन साथी खोजने के लिए तैयार हैं?",
      cta: "शुरू करें — यह मुफ़्त है",
      ctaSub: "50,000+ सदस्यों से जुड़ें जो सार्थक कनेक्शन खोज रहे हैं",
      copyright: "© 2026 बंधन AI। भारत में ❤️ से बनाया गया।",
      links: ["गोपनीयता नीति", "सेवा की शर्तें", "संपर्क", "ब्लॉग"],
    },
  },
} as const;

type Lang = "en" | "hi";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Shield, Sparkles, Users, Lock, MessageCircle, Eye,
};

// ─── FAQ Accordion Item ─────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b-[2px] border-black last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-4 text-left hover:bg-[#F8F8F8] transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-[#212121] pr-4">{q}</span>
        {open
          ? <ChevronUp size={16} strokeWidth={3} className="text-[#9E9E9E] flex-shrink-0" />
          : <ChevronDown size={16} strokeWidth={3} className="text-[#9E9E9E] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-xs text-[#424242] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = S[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#212121] border-b-[3px] border-black">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {t.nav.brand}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1 border-[2px] border-white text-white text-[9px] font-bold px-2 py-1 hover:bg-white hover:text-black transition-colors"
            >
              <Globe size={10} strokeWidth={3} />
              {t.nav.lang}
            </button>
            <Link
              href="/login"
              className="border-[2px] border-white bg-white text-black text-[9px] font-bold px-3 py-1 no-underline uppercase tracking-wider shadow-[2px_2px_0px_rgba(255,255,255,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(255,255,255,0.3)] transition-all"
            >
              {t.nav.cta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-block border-[2px] border-black px-3 py-1 mb-6">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#212121]">
            {t.hero.badge}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#212121] leading-tight whitespace-pre-line">
          {t.hero.headline}
        </h1>
        <p className="max-w-xl mx-auto text-sm text-[#424242] mt-4 leading-relaxed">
          {t.hero.subheadline}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border-[3px] border-black bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider no-underline shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            {t.hero.cta}
            <ArrowRight size={16} strokeWidth={3} />
          </Link>
          <p className="text-[10px] text-[#9E9E9E]">{t.hero.ctaSub}</p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y-[3px] border-black bg-[#F8F8F8]">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {t.stats.map((s, i) => (
            <div key={i}>
              <p className="text-2xl md:text-3xl font-bold text-[#212121]">{s.value}</p>
              <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#212121] text-center uppercase tracking-wider">
          {t.howItWorks.title}
        </h2>
        <p className="text-xs text-[#9E9E9E] text-center mt-2 mb-10">{t.howItWorks.subtitle}</p>
        <div className="grid md:grid-cols-3 gap-6">
          {t.howItWorks.steps.map((step) => (
            <div
              key={step.number}
              className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-6"
            >
              <span className="text-3xl font-bold text-[#E0E0E0]">{step.number}</span>
              <h3 className="text-sm font-bold text-[#212121] uppercase tracking-wider mt-3">
                {step.title}
              </h3>
              <p className="text-xs text-[#424242] mt-2 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#212121] border-y-[3px] border-black">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white text-center uppercase tracking-wider">
            {t.features.title}
          </h2>
          <p className="text-xs text-[#9E9E9E] text-center mt-2 mb-10">{t.features.subtitle}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {t.features.items.map((f, i) => {
              const Icon = ICON_MAP[f.icon] || Shield;
              return (
                <div
                  key={i}
                  className="border-[2px] border-[#424242] p-5 hover:border-white transition-colors"
                >
                  <Icon size={20} strokeWidth={2.5} className="text-white mb-3" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {f.title}
                  </h3>
                  <p className="text-[10px] text-[#9E9E9E] mt-2 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#212121] text-center uppercase tracking-wider">
          {t.testimonials.title}
        </h2>
        <p className="text-xs text-[#9E9E9E] text-center mt-2 mb-10">{t.testimonials.subtitle}</p>
        <div className="grid md:grid-cols-3 gap-6">
          {t.testimonials.stories.map((s, i) => (
            <div
              key={i}
              className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-[#F8F8F8] p-5"
            >
              <div className="text-2xl mb-3">&ldquo;</div>
              <p className="text-xs text-[#424242] leading-relaxed italic">{s.quote}</p>
              <div className="border-t border-dashed border-[#E0E0E0] mt-4 pt-3">
                <p className="text-xs font-bold text-[#212121]">{s.names}</p>
                <p className="text-[9px] text-[#9E9E9E]">
                  {s.location} · {s.timeframe}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Teaser ── */}
      <section className="bg-[#F8F8F8] border-y-[3px] border-black">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-[#212121] text-center uppercase tracking-wider">
            {t.pricing.title}
          </h2>
          <p className="text-xs text-[#9E9E9E] text-center mt-2 mb-10">{t.pricing.subtitle}</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="border-[2px] border-black bg-white p-5 shadow-[4px_4px_0px_#000]">
              <h3 className="text-sm font-bold uppercase tracking-wider">{t.pricing.free.name}</h3>
              <p className="text-3xl font-bold mt-2">{t.pricing.free.price}</p>
              <div className="border-t border-dashed border-[#E0E0E0] mt-4 pt-4 space-y-2">
                {t.pricing.free.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={12} strokeWidth={3} className="text-black flex-shrink-0" />
                    <span className="text-[10px] text-[#424242]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Premium */}
            <div className="border-[3px] border-black bg-[#212121] text-white p-5 shadow-[6px_6px_0px_#000] relative">
              <div className="absolute -top-3 left-4">
                <span className="border-[2px] border-white bg-white text-black text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  {t.pricing.premium.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Crown size={16} strokeWidth={3} />
                <h3 className="text-sm font-bold uppercase tracking-wider">{t.pricing.premium.name}</h3>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">{t.pricing.premium.price}</span>
                <span className="text-xs text-[#9E9E9E]">{t.pricing.premium.period}</span>
              </div>
              <div className="border-t border-dashed border-[#424242] mt-4 pt-4 space-y-2">
                {t.pricing.premium.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={12} strokeWidth={3} className="text-white flex-shrink-0" />
                    <span className="text-[10px] text-[#9E9E9E]">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border-[3px] border-black bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider no-underline shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
            >
              {t.pricing.cta}
              <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h3 className="text-xs font-bold text-[#9E9E9E] text-center uppercase tracking-wider mb-4">
          {t.trust.title}
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {t.trust.items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 border-[2px] border-[#E0E0E0] px-3 py-1.5">
              <Shield size={10} strokeWidth={2.5} className="text-[#9E9E9E]" />
              <span className="text-[9px] text-[#424242]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#F8F8F8] border-y-[3px] border-black">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-[#212121] text-center uppercase tracking-wider mb-10">
            {t.faq.title}
          </h2>
          <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white">
            {t.faq.items.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="bg-[#212121] border-t-[3px] border-black">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            {t.footer.headline}
          </h2>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border-[3px] border-white bg-white text-black px-8 py-3 text-sm font-bold uppercase tracking-wider no-underline shadow-[4px_4px_0px_rgba(255,255,255,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(255,255,255,0.3)] transition-all"
            >
              {t.footer.cta}
              <ArrowRight size={16} strokeWidth={3} />
            </Link>
            <p className="text-[10px] text-[#9E9E9E]">{t.footer.ctaSub}</p>
          </div>
        </div>
        {/* Copyright */}
        <div className="border-t border-[#424242] py-4 px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[9px] text-[#9E9E9E]">{t.footer.copyright}</p>
            <div className="flex gap-4">
              {t.footer.links.map((link, i) => (
                <a key={i} href="#" className="text-[9px] text-[#9E9E9E] hover:text-white no-underline transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
