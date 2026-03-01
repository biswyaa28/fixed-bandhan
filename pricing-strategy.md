# Bandhan AI — Pricing Strategy

> **Version:** 2026-02-28-v1
> **Author:** Product Team
> **Review Cycle:** Quarterly

---

## Table of Contents

1. [Pricing Philosophy](#1-pricing-philosophy)
2. [Plan Structure](#2-plan-structure)
3. [Feature Gating Strategy](#3-feature-gating-strategy)
4. [Free-to-Paid Conversion Funnel](#4-free-to-paid-conversion-funnel)
5. [Trial Strategy](#5-trial-strategy)
6. [Payment Methods](#6-payment-methods)
7. [Refund Policy](#7-refund-policy)
8. [Competitive Analysis](#8-competitive-analysis)
9. [Pricing Experiments Roadmap](#9-pricing-experiments-roadmap)
10. [GST & Compliance](#10-gst--compliance)

---

## 1. Pricing Philosophy

### Core Principles

1. **Value-first free tier** — The free plan must be genuinely useful, not crippled. Users should find matches and have real conversations before ever seeing an upgrade prompt.

2. **Fair daily limits** — 5 profiles/day + 2 new conversations/day is enough for a serious, deliberate user. We're not building a swipe-factory; we're building a marriage platform.

3. **No dark patterns** — No hidden charges, no confusing auto-renewals, no "cancel traps." One-tap cancellation. Clear refund policy. GST-inclusive pricing.

4. **UPI-first** — 85%+ of Indian digital payments happen via UPI. It must be the default, fastest, and most prominent payment option.

5. **Family is a feature, not an afterthought** — Indian marriage decisions involve families. The Family Plan (₹799/mo for 2 profiles + parent dashboard) addresses a real, unmet need.

### Pricing Anchors

| Signal | Target |
|--------|--------|
| Monthly premium price | ₹499 (~₹17/day — "less than a cup of chai") |
| Yearly premium price | ₹2,999 (~₹8/day — 40% savings vs monthly) |
| Family plan | ₹799/mo (~₹13/profile/day — "two chai for two profiles") |
| Competitor benchmark | Shaadi.com ₹1,000-₹5,000/mo; Bharat Matrimony ₹500-₹3,000/mo |

---

## 2. Plan Structure

### Free Plan (₹0)

| Feature | Limit |
|---------|-------|
| Profile views/day | 5 |
| New conversations/day | 2 |
| Filters | Basic (age, city, religion) |
| Special Interest | 1/week |
| Safety features | ✅ Full access |
| Verification | ✅ Full access |
| Perfect Match | 1/day |
| Spotlight | ❌ |
| Video calling | ❌ |
| Family View PDF | ❌ |
| Compatibility insights | ❌ |
| Advanced filters | ❌ |
| Read receipts | ❌ |

**Design intent:** Enough to evaluate the platform and have 1-2 meaningful conversations per day. The limit creates natural daily engagement without frustration.

### Premium Monthly (₹499/month)

| Feature | Limit |
|---------|-------|
| Profile views/day | Unlimited |
| Conversations/day | Unlimited |
| Filters | Advanced (caste, gotra, income, education) |
| Special Interest | Unlimited |
| Premium Interest | 3/week |
| Spotlight | 3/week |
| Safety features | ✅ |
| Verification | ✅ |
| Perfect Match | 3/day |
| Video calling | ✅ |
| Family View PDF | ✅ |
| Compatibility insights | ✅ |
| Priority matching | ✅ |
| Read receipts | ✅ |

### Premium Yearly (₹2,999/year)

Same features as Premium Monthly, plus:
- **40% savings** (₹2,999 vs ₹5,988 yearly if paid monthly)
- **5 Premium Interests/week** (vs 3)
- **5 Spotlights/week** (vs 3)
- **"Most Popular" badge** — shown prominently in plan comparison

### Family Plan (₹799/month)

Everything in Premium, plus:
- **2 profile slots** (for siblings)
- **Parent dashboard** — parents can view suggested matches for both children
- **Shared preferences** — family-wide matching criteria
- **Family View PDF** — for both profiles

---

## 3. Feature Gating Strategy

### Principle: Gate features that amplify, not features that enable

| Category | Free | Premium |
|----------|------|---------|
| **Core matching** | ✅ (limited quantity) | ✅ (unlimited) |
| **Chat** | ✅ (limited new/day) | ✅ (unlimited) |
| **Safety** | ✅ (never gated) | ✅ |
| **Verification** | ✅ (never gated) | ✅ |
| **Quality signals** | ❌ (compatibility %, insights) | ✅ |
| **Efficiency tools** | ❌ (advanced filters, read receipts) | ✅ |
| **Visibility boosts** | ❌ (spotlight, priority) | ✅ |
| **Family features** | ❌ (PDF, parent dashboard) | ✅ |

### Never Gated (Safety First)
- Safety button ("Share My Date")
- Report/block functionality
- Identity verification
- Content moderation
- Privacy settings

---

## 4. Free-to-Paid Conversion Funnel

### Conversion Triggers (in order of effectiveness)

| Trigger | When | Expected CTR |
|---------|------|-------------|
| **Daily limit reached** | After 5th profile view | 8-12% tap "Upgrade" |
| **Compatibility locked** | Viewing a high-match profile | 5-8% |
| **"Who Liked You" blur** | Seeing blurred profile in Likes tab | 10-15% |
| **Family View prompt** | When parent asks to see PDF | 15-20% |
| **Spotlight upsell** | After 3 days with <2 matches | 3-5% |
| **Trial expiry** | Day 6 of 7-day trial | 25-35% |

### Upsell UI Rules

1. **Maximum 1 upsell per session** — never show multiple upgrade prompts
2. **"Remind Me Tomorrow" always available** — no forced choice
3. **Show value, not pressure** — "Unlock 87% compatibility score" not "You're missing out!"
4. **Bilingual** — all upsells in English + Hindi
5. **Dismissable** — every upsell can be closed with one tap

### Target Conversion Rate

| Metric | Target (Y1) | Benchmark |
|--------|-------------|-----------|
| Free → Trial | 15% | Bumble: 12%, Hinge: 18% |
| Trial → Paid | 35% | Industry avg: 25-40% |
| Free → Paid (direct) | 3.5% | Tinder India: 3%, Shaadi: 5% |

---

## 5. Trial Strategy

### 7-Day Free Trial

**Eligibility:**
- One trial per account (tied to phone number, not device)
- Available on Premium Monthly, Premium Yearly, and Family plans
- No payment required during trial (charged on Day 8 if not cancelled)

**Trial Experience:**
| Day | Action |
|-----|--------|
| Day 1 | Full Premium access begins. Welcome notification. |
| Day 3 | "You've viewed 47 profiles — 3× more than free!" notification |
| Day 5 | "2 days left — don't lose your matches" notification |
| Day 6 | "Last day tomorrow — add payment to continue" notification |
| Day 7 | Final day. In-app banner: "Trial ends tonight at midnight IST" |
| Day 8 | If payment added: auto-charge. If not: downgrade to Free. |

**Anti-Abuse:**
- One trial per phone number (even if account is deleted and re-created)
- Trial tracked via `trialUsed: boolean` on user document
- Cannot create a new trial by switching plans

---

## 6. Payment Methods

### Priority Order (India)

| Method | Priority | Gateway Fee | Expected Usage |
|--------|----------|------------|----------------|
| **UPI (QR scan)** | 1st | 0% | 50% |
| **UPI (VPA collect)** | 2nd | 0% | 20% |
| **UPI (intent/deep-link)** | 3rd | 0% | 15% |
| **Debit Card** | 4th | 2% | 8% |
| **Credit Card** | 5th | 2% | 4% |
| **Netbanking** | 6th | 2% | 2% |
| **Wallet (Paytm/PhonePe)** | 7th | 2% | 1% |

### Payment Provider: Razorpay

- **Why Razorpay:** No setup cost, 0% on UPI, 2% on cards, strong Indian support
- **Integration:** Razorpay Standard Checkout + UPI Intent SDK
- **Webhooks:** For payment confirmation, renewal, and failure notifications
- **Dashboard:** Admin dashboard for refunds, disputes, and analytics

### Auto-Renewal

- Enabled for monthly and yearly plans via Razorpay Subscriptions API
- 3-day grace period on failed renewals before downgrade
- User notified via SMS + in-app notification on renewal failure
- User can retry payment from Settings → Subscription

---

## 7. Refund Policy

### Full Refund (100%)

- Within 48 hours of purchase
- AND no premium features used (unlimited views, advanced filters, etc.)
- Processing: 5-7 business days via original payment method

### Partial Refund

- Not offered (to keep things simple and fair)
- Users who cancel get full access until period end

### No Refund

- After 48 hours
- OR after any premium feature has been used
- Trial subscriptions (no payment was made)

### Process

1. User goes to Settings → Subscription → Request Refund
2. System checks eligibility automatically
3. If eligible: confirm → Razorpay refund API → confirmation SMS
4. If not eligible: show reason + suggest cancellation instead

---

## 8. Competitive Analysis

### Indian Marriage Platforms

| Platform | Free Tier | Premium Price | Key Differentiator |
|----------|-----------|--------------|-------------------|
| **Shaadi.com** | Browse only, no messaging | ₹1,000-₹5,000/mo | Established brand, large user base |
| **Bharat Matrimony** | Basic profile | ₹500-₹3,000/mo | Regional language support |
| **Jeevansathi** | Limited profiles | ₹800-₹2,500/mo | Astrology matching |
| **Hinge (India)** | 8 likes/day | ₹1,199/mo (HingeX) | "Designed to be deleted" messaging |
| **Bumble (India)** | Limited swipes | ₹999/mo | Women message first |
| **Bandhan AI** | 5 views + 2 chats/day | **₹499/mo** | AI matching + family features + safety |

### Our Advantage

1. **Lowest premium price** among marriage platforms (₹499 vs ₹500-₹5,000)
2. **Unique Family Plan** — no competitor offers this
3. **7-day free trial** — Shaadi and Bharat Matrimony don't offer trials
4. **UPI-first** — faster checkout than competitors using card-first flows
5. **Safety features never gated** — builds trust, unlike competitors who gate basic safety

---

## 9. Pricing Experiments Roadmap

### Q1 2026 (Launch)
- Launch with current pricing (₹499/mo, ₹2,999/yr, ₹799 family)
- Measure: conversion rate, ARPU, churn, trial-to-paid

### Q2 2026
- **A/B test: ₹399/mo vs ₹499/mo** — measure volume vs ARPU tradeoff
- **A/B test: 3-day vs 7-day trial** — measure trial-to-paid conversion
- **A/B test: annual plan ₹2,499 vs ₹2,999** — measure annual uptake

### Q3 2026
- **Introduce regional pricing** — lower prices for Tier 2/3 cities (where ₹499 is more significant)
  - Metro (Mumbai, Delhi, Bangalore): ₹499/mo
  - Tier 1 (Pune, Hyderabad, Chennai): ₹449/mo
  - Tier 2+ (Lucknow, Jaipur, Indore): ₹349/mo
- **Introduce à la carte purchases** — buy individual Spotlights (₹49 each) without subscription

### Q4 2026
- **Couple verification badge** — ₹199 one-time for both partners after match success
- **Wedding services marketplace** — commission-based (venue, photographer, caterer referrals)
- **Premium+ tier** — ₹999/mo with dedicated matchmaker

---

## 10. GST & Compliance

### GST Treatment

| Item | Rate | HSN/SAC Code |
|------|------|-------------|
| Premium subscription | 18% IGST | SAC 998314 (Online content) |
| Family plan | 18% IGST | SAC 998314 |
| À la carte purchases | 18% IGST | SAC 998314 |

### Pricing Display Rules

1. **All displayed prices include GST** — user sees ₹499, not ₹423 + ₹76 GST
2. **Invoice shows GST breakdown** — base amount + GST amount
3. **GST number displayed on invoices** — when available (Razorpay handles this)

### Invoice Generation

- Auto-generated by Razorpay on each successful payment
- Sent to user's registered email (if available)
- Also downloadable from Settings → Subscription → Billing History
- Contains: Invoice #, Date, Plan, Base amount, GST amount, Total, Payment method

### Consumer Protection Act Compliance

- Clear pricing before purchase (no hidden charges)
- Easy cancellation (1 tap in Settings)
- Transparent refund policy (displayed before purchase)
- No auto-renewal without clear notification (SMS + in-app)
- Trial terms clearly stated (7 days, no charge, cancel anytime)

---

**© 2026 Bandhan AI. Internal document.**
