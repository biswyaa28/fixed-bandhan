# Bandhan AI — Unit Economics

---

## Core Metrics

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   CAC (Customer Acquisition Cost)          ₹200                 │
│   ─────────────────────────────────────────────────             │
│   Marketing spend + referral rewards                             │
│   ÷ new paid subscribers acquired                                │
│                                                                  │
│   ARPU (Avg Revenue Per User, monthly)     ₹350                 │
│   ─────────────────────────────────────────────────             │
│   Blended: 70% monthly ₹499 + 20% annual ₹250/mo               │
│            + 10% family ₹799                                     │
│                                                                  │
│   LTV (Lifetime Value)                     ₹4,200               │
│   ─────────────────────────────────────────────────             │
│   ARPU × avg subscription months (12)                            │
│                                                                  │
│   LTV:CAC Ratio                            21:1                 │
│   ─────────────────────────────────────────────────             │
│   Benchmark: >3:1 is good. 21:1 is exceptional.                │
│                                                                  │
│   Payback Period                           0.57 months (<1 mo)  │
│   ─────────────────────────────────────────────────             │
│   CAC ÷ ARPU = ₹200 ÷ ₹350                                    │
│                                                                  │
│   Gross Margin                             ~85%                 │
│   ─────────────────────────────────────────────────             │
│   Revenue - hosting/infrastructure costs                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Per-User Revenue Waterfall

```
New free user signs up
  │
  ├── 96.5% stay free (₹0 revenue, still valuable for network)
  │
  └── 3.5% convert to paid
       │
       ├── 70% choose Monthly (₹499/mo)
       │    └── Avg duration: 3.5 months → LTV: ₹1,747
       │
       ├── 20% choose Annual (₹2,999/yr = ₹250/mo)
       │    └── Avg duration: 10 months → LTV: ₹2,500
       │
       └── 10% choose Family (₹799/mo)
            └── Avg duration: 5 months → LTV: ₹3,995
```

**Blended LTV:** ₹1,747 × 0.7 + ₹2,500 × 0.2 + ₹3,995 × 0.1 = **₹2,122** (paid user only)

With referral value (each paid user refers 0.5 additional paid users):
**Adjusted LTV:** ₹2,122 × 1.5 = **₹3,183**

At scale (Year 3, better retention): LTV increases to **₹4,200+** as churn decreases.

---

## CAC Breakdown (Year 1 — Organic Only)

| Channel | Cost/Month | Users Acquired | CAC |
|---------|-----------|---------------|-----|
| Referral rewards (Premium weeks) | ₹15,000 | 100 | ₹150 |
| Content marketing (blog, SEO) | ₹10,000 | 50 | ₹200 |
| Campus ambassador (stipends) | ₹15,000 | 80 | ₹188 |
| Social media (organic labor) | ₹10,000 | 40 | ₹250 |
| **Blended** | **₹50,000** | **270** | **₹185** |

*Note: "Users acquired" = paid subscribers, not free signups.*

---

## Cohort Revenue Analysis

### Monthly Cohort (₹499/mo subscriber)

| Month | Users Remaining | Revenue | Cumulative |
|-------|----------------|---------|-----------|
| M1 | 100 (100%) | ₹49,900 | ₹49,900 |
| M2 | 92 (92%) | ₹45,908 | ₹95,808 |
| M3 | 85 (85%) | ₹42,415 | ₹1,38,223 |
| M4 | 78 (78%) | ₹38,922 | ₹1,77,145 |
| M5 | 72 (72%) | ₹35,928 | ₹2,13,073 |
| M6 | 66 (66%) | ₹32,934 | ₹2,46,007 |
| M12 | 37 (37%) | ₹18,463 | ₹3,84,230 |

**Revenue per 100 subscribers over 12 months:** ₹3,84,230
**Per user:** ₹3,842 → rounds to ~₹4,000 LTV

---

## Break-Even Analysis

```
Monthly fixed costs (Year 1): ₹2,50,000

Break-even paid users needed:
  ₹2,50,000 ÷ ₹350 (ARPU) = 715 paid users

Break-even MAU needed:
  715 ÷ 3.5% (conversion) = 20,429 MAU

Timeline to 20K MAU: ~Month 9

Add variable costs (hosting scales):
  Adjusted break-even: ~Month 10-11 for unit economics
  Company-level break-even: Month 18 (after seed expenses)
```

---

## Comparison to Benchmarks

| Metric | Bandhan AI | Tinder India | Bumble India | Shaadi.com |
|--------|-----------|-------------|-------------|-----------|
| ARPU | ₹350/mo | ₹200/mo | ₹300/mo | ₹800/mo |
| Conversion % | 3.5% | 3.0% | 4.0% | 5.0% |
| Monthly churn | 8% | 12% | 10% | 5% |
| CAC | ₹200 | ₹500+ | ₹400+ | ₹1,000+ |
| LTV:CAC | 21:1 | 4:1 | 6:1 | 8:1 |

**Our advantage:** Extremely low CAC (organic-first) creates an outsized LTV:CAC ratio. This is our primary lever — maintain organic growth as long as possible before introducing paid acquisition.
