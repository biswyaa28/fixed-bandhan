# Bandhan AI — Financial Assumptions

> **Version:** 2026-02-28
> **Basis:** Indian matrimony/dating market benchmarks, conservative estimates
> **Review:** Quarterly — adjust based on actual data

---

## User Growth Assumptions

| Parameter | Value | Basis |
|-----------|-------|-------|
| Month 1 MAU | 500 | Beta users + launch cohort |
| Month 6 MAU | 10,000 | Campus + referral growth |
| Month 12 MAU | 50,000 | Organic + content + referral |
| Monthly growth rate (Y1) | 30-40% | Typical for early-stage dating apps in India |
| Monthly growth rate (Y2) | 15-20% | Maturing growth with paid channels |
| Monthly growth rate (Y3) | 8-12% | Market penetration phase |
| Organic signup share (Y1) | 60% | Word-of-mouth + referrals |
| Referral signup share (Y1) | 25% | Invite 3 → 1 week Premium program |
| Content/SEO share (Y1) | 15% | Blog + social media |

## Revenue Assumptions

| Parameter | Value | Basis |
|-----------|-------|-------|
| Free-to-paid conversion (Y1) | 3.5% | Tinder India: ~3%, Bumble: ~4% |
| Free-to-paid conversion (Y2) | 4.0% | Product maturity + better onboarding |
| Free-to-paid conversion (Y3) | 4.5% | AI improvements + family plan traction |
| ARPU (blended, monthly) | ₹350 | Mix: 70% monthly ₹499, 20% annual ₹250/mo, 10% family ₹799 |
| Monthly churn (paid) | 8% | Industry average for Indian dating apps |
| Average subscription length | 4.2 months | 1 / churn_rate |
| LTV per paid user | ₹4,200 | ARPU × avg_months × (1 + referral_value) |
| Trial-to-paid conversion | 40% | 7-day trial, active users convert |

## Expense Assumptions

| Category | Y1 Monthly | Y2 Monthly | Y3 Monthly | Notes |
|----------|-----------|-----------|-----------|-------|
| **Engineering (salaries)** | ₹1,50,000 | ₹6,00,000 | ₹15,00,000 | 1 eng Y1 → 3 Y2 → 6 Y3 |
| **Product/Design** | ₹0 | ₹1,50,000 | ₹3,00,000 | Founder handles Y1 |
| **Hosting (Firebase)** | ₹15,000 | ₹50,000 | ₹2,00,000 | Scales with users |
| **Marketing** | ₹50,000 | ₹2,00,000 | ₹5,00,000 | Organic Y1, paid Y2+ |
| **Legal/Compliance** | ₹25,000 | ₹50,000 | ₹1,00,000 | DPDP, lawyers, audits |
| **Support/Moderation** | ₹0 | ₹75,000 | ₹2,00,000 | Founder Y1 → team Y2+ |
| **Misc (tools, travel)** | ₹10,000 | ₹25,000 | ₹50,000 | — |
| **Total** | ~₹2,50,000 | ~₹10,50,000 | ~₹28,50,000 | — |

## Unit Economics

| Metric | Value | Calculation |
|--------|-------|-------------|
| **CAC** | ₹200 | (Marketing spend + referral costs) / new paid users |
| **LTV** | ₹4,200 | ARPU (₹350) × avg months (12) |
| **LTV:CAC** | 21:1 | Excellent (benchmark: >3:1) |
| **Payback period** | <1 month | CAC (₹200) / ARPU (₹350) = 0.57 months |
| **Gross margin** | ~85% | Revenue - hosting costs |
| **Net margin (Y3)** | ~65% | Revenue - all costs |

## Sensitivity Analysis

### Scenario 1: Optimistic (everything goes right)

| Metric | Y1 | Y2 | Y3 |
|--------|----|----|-----|
| MAU | 75,000 | 350,000 | 800,000 |
| Conversion | 4.0% | 4.5% | 5.0% |
| MRR (M12) | ₹10.5L | ₹55L | ₹1.4Cr |
| Break-even | Month 14 | — | — |

### Scenario 2: Base Case (realistic)

| Metric | Y1 | Y2 | Y3 |
|--------|----|----|-----|
| MAU | 50,000 | 200,000 | 500,000 |
| Conversion | 3.5% | 4.0% | 4.5% |
| MRR (M12) | ₹6.1L | ₹30L | ₹90L |
| Break-even | Month 18 | — | — |

### Scenario 3: Pessimistic (slow growth, low conversion)

| Metric | Y1 | Y2 | Y3 |
|--------|----|----|-----|
| MAU | 20,000 | 80,000 | 200,000 |
| Conversion | 2.5% | 3.0% | 3.5% |
| MRR (M12) | ₹1.75L | ₹8.4L | ₹28L |
| Break-even | Month 26 | — | — |

**Pessimistic scenario is still viable** — just requires extending seed runway by 6 months.
