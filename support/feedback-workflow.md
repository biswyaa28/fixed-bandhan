# Bandhan AI — Feedback Processing Workflow

---

## Overview

```
User submits feedback (in-app / NPS / exit survey)
          │
          ▼
    Auto-categorised
    (bug / feature / compliment / other)
          │
          ▼
    Auto-sentiment detected
    (positive / neutral / negative)
          │
          ▼
    Appears in /admin/feedback dashboard
          │
          ▼
    Team reviews within 48 hours
          │
          ├── Bug → create GitHub issue → fix → notify user
          ├── Feature request → add to public roadmap → upvote tracking
          ├── Compliment → add to testimonials (with permission)
          └── Other → respond or archive
```

---

## Step-by-Step Process

### 1. Collection (Automated)

| Trigger | Type | Timing |
|---------|------|--------|
| Floating feedback button (every screen) | in_app | User-initiated |
| NPS survey popup | nps | Day 7, then every 90 days |
| Account deletion flow | exit_survey | When user deletes account |
| Success story submission | testimonial | User-initiated |
| App Store review prompt | n/a (external) | After first match |

### 2. Triage (Within 48 Hours)

**Who:** Product lead or support team
**Where:** `/admin/feedback` dashboard

| Step | Action |
|------|--------|
| Review all "new" feedback entries | Sort by sentiment (negative first) |
| Set status: `reviewed` | Acknowledge you've seen it |
| Categorise any miscategorised entries | Fix type / category |
| Identify duplicates | Mark as `duplicate`, link to original |

### 3. Action (Within 1 Week)

#### Bug Reports
1. Set status → `in_progress`
2. Create GitHub issue with reproduction steps
3. Assign to engineering
4. Fix and deploy
5. Set status → `shipped`
6. (Optional) Reply to user: "Fixed! Thanks for reporting."

#### Feature Requests
1. Set status → `reviewed`
2. Add to public roadmap (if popular enough)
3. Track upvotes over time
4. If building: set status → `in_progress` → `shipped`
5. If not building: set status → `wont_fix` with reason

#### Compliments / Testimonials
1. Check if usable as testimonial (no PII, positive)
2. Request permission from user (via email/in-app)
3. If approved: add to success stories / marketing
4. Send thank-you response

#### Negative Feedback
1. **Never argue or be defensive**
2. Acknowledge the frustration
3. If actionable: create improvement task
4. If not actionable: respond with empathy
5. Follow up when improvement is shipped

#### NPS Responses
1. Promoters (9-10): Send thank-you, ask for App Store review
2. Passives (7-8): Ask "What would make it a 10?"
3. Detractors (0-6): Personal outreach, understand root cause

### 4. Follow-Up (Ongoing)

| Cadence | Action |
|---------|--------|
| Weekly | Review all new feedback, triage |
| Monthly | NPS trend analysis, feature request prioritisation |
| Quarterly | Public roadmap update based on feedback themes |
| After each release | Notify users whose feedback was addressed |

---

## Response Time SLAs

| Feedback Type | First Response | Resolution |
|--------------|---------------|-----------|
| Bug report (critical) | 4 hours | 24 hours |
| Bug report (normal) | 48 hours | 1 week |
| Feature request | 48 hours | N/A (logged) |
| Negative feedback | 24 hours | 1 week |
| NPS detractor (0-6) | 24 hours | 1 week |
| Compliment | 48 hours | N/A |

---

## Public Roadmap

Maintain a simple public roadmap (Notion or GitHub Projects) showing:

| Column | Description |
|--------|-----------|
| **Under Consideration** | Feature requests with 10+ upvotes |
| **Planned** | Committed for next quarter |
| **In Progress** | Currently being built |
| **Shipped** | Recently released |

Update monthly. Share link in app settings under "What's Next."

---

## Metrics to Track

| Metric | Target | Review |
|--------|--------|--------|
| Feedback response rate | 100% within 48h | Weekly |
| NPS score | >40 (PMF signal) | Monthly |
| Average rating | >4.0 / 5 | Monthly |
| Bug fix time (median) | <72 hours | Monthly |
| Feature shipped from feedback | 2+ per quarter | Quarterly |
| Positive sentiment % | >50% | Monthly |

---

## Incentives for Valuable Feedback

| Action | Reward |
|--------|--------|
| Bug report that leads to a fix | 3 days free Premium |
| Feature request with 20+ upvotes | Name in release notes |
| Testimonial used in marketing | 1 week free Premium |
| Exit survey completed | "Door is always open" email |

---

## Anti-Patterns (What NOT to Do)

- ❌ Ignore negative feedback
- ❌ Argue with users about their experience
- ❌ Promise features you can't deliver
- ❌ Collect feedback and never act on it
- ❌ Auto-close feedback without reading it
- ❌ Use feedback data for marketing without consent
- ❌ Show NPS survey during frustrating moments (after limit hit, error)
