# Bandhan AI — Community Growth Playbook

> Zero-cost, organic growth strategy for Indian matchmaking.
> Every tactic here is free, community-driven, and privacy-respecting.
>
> **Target:** 10,000 users in 6 months with ₹0 ad spend.

---

## Table of Contents

1. [Growth Principles](#1-growth-principles)
2. [Referral Program](#2-referral-program)
3. [WhatsApp Growth Strategy](#3-whatsapp-growth-strategy)
4. [Instagram Organic Strategy](#4-instagram-organic-strategy)
5. [Twitter / X Strategy](#5-twitter--x-strategy)
6. [Reddit Strategy](#6-reddit-strategy)
7. [Campus Ambassador Program](#7-campus-ambassador-program)
8. [College Festival Partnerships](#8-college-festival-partnerships)
9. [User-Generated Content Contests](#9-user-generated-content-contests)
10. [Local Language Meetups](#10-local-language-meetups)
11. [Community WhatsApp Group](#11-community-whatsapp-group)
12. [Testimonial Collection Flow](#12-testimonial-collection-flow)
13. [Community Interaction Guidelines](#13-community-interaction-guidelines)
14. [Anti-Spam Policy](#14-anti-spam-policy)
15. [Measurement & KPIs](#15-measurement--kpis)

---

## 1. Growth Principles

### The Bandhan AI Growth Manifesto

1. **Community first, metrics second.** Happy users share naturally.
2. **Never spam.** One message, one channel, respect silence.
3. **Earn trust, don't buy it.** Verification badges > influencer shoutouts.
4. **India-first design.** Tier 2/3 cities are the opportunity — not afterthoughts.
5. **Privacy is growth.** Users who trust us stay and refer more.
6. **Zero ad spend.** If it needs money, it needs a better idea.

### Growth Funnel

```
Awareness  → WhatsApp shares, Reddit posts, campus events
  │
Interest   → "Verified profiles only" + "AI matching by values"
  │
Signup     → Referral code on signup (friends get Premium)
  │
Activation → Profile completion (3 prompts + 1 photo = 60%)
  │
Retention  → Daily picks, icebreakers, voice notes
  │
Referral   → "Invite 3 friends, get 1 week Premium"
```

---

## 2. Referral Program

### Structure

| Tier | Referrals | Reward |
|------|-----------|--------|
| 🥉 | 3 qualified | 1 week Premium |
| 🥈 | 5 qualified | 2 weeks Premium |
| 🥇 | 10 qualified | 1 month Premium |

**"Qualified"** = referee signs up AND completes 50%+ profile.
This prevents gaming with fake accounts.

### Implementation

- **Code:** `lib/referral.ts` — Firestore-based tracking
- **UI:** `components/ReferralSystem.tsx` — share, track, claim
- **Deep link:** `bandhan.ai/?ref=PRIYA-A3K7`
- **Anti-spam:** 30s share cooldown, max 20 referrals, device fingerprint

### Where to Surface

- Profile screen → "Invite Friends" card (always visible)
- After first match → "Share the love! Invite friends" prompt
- Settings → Referral program section
- Onboarding completion → "Know someone who'd love this?"

---

## 3. WhatsApp Growth Strategy

WhatsApp is the #1 distribution channel in India. 500M+ Indian users.

### Pre-Written Share Messages

#### English Template
```
Hey! I've been using Bandhan AI for matchmaking and it's genuinely
impressive. 🤝

The AI matching is really smart — it matched me based on values,
not just photos. Plus it's privacy-first and verified profiles only.

Try it out: https://bandhan.ai/?ref={CODE}

Use my code {CODE} when signing up — we both get rewards! 🎁
```

#### Hindi Template
```
अरे! मैं Bandhan AI इस्तेमाल कर रहा/रही हूँ — मैचमेकिंग के लिए
सच में बढ़िया है। 🤝

AI मैचिंग बहुत स्मार्ट है — सिर्फ़ फोटो नहीं, values के हिसाब
से मैच करता है। प्राइवेसी-फर्स्ट है और सभी प्रोफ़ाइल verified हैं।

यहाँ ट्राई करो: https://bandhan.ai/?ref={CODE}

साइन अप करते समय मेरा कोड {CODE} डालो — दोनों को रिवॉर्ड
मिलेगा! 🎁
```

### WhatsApp Status Strategy

Encourage users to post their "Match Insights" screenshot (blurred names) as WhatsApp status:
- "87% compatibility! Bandhan AI really knows me 🤯"
- Template available in app → Profile → Share Status

### Rules

- ❌ NO auto-sharing to contacts (spam)
- ❌ NO WhatsApp broadcast lists
- ✅ User manually shares to chosen contacts
- ✅ One pre-filled message, user can edit before sending

---

## 4. Instagram Organic Strategy

### Instagram Story Templates (Canva Free Tier)

Create templates at [canva.com](https://www.canva.com) (free account):

#### Template 1: "Found My Match"
- **Background:** White
- **Text:** Bold black comic-style "FOUND MY MATCH 🤝"
- **Subtext:** "Thanks to Bandhan AI's values-based matching"
- **Footer:** "bandhan.ai | Code: {CODE}"
- **Size:** 1080x1920px (IG Story)

#### Template 2: "Compatibility Score"
- **Background:** Off-white with comic panel border
- **Text:** "87% COMPATIBLE 🎯"
- **Subtext:** "AI that actually understands Indian values"
- **Footer:** "Try it → bandhan.ai"

#### Template 3: "Success Story"
- **Background:** White with thick black border
- **Text:** User testimonial quote in comic speech bubble
- **Names:** "— Priya & Rohan, Mumbai"
- **Footer:** "bandhan.ai | #BandhanAI"

#### Template 4: "Profile Prompt Answer"
- **Background:** Comic panel style
- **Header:** "My ideal weekend involves..."
- **Content:** User's actual prompt answer
- **Footer:** "What's yours? → bandhan.ai"

### Canva Template Links

Create these templates on Canva and share the links in the app:
1. Go to canva.com → Create Design → Instagram Story
2. Use black & white theme (matches our comic aesthetic)
3. Save as template → Share link
4. Embed link in app: Profile → Share → Instagram Story

### Hashtag Strategy (free reach)

Primary: `#BandhanAI`
Secondary: `#MadeInIndia` `#IndianMatchmaking` `#AIMatchmaking`
Niche: `#IndianWedding` `#ShaadiSeason` `#DesiLove` `#MillennialMatchmaking`

### Posting Schedule (free)

- Monday: #MotivationMonday — Success story quote
- Wednesday: Profile prompt of the week
- Friday: Fun icebreaker question (poll sticker)
- Sunday: User testimonial spotlight

---

## 5. Twitter / X Strategy

### Tweet Templates

**Product launch:**
```
We built Bandhan AI because Indian matchmaking deserves better than
swiping on photos.

✅ AI matching based on values, not just looks
✅ DigiLocker verified profiles
✅ Voice notes instead of "hey"
✅ Family-friendly (parents can co-browse)

Try it free: bandhan.ai

#BandhanAI #MadeInIndia
```

**Feature highlight:**
```
Why do dating apps match you by photos but ignore values?

Bandhan AI's matching algorithm considers:
🎯 Life goals alignment (35%)
🤝 Shared values (25%)
🏠 Lifestyle match (20%)
📍 Location proximity (12%)
👨‍👩‍👧 Family compatibility (8%)

This is matchmaking, reimagined. #BandhanAI
```

---

## 6. Reddit Strategy

### Target Subreddits

| Subreddit | Strategy | Frequency |
|-----------|----------|-----------|
| r/india | AMA: "We built an AI matchmaking app" | Monthly |
| r/indianpeoplequora | Light-hearted memes about matchmaking | Weekly |
| r/developersIndia | Open-source tech decisions blog | Bi-weekly |
| r/Arrangedmarriage | Answer genuine questions, subtle mention | As needed |
| r/startups | Growth case study ("0 to 10K users with ₹0") | Quarterly |

### AMA Template

**Title:** "We're building Bandhan AI — an AI-powered matchmaking app for India. AMA!"

**Body:**
```
Hi r/india! 👋

We're a small team building Bandhan AI — a matchmaking app
designed specifically for Indian culture.

What makes us different:
- AI matches based on values, not just photos
- DigiLocker verification (no catfishing)
- Voice notes in any Indian language
- Family co-browsing mode
- Comic book UI (because why not?)

We spent ₹0 on ads. Everything is community-driven.

Ask us anything about:
- Building for Indian users
- AI matchmaking algorithms
- Privacy-first design
- Starting up with zero budget

Proof: [screenshot of app] | bandhan.ai
```

### Reddit Rules

- ❌ NO self-promotion without value (instant ban)
- ✅ Answer questions genuinely, mention app only if relevant
- ✅ Share technical learnings (r/developersIndia loves this)
- ✅ Be transparent about being the creators

---

## 7. Campus Ambassador Program

### Overview

College students promote Bandhan AI on campus in exchange for:
- Premium access for the semester
- Certificate of campus leadership
- LinkedIn recommendation from founding team
- Early access to new features

### Ambassador Tiers

| Tier | Name | Requirements | Perks |
|------|------|-------------|-------|
| 🌱 | Scout | 10 signups | 1 month Premium + Certificate |
| 🌿 | Champion | 25 signups | 3 months Premium + LinkedIn rec |
| 🌳 | Legend | 50 signups | 6 months Premium + Founding team call |

### Ambassador Responsibilities

1. **Share in college WhatsApp groups** (1 message per group, once)
2. **Put up posters** in hostel common rooms (we provide PDF)
3. **Run a 30-min session** during college fest or club meetup
4. **Collect feedback** from 5 users and share with us
5. **Post 1 Instagram story** per month about the app

### Ambassador Application

Students apply via Google Form (free):

```
Bandhan AI Campus Ambassador Application

1. Full name
2. College name
3. City
4. Year of study
5. WhatsApp number
6. Instagram handle
7. Why do you want to be a Bandhan AI ambassador? (50 words)
8. How many people can you reach on campus? (estimate)
9. Any relevant club/society memberships?

Submit → Review within 48 hours → WhatsApp onboarding call
```

### Ambassador Onboarding

1. **Welcome kit** (digital, free):
   - A4 poster PDF (print at college)
   - Instagram story templates (Canva links)
   - WhatsApp share message
   - Referral code with tracking
   - FAQ sheet for questions

2. **30-min WhatsApp call** with growth lead:
   - Product walkthrough
   - Do's and don'ts (privacy, no spam)
   - Goal-setting for first month
   - Q&A

3. **Monthly check-in** (5-min WhatsApp call):
   - Progress review
   - Feedback collection
   - Strategy adjustments

### Target Colleges (Phase 1)

Start with engineering/management colleges — tech-savvy, socially active:

| City | Colleges | Why |
|------|----------|-----|
| Mumbai | IIT-B, VJTI, NMIMS | Tech + business mix |
| Delhi | IIT-D, DTU, NSIT, SRCC | Largest student population |
| Bangalore | RVCE, PES, Christ University | Tech hub |
| Pune | COEP, Symbiosis, MIT-WPU | Young professionals |
| Hyderabad | IIT-H, BITS Hyd, IIIT-H | Tech-forward |
| Chennai | IIT-M, Anna University, SRM | South India entry |

### Campus Poster Design (A4, printable)

```
┌─────────────────────────────────┐
│  ┌──────────────────────────┐   │
│  │                          │   │
│  │   TIRED OF SWIPING?      │   │
│  │                          │   │
│  │   Try AI-powered         │   │
│  │   matchmaking.           │   │
│  │                          │   │
│  │   ▪ Values-based matching │   │
│  │   ▪ Verified profiles     │   │
│  │   ▪ Voice notes           │   │
│  │   ▪ Family-friendly       │   │
│  │                          │   │
│  │   ┌──────────────┐      │   │
│  │   │  [QR CODE]   │      │   │
│  │   │  bandhan.ai  │      │   │
│  │   └──────────────┘      │   │
│  │                          │   │
│  │   Code: {AMBASSADOR_CODE}│   │
│  │                          │   │
│  └──────────────────────────┘   │
│                                 │
│  BANDHAN AI — Matchmaking,      │
│  reimagined.                    │
└─────────────────────────────────┘
```

---

## 8. College Festival Partnerships

### Strategy

Partner with college fests (free stall, we provide content):

1. **Approach fest organizers** via ambassadors
2. **Offer:** Free interactive booth (we provide materials)
3. **Booth setup:** QR code standee + "Find Your Compatibility" quiz
4. **Interactive element:** Two people scan → get compatibility % (fun, not real matching)
5. **Signups:** Everyone who participates gets a referral code

### Materials Needed (all free to produce)

- QR code standee (printed A3 poster)
- "Compatibility Quiz" cards (printed A5)
- Instagram story filter idea (student volunteers design)
- Stickers (optional, print at local shop for ₹500 batch)

### Target Fests (Annual)

| Fest | College | City | Timing |
|------|---------|------|--------|
| Mood Indigo | IIT Bombay | Mumbai | December |
| Saarang | IIT Madras | Chennai | January |
| Rendezvous | IIT Delhi | Delhi | October |
| BITS Pilani Fest | BITS | Pilani | January |
| Malhar | St. Xavier's | Mumbai | August |
| St. Stephen's Fest | St. Stephen's | Delhi | February |

---

## 9. User-Generated Content Contests

### Contest 1: "Best Profile Prompt" (Monthly)

- **Theme:** Best answer to a profile prompt
- **Submit:** Screenshot of your prompt answer → Instagram with #BandhanPrompt
- **Prize:** 1 month Premium for winner + featured on app
- **Judging:** Community vote (most likes on our repost)

### Contest 2: "Icebreaker of the Month"

- **Theme:** Suggest a new icebreaker question
- **Submit:** Google Form or WhatsApp message
- **Prize:** Question added to the app with your name as contributor
- **Frequency:** Monthly

### Contest 3: "Success Story Spotlight" (Quarterly)

- **Theme:** Couples share how Bandhan AI connected them
- **Submit:** Via in-app Success Story form
- **Prize:** Featured on website homepage + 3 months Premium
- **Privacy:** First names only, couple must consent

### Contest 4: "Design Challenge" (One-time launch)

- **Theme:** Design a comic-book style sticker/emoji for the app
- **Submit:** Post on Instagram with #BandhanDesign
- **Prize:** Sticker added to app + credited + 3 months Premium
- **Tools:** Canva free, Figma free, pen & paper photo

---

## 10. Local Language Meetups

### Concept

Organize free local meetups (not dates) for Bandhan AI users:

- **Format:** 10-20 people, coffee shop, 90 minutes
- **Activity:** Icebreaker games using app's question bank
- **Zero pressure:** No matching at the event, purely social
- **Safety:** Public venue, group setting, opt-in only

### Implementation

1. User opts in via app: Profile → Events → "Join local meetup"
2. We group by city when 10+ people opt in
3. Ambassador picks venue (free or cheap coffee shop)
4. WhatsApp group created for attendees (48 hours before)
5. Event happens → photos shared (with consent) → social proof

### City Launch Order

| Phase | Cities | Timeline |
|-------|--------|----------|
| 1 | Mumbai, Delhi, Bangalore | Month 3 |
| 2 | Pune, Hyderabad, Chennai | Month 5 |
| 3 | Ahmedabad, Kolkata, Jaipur | Month 8 |

---

## 11. Community WhatsApp Group

### Purpose

Direct feedback channel from early users to the team.

### Structure

- **Main group:** "Bandhan AI Community" (max 256 members)
- **Sub-groups** by city if demand grows
- **Admin:** 2-3 team members + 1 trusted ambassador per city

### Rules (pinned message)

```
🤝 Bandhan AI Community Rules

1. Be respectful. No casteism, sexism, or hate.
2. This is for product feedback — not a dating group.
3. No spam, ads, or promoting other apps.
4. Share bugs, ideas, and feature requests.
5. Hindi, English, and Hinglish all welcome.
6. Don't share anyone else's personal info.
7. Team members have [TEAM] in their name.
8. Off-topic? Take it to DM.

Report issues: security@bandhan.ai
```

### Weekly Cadence

| Day | Activity |
|-----|----------|
| Monday | "What should we build next?" poll |
| Wednesday | Bug report collection |
| Friday | Feature preview / sneak peek |
| Sunday | Fun icebreaker question of the week |

---

## 12. Testimonial Collection Flow

### In-App Flow

1. **Trigger:** After 30 days of being matched + at least 50 messages exchanged
2. **Prompt:** "How's your Bandhan AI experience so far?" (notification)
3. **Form:** 3 fields:
   - Star rating (1-5)
   - One-line review (max 140 chars)
   - Would you recommend? (Yes/No)
4. **If positive (4-5 stars):** "Would you like to share your experience?"
   - Links to: Google Play review / in-app Success Story form
5. **If negative (1-3 stars):** "What can we improve?"
   - Private feedback → team inbox (not public)

### Review Collection Flow

```
User hits 30-day milestone
  │
  ├── Happy (4-5 stars)?
  │     ├── "Share on Google Play!" → Play Store deep link
  │     ├── "Share on Instagram?" → Story template with code
  │     └── "Submit a success story?" → In-app form
  │
  └── Unhappy (1-3 stars)?
        └── "Tell us what to improve" → Private form → Team review
```

### Testimonial Templates (for user to copy-paste)

**Google Play / App Store:**
```
Bandhan AI is genuinely different from other matchmaking apps.
The AI matching based on values (not just photos) is spot-on.
Verified profiles give real confidence. And the voice notes
feature adds a personal touch that text can't match. ⭐⭐⭐⭐⭐
```

**Hindi:**
```
Bandhan AI सच में बाकी मैचमेकिंग ऐप्स से अलग है। Values के
हिसाब से AI मैचिंग बिल्कुल सही है। Verified प्रोफ़ाइल से
भरोसा बढ़ता है। और voice notes फीचर एक personal touch देता है
जो text से नहीं मिलता। ⭐⭐⭐⭐⭐
```

---

## 13. Community Interaction Guidelines

### For Users

1. **Be genuine** — Your real self is your best self
2. **Be respectful** — Treat others as you'd want your sibling treated
3. **Be patient** — Good matches take time, not spam
4. **Be safe** — Meet in public, tell someone, trust your instincts
5. **Be a good community member** — Report bad actors, praise good ones

### For Ambassadors

1. **Never pressure** — Share once, respect silence
2. **Never misrepresent** — Be honest about what the app does and doesn't do
3. **Never share data** — User information stays private
4. **Be available** — Respond to questions from signups you referred
5. **Be a role model** — Your behavior represents the brand

### For Team

1. **Respond within 24 hours** to community messages
2. **Be transparent** about bugs, delays, and decisions
3. **Credit the community** — every feature idea from users gets attribution
4. **Never sell data** — repeat this publicly, often
5. **Ship fast** — the best community management is a great product

---

## 14. Anti-Spam Policy

### Referral System Anti-Spam

| Protection | Implementation |
|------------|---------------|
| Max 20 referrals per user | Firestore counter, hard cap |
| 50% profile completion required | Referee must be real |
| 30-second share cooldown | Client-side localStorage |
| Same-device detection | localStorage fingerprint |
| Self-referral blocked | UID comparison |
| Referral code expires after 90 days of inactivity | Cron check |

### Community Anti-Spam

| Protection | Implementation |
|------------|---------------|
| WhatsApp group: no links except bandhan.ai | Admin moderation |
| Instagram: no follow-for-follow chains | Community reporting |
| Reddit: follow subreddit rules strictly | Team oversight |
| Campus: 1 WhatsApp message per group max | Ambassador guidelines |

### What Counts as Spam

🚫 Sending referral link to strangers
🚫 Posting in unrelated WhatsApp groups
🚫 Mass DMs on Instagram
🚫 Fake accounts to hit referral milestones
🚫 Buying followers/reviews

### Consequences

| Offense | Action |
|---------|--------|
| First | Warning + referral rewards paused |
| Second | Referral program revoked permanently |
| Third | Account suspension review |

---

## 15. Measurement & KPIs

### Monthly Growth Dashboard (Zero-Cost Tracking)

Track via Umami (self-hosted, free):

| Metric | Target (Month 3) | Target (Month 6) |
|--------|-------------------|-------------------|
| Total signups | 2,000 | 10,000 |
| DAU | 200 | 1,500 |
| Referral signup % | 30% | 40% |
| Profile completion rate | 60% | 70% |
| Match rate (likes → matches) | 15% | 20% |
| Message response rate | 40% | 50% |
| Campus ambassadors | 20 | 50 |
| Cities covered | 6 | 15 |
| WhatsApp community size | 100 | 500 |

### Attribution Tracking

Every signup source tagged:

| Source | How Tracked |
|--------|-------------|
| Referral | `?ref=CODE` in URL |
| Campus event | `?src=campus_{college}` |
| Reddit AMA | `?src=reddit_{date}` |
| Instagram bio | `?src=instagram` |
| Organic/direct | No params |

### Weekly Growth Meeting (15 min)

1. New signups this week vs last week
2. Top referral codes (who's driving growth?)
3. Top cities (where are users coming from?)
4. NPS / sentiment from WhatsApp community
5. One action item for next week

---

*This playbook is a living document. Updated monthly based on what's working.*
*Last updated: February 28, 2026*
