# Bandhan AI — Investor FAQ

> Anticipated tough questions and prepared answers.

---

## Market & Competition

### Q: How are you different from Shaadi.com or Bharat Matrimony?

**A:** Three key differences:
1. **Cost:** We're ₹499/month vs their ₹5,000-25,000/year. 10× cheaper.
2. **Technology:** AI compatibility scoring vs basic keyword matching. DigiLocker verification vs manual "trust me" profiles.
3. **UX:** Modern mobile-first design vs 2010-era web portals. Our average user is 22-30; Shaadi.com's is 28-38.

We don't compete with them — we capture the generation that finds them irrelevant.

### Q: What stops Tinder/Bumble from adding marriage features?

**A:** Cultural DNA. Tinder's entire brand, algorithm, and business model is built around casual swiping. Adding "marriage intent" would confuse their core user base and dilute their brand. We've seen Bumble try with "relationship goals" — it's a checkbox, not a feature. Our entire product is designed around marriage from the ground up: Family View PDF, DigiLocker verification, the 5-factor compatibility algorithm — these aren't bolt-ons.

### Q: What's your moat?

**A:** Three layers:
1. **Data moat:** Our compatibility algorithm improves with every match. More users = better matches = more users (network effect + data flywheel).
2. **Trust moat:** DigiLocker integration requires government partnerships and technical expertise. We were first to market.
3. **Cultural moat:** Family View PDF, bilingual UX, Indian-specific dealbreakers (vegetarian, relocation, joint family) — these require deep cultural understanding, not just translation.

---

## Business Model

### Q: Why will users pay ₹499/month when Tinder is free?

**A:** Because Tinder is free for casual dating. Marriage is the most important decision of an Indian's life — they (and their families) will pay for a tool that works. Shaadi.com charges ₹5,000+/year and has millions of paying users. We're 10× cheaper with a better product. The 7-day free trial removes risk.

### Q: What's your churn rate? That 8% monthly seems high.

**A:** 8% is actually the industry average for dating/matrimony apps. But here's the positive side: our users churn because they *found someone* — that's success, not failure. We'll track "happy churn" (found partner) vs "unhappy churn" (disappointed) separately. Happy churn drives referrals and success stories.

### Q: How do you acquire users at ₹200 CAC with zero marketing budget?

**A:** Organic channels:
- **Referral program:** "Invite 3 friends, get 1 week Premium free" — dating apps have inherent virality (people recommend to single friends).
- **Campus ambassadors:** College students promote for free in exchange for Premium access and resume credit.
- **Content marketing:** SEO blog about Indian dating/marriage culture — high-intent search traffic.
- **WhatsApp virality:** Family View PDF is designed to be shared — every share is a marketing touchpoint.

Year 1 is organic only. Paid acquisition starts in Year 2 when unit economics are proven.

---

## Product & Technology

### Q: How accurate is your AI matching algorithm?

**A:** We score 5 weighted factors (intent 35%, values 25%, lifestyle 20%, location 12%, family 8%). In beta, users who matched above 80% compatibility had a 3× higher message response rate than those below 60%. We plan to A/B test and refine weights continuously.

The algorithm isn't magic — it's structured compatibility scoring. The real innovation is what we score (Indian-specific factors like family structure, relocation willingness, dietary preferences) rather than how we score.

### Q: What happens when you scale to 1M users? Can the tech handle it?

**A:** Yes. We're built on Firebase (Google Cloud) which auto-scales. Our architecture:
- Firestore handles real-time chat and matching at any scale (Google's infrastructure).
- Static assets served from Firebase Hosting CDN (global edge caching).
- Image compression happens client-side (no server load).
- Cost scales linearly: at 1M MAU, Firebase costs ~$2,000-3,000/month — well within our revenue.

---

## Team & Execution

### Q: Why are you the right team to build this?

**A:** [Customize with actual founder backgrounds]
- We experienced this problem firsthand — navigating Indian marriage expectations with modern dating tools that don't fit.
- We've built the full MVP with zero external funding — demonstrates execution capability.
- We understand both the technical (AI, verification systems) and cultural (family dynamics, regional differences) layers.

### Q: What's the biggest risk?

**A:** User acquisition speed. We have a strong product but dating apps are a two-sided marketplace — you need critical mass in each city to be useful. Our mitigation: launch city-by-city (Mumbai → Bangalore → Delhi → Pune) rather than pan-India, ensuring density. Campus ambassador program provides concentrated user clusters.

Second risk: app store approval delays. We've built compliance in from day one (DPDP Act, content moderation, age gating) to minimize rejection risk.

---

## Financials

### Q: When do you become profitable?

**A:** Month 18. With ₹25L pre-seed runway (6 months), we reach 10K MAU and ₹1L MRR. Seed round at Month 12 (₹1Cr) funds growth to 50K MAU and ₹6L MRR. At 50K MAU with 3.5% conversion, monthly revenue (₹6.1L) exceeds monthly costs (₹4L) = profitable.

### Q: What if conversion rate is lower than 3.5%?

**A:** Sensitivity analysis:
- At 2.5% conversion: Break-even at Month 22 (4 months later). Still viable.
- At 1.5% conversion: Need to raise seed round earlier or cut costs. Would pivot to higher-ARPU features (matchmaker concierge at ₹2,000/month).
- Industry benchmarks: Tinder India ~3%, Bumble ~4%, Shaadi.com ~5%. Our 3.5% target is conservative.

### Q: What's the exit path?

**A:** Three options:
1. **Acquisition** by Shaadi.com/Bharat Matrimony (they need younger users and modern tech — we're the perfect acquisition target at $10-50M).
2. **Acquisition** by global player (Match Group, Bumble Inc.) entering India market seriously.
3. **Independent growth** to profitability — this is a cash-generative business. At 500K MAU with 4.5% conversion, we generate ₹60L+/month profit. No need to exit if we don't want to.

We're building to last, not to flip.
