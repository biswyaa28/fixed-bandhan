# Bandhan AI — User Acquisition Strategy

> **Version:** 2026-02-28-v1
> **Horizon:** Year 1 (March 2026 — February 2027)
> **Target:** 50,000 registered users · 20,000 MAU · $0 paid ads budget

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Target Audience](#2-target-audience)
3. [Acquisition Channels](#3-acquisition-channels)
4. [Referral Program](#4-referral-program)
5. [Content Marketing & SEO](#5-content-marketing--seo)
6. [Social Media Strategy](#6-social-media-strategy)
7. [Community Building](#7-community-building)
8. [Campus Ambassador Program](#8-campus-ambassador-program)
9. [PR & Media Strategy](#9-pr--media-strategy)
10. [Future Paid Channels (Y2)](#10-future-paid-channels-y2)
11. [Metrics & KPIs](#11-metrics--kpis)
12. [Anti-Spam & Ethics Policy](#12-anti-spam--ethics-policy)
13. [Monthly Execution Calendar](#13-monthly-execution-calendar)

---

## 1. Executive Summary

### The Challenge
Build a two-sided marketplace (men + women seeking marriage) in India with zero advertising budget, while maintaining trust and quality.

### The Strategy
**Community-first, quality-over-quantity.** We grow through genuine word-of-mouth, smart referral incentives, campus ambassadors, and content marketing. Every user acquired must be a real person with genuine marriage intent. No bots, no fake profiles, no spam.

### Y1 Targets

| Metric | Target | Channel Mix |
|--------|--------|-------------|
| **Total registrations** | 50,000 | — |
| Word of mouth (organic) | 30,000 | 60% |
| Referral program | 12,500 | 25% |
| Campus ambassadors | 5,000 | 10% |
| Content/SEO/PR | 2,500 | 5% |
| **Total budget** | **₹75,000** (~$900) | — |
| **Blended CAC** | **₹1.5** | — |

### Why Zero Paid Ads?

1. **Trust**: Marriage is a trust-heavy decision. Paid ads feel impersonal. Personal recommendations convert 8× better.
2. **Quality**: Paid channels bring tire-kickers. Referrals bring marriage-minded users.
3. **Unit economics**: At ₹1.5 CAC with ₹4,375 LTV, our economics are exceptional. Adding paid ads at ₹50+ CAC would worsen them without proportional quality.
4. **Cash preservation**: ₹75K total budget is sustainable from personal savings / early revenue.

---

## 2. Target Audience

### Primary: The "Marriage-Ready" User

| Attribute | Detail |
|-----------|--------|
| **Age** | 24-32 |
| **Gender** | Balanced (critical for two-sided marketplace) |
| **Location** | Metro + Tier 1 cities (Phase 1) |
| **Education** | Graduate+ |
| **Intent** | Actively seeking marriage partner |
| **Family involvement** | Parents are aware and supportive |
| **Tech comfort** | Smartphone user, uses UPI |
| **Language** | English + Hindi bilingual |

### Secondary: The "Exploring" User

| Attribute | Detail |
|-----------|--------|
| **Age** | 22-26 |
| **Intent** | Open to serious relationships that could lead to marriage |
| **Behaviour** | Uses dating apps but frustrated with casual culture |
| **Key insight** | They'll convert to marriage-intent within 6-12 months |

### Anti-Target (Who We Don't Want)

- ❌ Users seeking casual hookups
- ❌ Bots or fake profiles
- ❌ Minors (strict 18+ with age gating)
- ❌ Users from outside India (Phase 1 = India only)

### Gender Balance Strategy

**The #1 risk** for any dating/marriage platform is gender imbalance. If men outnumber women 3:1, women get overwhelmed and leave. Then men leave too.

**How we maintain balance:**
1. **Safety features** attract women (Share My Date, women-first messaging, moderation)
2. **Family View PDF** makes women feel comfortable involving parents
3. **DigiLocker verification** builds trust (critical for women's safety)
4. **Campus recruitment targets women's groups** (50% of ambassador budget)
5. **Referral rewards** for women who invite other women (bonus 2 days Premium)
6. **Content marketing** emphasises safety (not romance/sexiness)

---

## 3. Acquisition Channels

### Channel Overview

```
                          BANDHAN ACQUISITION FUNNEL
                          ─────────────────────────

                        ┌─────────────────────────┐
                        │    AWARENESS (Top)       │
                        │                          │
                        │  • Content/SEO (blog)    │
                        │  • Social media (IG/LI)  │
                        │  • PR / media mentions   │
                        │  • Reddit AMAs           │
                        └───────────┬──────────────┘
                                    │
                        ┌───────────▼──────────────┐
                        │    CONSIDERATION (Mid)   │
                        │                          │
                        │  • Landing page visit    │
                        │  • Friend recommendation │
                        │  • Campus ambassador     │
                        │  • WhatsApp group link    │
                        └───────────┬──────────────┘
                                    │
                        ┌───────────▼──────────────┐
                        │    SIGNUP (Bottom)        │
                        │                          │
                        │  • Referral code used    │
                        │  • Direct signup         │
                        │  • QR code scan          │
                        └───────────┬──────────────┘
                                    │
                        ┌───────────▼──────────────┐
                        │    ACTIVATION            │
                        │                          │
                        │  • Complete profile (>50%)│
                        │  • Get first match        │
                        │  • Send first message     │
                        └──────────────────────────┘
```

### Channel Details

| Channel | Budget | Expected Signups | CAC | Priority |
|---------|--------|-----------------|-----|----------|
| **Word of mouth** | ₹0 | 30,000 | ₹0 | ⭐⭐⭐ |
| **Referral program** | ₹0* | 12,500 | ₹0* |⭐⭐⭐ |
| **Campus ambassadors** | ₹60,000 | 5,000 | ₹12 | ⭐⭐⭐ |
| **Content/SEO** | ₹15,000 | 2,000 | ₹7.5 | ⭐⭐ |
| **Social media** | ₹0 | Included in WOM | ₹0 | ⭐⭐ |
| **PR/Media** | ₹0 | 500 | ₹0 | ⭐ |
| **Total** | **₹75,000** | **50,000** | **₹1.5** | — |

*Referral rewards are Premium days, not cash. Effective cost ≈ ₹0 (server cost negligible).*

---

## 4. Referral Program

> **Implementation:** `lib/referral.ts` (Firestore) + `growth/referral-program.ts` (strategy layer) + `components/ReferralSystem.tsx` (UI)

### Reward Tiers

| Referrals | Reward |
|-----------|--------|
| 3 qualified | 1 week Premium free |
| 5 qualified | 2 weeks Premium free |
| 10 qualified | 1 month Premium free |

**"Qualified"** = referred user completes profile >50%.

### Anti-Spam Protections

- One referral code per user (can't create more)
- Referee must complete profile to count
- Max 20 referrals per user (prevents bot farms)
- Same-device detection via localStorage
- 24-hour cooldown between reward claims
- Code expires after 90 days of inactivity

### Smart Share Timing

Prompt users to share at high-emotion moments:
1. After getting their first match (excitement)
2. After completing their profile (momentum)
3. After 7 days of use (established habit)
4. After trial expiry (incentive to earn free days)
5. After viewing a success story (inspiration)

**Rules:**
- Max 2 prompts per week
- Same trigger can't fire within 14 days
- "Remind Me Later" always available
- Message variant rotates: value → social → reward

### Share Channels

| Channel | Format | Target |
|---------|--------|--------|
| **WhatsApp** (primary) | Pre-filled message + deep link | 60% of shares |
| **SMS** | Short text + link | 15% |
| **Instagram Story** | Template text for overlay | 10% |
| **Twitter/X** | Pre-filled tweet + link | 5% |
| **Copy to clipboard** | Fallback for all | 10% |

### Key Metrics

| Metric | Target |
|--------|--------|
| Share rate (users who share at least once) | 20% |
| Viral coefficient (new users per sharer) | 0.5 |
| Qualified referral rate | 40% of signups |

---

## 5. Content Marketing & SEO

### Blog Strategy

**URL:** bandhan.ai/blog (or blog.bandhan.ai)

**Content pillars (1-2 posts/week):**

| Pillar | Topic Examples | SEO Keywords |
|--------|---------------|-------------|
| **Indian Dating Culture** | "How Indian millennials approach marriage in 2026" | indian dating, marriage in india |
| **Relationship Advice** | "5 values that predict a happy marriage" | marriage advice, relationship tips |
| **Safety & Trust** | "How to spot fake profiles on matrimony sites" | fake profiles, safe dating |
| **Product Education** | "What is AI matchmaking and how does it work?" | AI matchmaking, how matching works |
| **Success Stories** | "How Priya & Rohan found each other on Bandhan" | matchmaking success stories |

### SEO Target Keywords

| Keyword | Monthly Volume | Difficulty | Priority |
|---------|---------------|-----------|----------|
| marriage app india | 8,100 | Medium | ⭐⭐⭐ |
| matchmaking app | 5,400 | Low | ⭐⭐⭐ |
| shaadi app alternative | 2,900 | Low | ⭐⭐⭐ |
| verified marriage profiles | 1,600 | Very Low | ⭐⭐⭐ |
| AI matchmaking | 1,200 | Very Low | ⭐⭐⭐ |
| family matchmaking india | 880 | Very Low | ⭐⭐ |
| how to find life partner | 6,600 | Medium | ⭐⭐ |
| indian dating advice | 3,600 | Medium | ⭐⭐ |

### Technical SEO

- Landing page server-rendered (Next.js) for Google indexing
- Structured data (JSON-LD) for app, FAQ, and organization schema
- Open Graph + Twitter Card meta tags on all pages
- Sitemap.xml generated from blog posts
- Page speed: <3s LCP on 3G (performance-optimised)
- Hindi content indexed separately (hreflang tags)

### Content Budget

| Item | Monthly Cost |
|------|-------------|
| Domain + hosting | ₹0 (Firebase) |
| Blog platform | ₹0 (Markdown in repo, rendered by Next.js) |
| Writing | ₹0 (founder-written in Y1) |
| **Total** | **₹0/month** |

---

## 6. Social Media Strategy

> **Templates:** `marketing/social-media/content-templates.md`

### Platform Priority

| Platform | Priority | Audience | Post Frequency |
|----------|----------|----------|---------------|
| **Instagram** | ⭐⭐⭐ | 22-30 year olds | 3-4x/week |
| **LinkedIn** | ⭐⭐ | Professionals, founders | 2x/week |
| **Twitter/X** | ⭐⭐ | Tech community, media | 3x/week |
| **Reddit** | ⭐⭐ | r/india, r/dating | 1-2x/month |
| **WhatsApp** | ⭐⭐⭐ | Community groups | As needed |
| **YouTube** | ⭐ | Tutorials, stories | 1x/month (Y2) |

### Content Mix (Weekly)

| Day | Platform | Content Type |
|-----|----------|-------------|
| Mon | Instagram (carousel) | 💡 Feature highlight / education |
| Tue | LinkedIn | 💡 Thought leadership post |
| Wed | Instagram (post) | 💬 Success story / testimonial |
| Thu | Twitter thread | 💡 Industry insight / data |
| Fri | Instagram (Reel/Story) | 🔧 How-to / product demo |
| Sat | — | Rest (scheduled stories only) |
| Sun | Instagram (Story) | 🎉 Poll / engagement / meme |

### Growth Tactics

1. **Engage in comments** on marriage/dating posts by Indian influencers (add genuine value, don't self-promote)
2. **Reply to viral tweets** about Indian dating with helpful insights + subtle brand mention
3. **Instagram Reels** about Indian marriage culture (high organic reach)
4. **LinkedIn thought leadership** about building a marriage-tech startup
5. **Reddit AMAs** in r/india (quarterly) + genuine participation in dating threads

---

## 7. Community Building

### WhatsApp Community

**Structure:**
```
Bandhan AI Community (announcement channel)
├── General Discussion
├── Feedback & Suggestions
├── Success Stories
└── Regional Groups
    ├── Mumbai
    ├── Delhi
    ├── Bangalore
    └── ... (add as we grow)
```

**Rules:**
- No spam or self-promotion
- No sharing others' personal information
- Respectful language only
- Moderated by 2 community managers

**Content:**
- Feature announcements
- Beta test invitations
- Community polls ("What feature do you want next?")
- Success story celebrations
- Feedback discussions

### Reddit Presence

| Subreddit | Strategy |
|-----------|----------|
| r/india | AMAs quarterly + genuine participation in dating threads |
| r/IndianMatchmaking | Share insights, never hard-sell |
| r/dating_advice | Offer genuine advice, mention Bandhan organically when relevant |
| r/startups | Build-in-public posts about Bandhan's growth |

### Matrimonial Event Partnerships

**Target: 5 events in Y1**

| Event Type | Strategy |
|-----------|----------|
| College cultural fests | Bandhan stall with QR code + live demo |
| Wedding expos | Table with QR code + Family View PDF demo |
| Community matchmaking events | Sponsor refreshments, display QR codes |
| Startup events | Pitch + networking (for press/investor leads) |

**Cost per event:** ₹1,000-2,000 (printing, standees)
**Expected signups per event:** 50-100

---

## 8. Campus Ambassador Program

> **Full guide:** `growth/campus-ambassador-program.md`

### Summary

| Metric | Target |
|--------|--------|
| Colleges | 50 |
| Ambassadors | 200 (4 per college) |
| Signups | 5,000 |
| Budget | ₹60,000 |
| CAC | ₹12 |

### Key Activities

1. Personal recommendations to friends
2. Instagram stories with referral code
3. WhatsApp group shares
4. QR code posters on campus
5. College fest stalls

---

## 9. PR & Media Strategy

> **Press kit:** `marketing/press-kit/press-kit.md`

### Tier 1: Tech Media (Month 1-3)

| Outlet | Angle | Contact Method |
|--------|-------|---------------|
| YourStory | "AI startup disrupting Indian matrimony" | Submit pitch |
| Inc42 | "Zero-cost bootstrapped marriage-tech" | Founder network |
| TechCrunch India | "DigiLocker for dating verification" | Cold pitch |
| Product Hunt | Launch day (coordinate with community) | Direct submit |

### Tier 2: Lifestyle Media (Month 4-6)

| Outlet | Angle | Contact Method |
|--------|-------|---------------|
| Times of India | "How AI is changing Indian matchmaking" | Press release |
| NDTV | "Safety-first dating for Indian women" | PR pitch |
| The Print | "Gen Z approach to arranged marriage" | Op-ed submission |
| Femina | "Women-first design in marriage apps" | Feature pitch |

### Tier 3: Podcasts & YouTube (Month 6+)

- Indian startup podcasts (The Ken, Barbershop, 1 Thing)
- YouTube channels about Indian culture/dating
- Instagram Live collaborations with relationship coaches

### Press Release Schedule

| Month | Headline |
|-------|---------|
| M1 | "Bandhan AI Launches India's First AI-Powered Marriage Platform" |
| M3 | "Bandhan AI Reaches 10,000 Users with Zero Marketing Spend" |
| M6 | "1,000 Matches Made: How AI is Changing Indian Matchmaking" |
| M9 | "Bandhan AI's Family View PDF Feature Goes Viral with Indian Parents" |
| M12 | "50,000 Users: Bandhan AI's Year 1 in Review" |

---

## 10. Future Paid Channels (Y2)

*Not executing in Y1, but planning ahead.*

### Google Ads

| Campaign | Keywords | Est. CPC | Est. Budget |
|----------|----------|----------|-------------|
| Brand | "bandhan ai" | ₹5 | ₹5,000/mo |
| Category | "marriage app india" | ₹15 | ₹30,000/mo |
| Competitor | "shaadi alternative" | ₹20 | ₹20,000/mo |

### Meta Ads (Instagram + Facebook)

| Campaign | Audience | Est. CPM | Est. Budget |
|----------|----------|----------|-------------|
| Awareness | 24-32, India, single | ₹100 | ₹20,000/mo |
| Retargeting | Visited site, didn't sign up | ₹150 | ₹10,000/mo |

### Influencer Partnerships

| Tier | Followers | Cost | Expected ROI |
|------|----------|------|-------------|
| Nano (1K-10K) | | Free (product exchange) | 50-100 signups |
| Micro (10K-100K) | | ₹5,000-15,000 | 200-500 signups |
| Mid (100K-500K) | | ₹25,000-50,000 | 1,000-2,000 signups |

**Target influencer types:** Relationship coaches, wedding planners, career women, matchmaking aunties on Instagram.

---

## 11. Metrics & KPIs

### Weekly Dashboard

| Metric | Target | How Measured |
|--------|--------|-------------|
| New signups | 1,000/week (M12) | Firebase Auth count |
| Activation rate | 45% (profile >50%) | Firestore query |
| Day 7 retention | 30% | Analytics cohort |
| Referral share rate | 20% of active users | Referral events |
| Referral conversion | 40% of referral signups qualify | Referral tracking |
| Gender ratio | 45-55% F:M | User demographics |

### Monthly Dashboard

| Metric | Target | How Measured |
|--------|--------|-------------|
| MAU | 20,000 (M12) | Analytics DAU → MAU |
| Free → Paid conversion | 3.5% | Subscription tracking |
| MRR | ₹2,50,950 (M12) | Razorpay dashboard |
| Churn (paid users) | <8% monthly | Subscription cancellations |
| NPS | >50 | In-app survey (quarterly) |
| App store rating | 4.5+ | Play Store / App Store |

### Acquisition Channel Attribution

Every signup is attributed to one channel:

| Attribution Method | Channel |
|-------------------|---------|
| `?ref=CODE` URL param | Referral |
| `?utm_source=campus` | Campus ambassador |
| `?utm_source=reddit` | Reddit |
| `?utm_source=instagram` | Social media |
| `?utm_source=blog` | Content/SEO |
| No params (direct) | Word of mouth / organic |

---

## 12. Anti-Spam & Ethics Policy

### We Will NEVER Do

1. ❌ **Create fake profiles** to inflate user count
2. ❌ **Use bots** to simulate conversations
3. ❌ **Buy email lists** or contact people without consent
4. ❌ **Scrape competitor platforms** for user data
5. ❌ **Use dark patterns** to trick users into sharing or upgrading
6. ❌ **Inflate metrics** (download bots, fake reviews, etc.)
7. ❌ **Spam social media** (mass DMs, comment spam)
8. ❌ **Pay for fake testimonials** or reviews
9. ❌ **Target vulnerable people** (recently divorced, grieving, etc.)
10. ❌ **Make guarantees** we can't keep ("Find your partner in 30 days!")

### We Will ALWAYS

1. ✅ Be transparent about what Bandhan is (marriage-focused matchmaking)
2. ✅ Respect user privacy in all marketing
3. ✅ Require consent before using any user data in testimonials
4. ✅ Disclose ambassador relationships (no astroturfing)
5. ✅ Focus on quality users over quantity
6. ✅ Remove fake profiles immediately upon detection
7. ✅ Honour refund policy without friction
8. ✅ Respond to all user complaints within 48 hours

### Reporting Violations

If any team member or ambassador is found violating these policies:
1. First offense: Written warning + corrective action
2. Second offense: Termination from program
3. If user data is compromised: Immediate termination + legal action

---

## 13. Monthly Execution Calendar

### Month 1-2: Foundation

| Week | Action |
|------|--------|
| W1 | Launch landing page (bandhan.ai/welcome) |
| W2 | Set up Instagram, LinkedIn, Twitter accounts |
| W3 | Publish first 3 blog posts (SEO) |
| W4 | Open campus ambassador applications |
| W5 | Launch referral program (in-app) |
| W6 | First Reddit AMA in r/india |
| W7 | Onboard first 50 ambassadors |
| W8 | Submit to Product Hunt |

### Month 3-4: Traction

| Week | Action |
|------|--------|
| W9-10 | First college fest stalls (2 events) |
| W11 | Publish "1,000 users" press release |
| W12 | Launch WhatsApp community |
| W13-14 | Pitch to YourStory / Inc42 |
| W15 | First success story blog post |
| W16 | Instagram Reels series launch |

### Month 5-6: Scale

| Week | Action |
|------|--------|
| W17-20 | Scale to 50 campuses |
| W21 | "5,000 matches" milestone press release |
| W22 | Second Reddit AMA |
| W23 | Guest post on 3 external blogs |
| W24 | Community meetup (Mumbai pilot) |

### Month 7-12: Acceleration

- Scale all channels based on Month 1-6 learnings
- Double down on highest-performing channels
- Start planning Y2 paid acquisition
- Expand to Tier 2 cities
- Launch regional language content (Hindi blog)
- Achieve 50,000 registered users milestone

---

## Summary

```
┌─────────────────────────────────────────────────────────────────┐
│              USER ACQUISITION — YEAR 1 SUMMARY                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHILOSOPHY:  Community-first. Quality over quantity.            │
│  BUDGET:      ₹75,000 (~$900). Zero paid ads.                   │
│  TARGET:      50,000 users. 20,000 MAU. 3.5% conversion.       │
│                                                                  │
│  CHANNELS:                                                       │
│    60%  Word of mouth (organic)                                  │
│    25%  Referral program (incentivised WOM)                      │
│    10%  Campus ambassadors (200 students, 50 colleges)           │
│     5%  Content/SEO + PR                                         │
│                                                                  │
│  ETHICS:      No bots. No fakes. No spam. No dark patterns.    │
│  GENDER:      Safety-first design attracts women (45-55% F:M)  │
│  COST:        ₹1.5 blended CAC vs ₹4,375 LTV = 2,917:1 ratio │
│                                                                  │
│  KEY RISK:    Gender imbalance                                   │
│  MITIGATION:  Safety features + campus targeting + content tone  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**© 2026 Bandhan AI. Confidential — for internal use only.**
