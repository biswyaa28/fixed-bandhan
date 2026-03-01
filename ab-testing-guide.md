# Bandhan AI — A/B Testing Guide

> **Version:** 2026-02-28
> **Audience:** Product, engineering, design, growth
> **Review cadence:** Every experiment review meeting (Fridays)

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Architecture](#2-architecture)
3. [Running an Experiment (Step-by-Step)](#3-running-an-experiment)
4. [Statistical Methodology](#4-statistical-methodology)
5. [Experiment Types & Examples](#5-experiment-types--examples)
6. [Feature Flags](#6-feature-flags)
7. [Rules & Guardrails](#7-rules--guardrails)
8. [Decision Framework](#8-decision-framework)
9. [Post-Experiment Checklist](#9-post-experiment-checklist)

---

## 1. Philosophy

**Ship fast, learn faster.**

Every non-trivial product decision should be tested if possible. We favour small, fast experiments over big, slow ones. We accept being wrong — the cost of learning is low; the cost of guessing is high.

```
Hypothesis → Experiment → Data → Decision → Ship
     ↑______________________________________|
```

### Core principles

| Principle | Why |
|-----------|-----|
| **Always have a hypothesis** | Prevents fishing for results |
| **Always have a control group** | Without a baseline, data is meaningless |
| **Minimum 1,000 users per variant** | Below this, results are noise |
| **Run for ≥ 7 days** | Captures weekday/weekend patterns |
| **Track multiple metrics** | Catching regressions, not just conversions |
| **Document everything** | Future you will thank past you |
| **Ship winners within 1 week** | Stale experiments waste traffic |

---

## 2. Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      Code Structure                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  experiments/                                                  │
│  ├── onboarding-variants.ts   ← experiment definitions         │
│  ├── pricing-variants.ts      ← experiment definitions         │
│  └── ui-variants.ts           ← experiment definitions         │
│                                                                │
│  lib/experiments/                                              │
│  ├── experiment-service.ts    ← core engine (assign, track)    │
│  ├── feature-flags.ts         ← boolean flags on top of engine │
│  ├── analytics-integration.ts ← results aggregation            │
│  └── index.ts                 ← barrel export                  │
│                                                                │
│  components/experiments/                                       │
│  └── ExperimentComponents.tsx ← React hooks + declarative UI   │
│                                                                │
│  dashboard/                                                    │
│  └── experiment-dashboard.tsx ← admin results view             │
│                                                                │
│  app/admin/experiments/                                        │
│  └── page.tsx                 ← route at /admin/experiments    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Data flow

```
1. App init → registerExperiments([...all experiments])
                initFeatureFlags()

2. Component renders → useExperiment("test_id", userId)
                       → deterministic hash assigns variant
                       → caches in localStorage
                       → tracks "ab_test_exposure" event

3. User converts → trackConversion("test_id", userId, "metric_name")
                   → tracks "ab_test_conversion" event

4. Dashboard reads → getAllExperimentReports()
                     → aggregates exposure + conversion events
                     → runs z-test for significance
                     → shows confidence, lift, recommendation
```

### Assignment algorithm

Deterministic hashing ensures the same user always sees the same variant:

```
bucket = FNV-1a( userId + "::" + experimentId ) % 100

Variant weights: [control: 50%, variant_a: 50%]
→ bucket 0–49  = control
→ bucket 50–99 = variant_a
```

No randomness. No server round-trip. Instant. Consistent.

---

## 3. Running an Experiment

### Step 1: Write the hypothesis

Before touching any code:

```
Template:
"We believe that [change] will cause [metric] to [increase/decrease]
by [X]% because [reasoning]."

Example:
"We believe that showing '✓ Interested' instead of '❤️ Like' on the
action button will increase interest-sent rate by 10% because the
word is more culturally appropriate for marriage-minded Indian users."
```

### Step 2: Define the experiment

Create an entry in the appropriate file:

```typescript
// experiments/ui-variants.ts
{
  id: "ui_cta_copy",
  name: "Like Button CTA Copy",
  description: "Test action button label in discovery feed",
  hypothesis: "...",
  primaryMetric: "interest_sent",
  secondaryMetrics: ["match_rate_d7", "message_sent_d7"],
  variants: [
    { id: "control", name: "❤️ Like", weight: 50, value: { label: "Like", icon: "heart" } },
    { id: "variant_a", name: "✓ Interested", weight: 50, value: { label: "Interested", icon: "check" } },
  ],
  status: "running",
  startDate: "2026-02-20",
  endDate: null,
  minSamplePerVariant: 1000,
  owner: "design",
  tags: ["ui", "copy", "cta"],
  audience: "all",
}
```

### Step 3: Implement in the UI

**Option A — Hook API (simple)**

```tsx
import { useExperiment } from "@/components/experiments/ExperimentComponents";

function LikeButton({ userId }: { userId: string }) {
  const variant = useExperiment("ui_cta_copy", userId);

  return variant === "variant_a"
    ? <button>✓ Interested</button>
    : <button>❤️ Like</button>;
}
```

**Option B — Declarative API (complex multi-variant)**

```tsx
import {
  ExperimentProvider,
  ExperimentVariant,
} from "@/components/experiments/ExperimentComponents";

<ExperimentProvider experimentId="ui_cta_copy" userId={uid}>
  <ExperimentVariant variant="control">
    <button>❤️ Like</button>
  </ExperimentVariant>
  <ExperimentVariant variant="variant_a">
    <button>✓ Interested</button>
  </ExperimentVariant>
</ExperimentProvider>
```

**Option C — Value API (data-driven)**

```tsx
import { useExperimentValue } from "@/components/experiments/ExperimentComponents";

function PriceDisplay({ userId }: { userId: string }) {
  const price = useExperimentValue<number>("price_monthly", userId, 499);
  return <span>₹{price}/month</span>;
}
```

### Step 4: Track conversions

```tsx
import { useTrackConversion } from "@/components/experiments/ExperimentComponents";

function CheckoutButton({ userId }: { userId: string }) {
  const track = useTrackConversion("price_monthly", userId);

  const handlePurchase = () => {
    // ... process payment
    track("premium_converted");
  };

  return <button onClick={handlePurchase}>Subscribe</button>;
}
```

### Step 5: Monitor results

Visit `/admin/experiments` to see:

- Exposure counts per variant
- Conversion rates
- Statistical significance (95% confidence threshold)
- Lift calculation
- Automated recommendation ("Ship it!" / "Revert" / "Need more data")

### Step 6: Make the decision

See [Decision Framework](#8-decision-framework) below.

---

## 4. Statistical Methodology

### Test used: Two-Proportion Z-Test

```
H₀: p_control = p_treatment   (no difference)
H₁: p_control ≠ p_treatment   (two-sided)
```

### Why this test

- Simple to implement (no external library needed)
- Works for conversion rates (binary outcomes)
- Two-sided catches both improvements AND regressions
- Well-understood confidence intervals

### Significance threshold

- **Required confidence:** 95% (p < 0.05)
- **Statistical power:** 80%
- **Minimum sample:** 30 per variant (absolute floor)
- **Recommended sample:** 1,000+ per variant for reliable results

### Sample size estimation

Before starting, estimate how long you need:

```
For a 5% baseline conversion rate and 20% relative lift target:
→ ~1,600 users per variant
→ At 100 signups/day → ~32 days for a 2-variant test

For a 10% baseline and 10% lift:
→ ~3,800 users per variant
→ At 100 signups/day → ~76 days
```

**Rule of thumb:** The smaller the effect you want to detect, the more users you need.

### Common mistakes

| Mistake | Why it's bad | How to avoid |
|---------|--------------|--------------|
| Peeking at results daily and stopping early | Inflates false positive rate to 20-30% | Wait for full sample size |
| Testing too many variants | Each variant dilutes traffic | Max 3-4 variants |
| Changing the experiment mid-run | Invalidates all prior data | Start a new experiment instead |
| Only tracking one metric | May win on conversion but lose on retention | Always track 2-3 secondary metrics |
| Running on <1% of traffic | Statistically meaningless | Minimum 10% of traffic per variant |

---

## 5. Experiment Types & Examples

### UI/UX Tests

```
Goal: Improve user experience metrics (engagement, time-on-screen)
Duration: 7–14 days
Sample: 1,000+ per variant

Examples:
- Card stack vs grid layout
- Accordion vs full-scroll profile
- Safety button position
- Icebreaker chips vs carousel
```

### Copy Tests

```
Goal: Improve click-through and conversion rates
Duration: 7–14 days
Sample: 1,000+ per variant

Examples:
- CTA button labels ("Like" vs "Interested")
- Onboarding incentive messaging
- Upsell modal headlines
- Empty state copy
```

### Flow Tests

```
Goal: Improve funnel completion rates
Duration: 14–21 days (longer funnels need more time)
Sample: 500+ completions per variant

Examples:
- Onboarding step order
- Photo requirement level
- Checkout flow steps
- Verification flow timing
```

### Pricing Tests

```
Goal: Maximise revenue (price × conversion)
Duration: 14–30 days (need to measure churn impact)
Sample: 1,000+ per variant
⚠️ Extra care: monitor churn at Day 7 AND Day 30

Examples:
- Monthly price (₹399 vs ₹499 vs ₹599)
- Annual discount level
- Free trial length
- Upsell trigger timing
```

### Feature Rollouts

```
Goal: Validate new features before 100% rollout
Duration: 7–14 days
Sample: 500+ per variant

Examples:
- Video calls (0% → 25% → 100%)
- Voice prompts (10% → 50% → 100%)
- AI icebreakers (10% → 50% → 100%)
```

---

## 6. Feature Flags

Feature flags are boolean experiments with two variants: "off" (control) and "on" (enabled).

### Usage

```tsx
import { useFlag, FeatureGate } from "@/components/experiments/ExperimentComponents";

// Hook API
const hasVideo = useFlag("video_calls", userId);

// Declarative API
<FeatureGate flag="video_calls" userId={uid} fallback={<UpgradeBanner />}>
  <VideoCallButton />
</FeatureGate>
```

### Rollout strategy

```
Day 1:   0% → Internal team only (manual override)
Day 3:   5% → Canary (catch critical bugs)
Day 5:  25% → Early adopters
Day 10: 50% → Half the user base
Day 14: 100% → Full rollout (remove flag)
```

### Current flags (defined in `feature-flags.ts`)

| Flag | Status | Rollout | Audience |
|------|--------|---------|----------|
| `video_calls` | OFF | 0% | all |
| `voice_prompts` | ON | 25% | all |
| `ai_icebreakers` | ON | 10% | all |
| `premium_spotlight` | ON | 100% | premium |
| `family_view_pdf` | ON | 50% | all |
| `dark_mode` | OFF | 0% | all |
| `success_stories_feed` | ON | 100% | all |
| `respectful_initiation` | ON | 100% | all |

---

## 7. Rules & Guardrails

### Hard rules (never break)

1. **No experiment without a written hypothesis** — prevents p-hacking
2. **Always have a control group** — without baseline, data is meaningless
3. **Minimum 1,000 users per variant** — below this, noise > signal
4. **Run for minimum 7 days** — captures weekday/weekend variance
5. **No testing on <1% of users** — statistically insignificant
6. **Don't peek and stop early** — wait for full sample
7. **Ship winning variants within 1 week** — don't waste traffic
8. **Document learnings** — even failed experiments teach us

### Soft rules (follow unless justified)

9. Maximum 4 variants per experiment (traffic dilution)
10. Maximum 5 concurrent experiments (interaction effects)
11. Don't overlap experiments on the same UI element
12. Pricing tests need 30-day churn monitoring
13. Safety-critical features are never A/B tested
14. Share results with the entire team (no hiding failures)

### Emergency kill switch

If an experiment causes a regression:

```typescript
// In the experiment definition, set:
status: "paused"

// Or clear client-side assignments:
import { clearAssignments } from "@/lib/experiments";
clearAssignments();
```

---

## 8. Decision Framework

After an experiment reaches significance:

```
┌─────────────────────────────────────────────┐
│         Is it statistically significant?     │
│                (p < 0.05)?                   │
└────────────────┬────────────────┬────────────┘
                 │                │
              YES│             NO │
                 ▼                ▼
    ┌────────────────┐   ┌───────────────────┐
    │ Is the lift     │   │ Decide:           │
    │ practically     │   │ • Need more data? │
    │ meaningful?     │   │ • Too small to    │
    │ (>5% relative)  │   │   detect?         │
    └──────┬─────┬───┘   │ • Abandon test    │
           │     │        └───────────────────┘
        YES│  NO │
           ▼     ▼
  ┌────────────┐ ┌──────────────────────────┐
  │ Check       │ │ Technically sig but      │
  │ secondary   │ │ lift is <5%:             │
  │ metrics for │ │ • Ship if zero cost      │
  │ regressions │ │ • Otherwise skip         │
  └──────┬─────┘ └──────────────────────────┘
         │
     No regressions?
         │
      YES▼
  ┌──────────────────┐
  │ SHIP IT!         │
  │ Within 1 week.   │
  │ Document results. │
  └──────────────────┘
```

### Decision template

```markdown
## Experiment: [name]
**Result:** [variant_name] wins with [X]% lift at [Y]% confidence
**Decision:** Ship / Revert / Extend / Abandon
**Justification:** [1-2 sentences]
**Secondary metrics:** [Any regressions?]
**Action items:** [Who ships? By when?]
**Learning:** [What did we learn for future experiments?]
```

---

## 9. Post-Experiment Checklist

- [ ] Results documented in experiment definition (`status: "completed"`)
- [ ] Winning variant shipped to 100% of users
- [ ] Experiment code cleaned up (remove variant branches)
- [ ] Feature flag removed (if applicable)
- [ ] Learning shared in team Slack/meeting
- [ ] Follow-up experiments identified (if any)
- [ ] Analytics events still firing after cleanup

---

## Appendix: Quick Reference

### Add an experiment

1. Create entry in `experiments/*.ts`
2. Register in `app/layout.tsx` or `PerfInit`
3. Use `useExperiment()` or `<ExperimentProvider>` in UI
4. Track conversion with `useTrackConversion()`
5. Monitor at `/admin/experiments`

### Add a feature flag

1. Add to `FLAGS` array in `lib/experiments/feature-flags.ts`
2. Use `useFlag()` or `<FeatureGate>` in UI
3. Adjust `rolloutPercent` to roll out gradually
4. Set `enabled: false` to kill instantly

### Debug in development

Add to root layout:
```tsx
{process.env.NODE_ENV === "development" && <ExperimentDebugOverlay userId={uid} />}
```

### Force a specific variant (QA)

```typescript
import { overrideVariant } from "@/lib/experiments";
overrideVariant("ui_cta_copy", "variant_a");
// Refresh the page
```

### Reset all assignments

```typescript
import { clearAssignments } from "@/lib/experiments";
clearAssignments();
```
