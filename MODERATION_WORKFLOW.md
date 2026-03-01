# Bandhan AI — Content Moderation Workflow

> **Last Updated:** 28 February 2026
> **Compliance:** IT Rules 2021, DPDP Act 2023, POCSO Act 2012
> **Contact:** safety@bandhan.ai

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Automated Moderation Pipeline](#2-automated-moderation-pipeline)
3. [User Reporting Flow](#3-user-reporting-flow)
4. [Human Moderation Queue](#4-human-moderation-queue)
5. [Strike System (3-Strike Policy)](#5-strike-system-3-strike-policy)
6. [Appeal Process](#6-appeal-process)
7. [Audit Trail](#7-audit-trail)
8. [SLAs & Response Times](#8-slas--response-times)
9. [Zero-Tolerance Violations](#9-zero-tolerance-violations)
10. [File Reference](#10-file-reference)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INPUT                             │
│  (chat message, bio, prompt, photo, voice note)             │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────┐   ┌────────────────────────────────┐
│   TEXT MODERATION       │   │   IMAGE MODERATION              │
│   (client-side)         │   │   (client-side)                 │
│                         │   │                                 │
│  1. Normalise text      │   │  1. File validation             │
│  2. Bad-word dictionary │   │  2. Dimension checks            │
│  3. Pattern matching    │   │  3. Skin-tone heuristic         │
│  4. Scam detection      │   │  4. EXIF metadata stripping     │
│  5. Contact info check  │   │  5. (Optional) Cloud Vision API │
└──────┬─────────────────┘   └──────┬─────────────────────────┘
       │                            │
       ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   MODERATION RESULT                          │
│                                                              │
│   "pass"  → Allow through                                    │
│   "warn"  → Allow + show gentle warning to sender            │
│   "flag"  → Allow + queue for human moderator review         │
│   "block" → Prevent content from being sent/saved            │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼ (if "block")
┌─────────────────────────────────────────────────────────────┐
│                   STRIKE SYSTEM                              │
│                                                              │
│   Strike 1 → Warning notification                            │
│   Strike 2 → 48-hour feature restriction                     │
│   Strike 3 → Permanent ban (can appeal once)                 │
│                                                              │
│   Instant ban → CSAM, murder threats, identity fraud         │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                   AUDIT TRAIL                                │
│   (Firestore: users/{uid}/moderationLog)                     │
│                                                              │
│   Every action logged with:                                  │
│   - What happened                                            │
│   - Who initiated                                            │
│   - What enforcement action taken                            │
│   - Timestamp                                                │
│   - Associated report ID                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Automated Moderation Pipeline

### Text Moderation (`lib/moderation/text-moderation.ts`)

Runs client-side in ~1ms. Zero server cost. No user content leaves the device.

**Pipeline stages:**

| Stage | What it does | Example caught |
|-------|-------------|----------------|
| **Normalise** | Lowercase, expand leetspeak (0→o, 3→e), collapse repeats (fuuuck→fuck) | `F.U.C.K`, `sh1t`, `b@stard` |
| **Dictionary** | Match against 150+ bad words (Hindi + English) | Profanity, slurs, dowry demands |
| **Patterns** | Regex for structured threats, scam indicators | Phone numbers, UPI IDs, shortened URLs |
| **Context** | Stricter rules for names/bios vs. chat | "Dick" blocked in name but flagged (whole-word) in chat |

**Severity levels:**

| Level | Action | Example |
|-------|--------|---------|
| `block` | Content rejected, cannot be sent | Direct threats, slurs, explicit content |
| `flag` | Content sent but queued for human review | Subtle harassment, possible scam patterns |
| `warn` | Content sent with gentle warning to sender | Mild profanity, sarcasm-bordering-insult |
| `pass` | Content allowed without any action | Normal conversation |

**Special handling — Self-harm detection:**
When self-harm keywords are detected, the content is NOT blocked. Instead:
1. The message is flagged for moderator review
2. The sender sees helpline information (iCall: 9152987821, Vandrevala: 1860-2662-345)
3. No strike is applied — this is a safety measure, not a punishment

### Image Moderation (`lib/moderation/image-moderation.ts`)

**Client-side checks (instant, zero cost):**

| Check | What | Threshold |
|-------|------|-----------|
| File validation | Type, size, minimum dimensions | JPEG/PNG/WebP, max 5MB, min 100×100 |
| Skin-tone heuristic | HSV colour analysis for nudity pre-screening | >45% flag, >65% block |
| Aspect ratio | Detect banner ads, not real photos | Block if >4:1 or <1:4 |
| EXIF stripping | Remove GPS coordinates, camera info | Always strip before upload |

**Server-side checks (optional, pay-per-use):**
If enabled via `NEXT_PUBLIC_ENABLE_CLOUD_VISION=true`:
- Google Cloud Vision SafeSearch API
- Checks: adult, violence, racy, spoof
- Only called for images that pass client checks but get flagged by users

---

## 3. User Reporting Flow

### In-App Report (`components/moderation/ReportFlow.tsx`)

```
User taps ⋮ menu on profile/message
         │
         ▼
┌────────────────────┐
│  Step 1: Actions    │
│  - Report Profile   │
│  - Block User       │
│  - Hide Profile     │
└────────┬───────────┘
         │ (taps Report)
         ▼
┌────────────────────┐
│  Step 2: Reason     │
│  - Fake Profile     │
│  - Harassment       │
│  - Spam / Scam      │
│  - Inappropriate    │
│  - Underage         │
│  - Financial Scam   │
│  - Other            │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Step 3: Details    │
│  - Comment (500ch)  │
│  - Confidentiality  │
│    notice shown     │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Step 4: Submitted  │
│  - Confirmation     │
│  - Option to also   │
│    block the user   │
│  - Ref number shown │
└────────────────────┘
```

**Report priority scoring** (`report-handler.ts → calculateReportPriority`):

| Factor | Priority Boost |
|--------|---------------|
| Base: Underage report | +100 |
| Base: Harassment | +80 |
| Base: Scam/Fraud | +70 |
| Base: Fake profile | +60 |
| Base: Inappropriate | +50 |
| Base: Spam | +30 |
| Reported user has 5+ prior reports | +30 |
| Reported user has 3-4 prior reports | +20 |
| Reported user has 1-2 prior reports | +10 |

Higher priority reports are reviewed first by moderators.

---

## 4. Human Moderation Queue

### Dashboard (`components/moderation/ModerationDashboard.tsx`)

Admin-only panel accessible at `/admin/moderation` (requires admin role).

**Sections:**

| Section | Purpose |
|---------|---------|
| **Queue** | Pending reports sorted by priority. Filter by status. |
| **Detail** | Full report view with reporter info, evidence, user history. |
| **Actions** | Dismiss / Warn / Remove Content / Restrict 48h / Ban |
| **Appeals** | Pending ban appeals with approve/deny buttons. |
| **Stats** | Weekly volume, resolution times, category breakdown. |

**Moderator actions:**

| Action | Effect | When to use |
|--------|--------|------------|
| **Dismiss** | Close report, no action on reported user | False report, insufficient evidence |
| **Warn** | +1 strike, warning notification to user | First-time minor violation |
| **Remove Content** | Delete the offending message/photo | Clearly violating content, first offense |
| **Restrict 48h** | +1 strike, limited features for 48 hours | Repeated minor violations |
| **Suspend 7d** | Full account suspension for 7 days | Serious violation or 3rd strike |
| **Permanent Ban** | Account permanently disabled | Severe violation or repeated offenses |

---

## 5. Strike System (3-Strike Policy)

### How Strikes Work

```
No strikes    → Full access
                │
                ▼ (violation detected)
Strike 1      → WARNING notification
                │  User sees: "Your content violated Community Guidelines"
                │  Effect: None (can continue normally)
                │
                ▼ (another violation)
Strike 2      → 48-HOUR RESTRICTION
                │  User sees: "Account restricted for 48 hours"
                │  Effect: Cannot send messages, like profiles, or use Spotlight
                │
                ▼ (another violation)
Strike 3      → PERMANENT BAN
                   User sees: "Account permanently banned"
                   Effect: Account disabled. One appeal allowed.
```

### Strike Expiry

- Strikes expire after **90 days** of clean behaviour
- Expired strikes do not count towards the 3-strike limit
- Only active (non-expired) strikes are considered
- Strike count is recalculated on each new violation

### Display (`components/moderation/UserWarningBanner.tsx`)

Shown at the top of the app when a user has active strikes:
- Warning: Yellow banner with dismissible "X"
- Restriction: Dark banner with countdown timer ("47h 23m remaining")
- Ban: Black banner with appeal button

---

## 6. Appeal Process

### How Appeals Work

1. **Eligibility:** Users with restrictions or bans can submit **one appeal per enforcement action**
2. **Submission:** Via the warning banner → "Appeal" button, or email to appeals@bandhan.ai
3. **Content:** User writes a message (20–1,000 characters) explaining why they believe the action was wrong
4. **Queue:** Appeals appear in the "Appeals" tab of the Moderation Dashboard
5. **Review:** A **senior moderator** (different from the original reviewer) reviews within 7 business days
6. **Decision:**
   - **Approved:** Strike removed, restrictions lifted, user notified
   - **Denied:** Decision stands, user notified with reason
7. **Finality:** The appeal decision is final and cannot be re-appealed

### False Positive Handling

The automated text filter will occasionally flag innocent content (e.g., "I'm a die-hard fan" contains "die"). False positives are handled as follows:

1. If a message is blocked and the user believes it's a false positive, they can tap "Appeal This" on the block notice
2. The message text is queued for human review
3. If approved, the message is sent and the word/pattern is added to a whitelist
4. The bad-words dictionary is updated quarterly to reduce false positives

---

## 7. Audit Trail

### What Gets Logged

Every moderation action creates a `ModerationLogEntry` stored in Firestore:

```
Firestore path: users/{uid}/moderationLog/{logId}

{
  id: "LOG_abc123",
  userId: "user_uid",
  action: "warn" | "restrict_48h" | "permanent_ban" | ...,
  reason: "Strike 2: harassment — Sending threatening messages",
  initiatedBy: "system" | "moderator_uid" | "reporter_uid",
  timestamp: "2026-02-28T10:30:00.000Z",
  metadata: {
    strikeId: "STR_abc123",
    strikeCount: 2,
    source: "report",
    reportId: "RPT_abc123"
  }
}
```

### Retention

- Moderation logs retained for **2 years** (legal compliance for repeat offender detection)
- User-visible strike history retained for **90 days** (strike expiry period)
- Admin audit trail retained indefinitely

---

## 8. SLAs & Response Times

| Category | Acknowledgement | Resolution | IT Rules 2021 |
|----------|----------------|------------|----------------|
| **Underage / CSAM** | Immediate | Immediate takedown + law enforcement report | Required |
| **Threats / Violence** | 4 hours | 24 hours | Within 36 hours |
| **Harassment** | 24 hours | 36 hours | Within 36 hours |
| **Fake profile** | 24 hours | 72 hours | — |
| **Scam / Fraud** | 24 hours | 72 hours | — |
| **Inappropriate content** | 24 hours | 36 hours | Within 36 hours |
| **Spam** | 48 hours | 7 days | — |
| **Appeals** | 48 hours | 7 business days | — |
| **Government orders** | 24 hours | 72 hours | As specified |

All SLAs measured from time of report/detection.

---

## 9. Zero-Tolerance Violations

The following result in **immediate permanent ban** with no prior warning:

| Violation | Legal Basis | Additional Action |
|-----------|-------------|-------------------|
| Child Sexual Abuse Material (CSAM) | POCSO Act 2012 | Report to NCMEC + Indian authorities |
| Threats of murder or physical violence | IPC §506 | Report to police if imminent |
| Revenge sharing of intimate images | IPC §354C, IT Act §66E | Report to Cyber Crime portal |
| Human trafficking / exploitation | IPC §370 | Report to authorities |
| Solicitation of prostitution | IPC §372 | Report if minors involved |
| Drug trafficking | NDPS Act 1985 | Report to authorities |
| Identity fraud with criminal intent | IPC §419, §420 | Report to Cyber Crime portal |

---

## 10. File Reference

### Library Files

| File | Purpose |
|------|---------|
| `data/bad-words.ts` | Dictionary of profanity, slurs, scam phrases (Hindi + English). Includes severity levels and categories. |
| `lib/moderation/text-moderation.ts` | Client-side text analysis engine. Normalises input, checks dictionary, runs pattern matching. Returns `ModerationResult`. |
| `lib/moderation/image-moderation.ts` | Client-side image checks (file validation, skin-tone heuristic, EXIF stripping). Returns `ImageCheckResult`. |
| `lib/moderation/report-handler.ts` | Strike system, report processing, appeal management. Pure functions (no Firestore dependency — caller handles persistence). |

### Component Files

| File | Purpose |
|------|---------|
| `components/moderation/ReportFlow.tsx` | Multi-step in-app reporting modal. Reason → Details → Confirm → Done + Block/Hide options. |
| `components/moderation/UserWarningBanner.tsx` | Banner shown to users with active strikes/restrictions. Includes countdown timer and appeal button. |
| `components/moderation/ModerationDashboard.tsx` | Admin panel for moderators. Queue, detail view, action buttons, appeals, stats. |

### Integration Points

| Where | How moderation is used |
|-------|----------------------|
| Chat input (`ChatInput.tsx`) | Call `moderateText(message, "chat")` before sending. If `block`, show rejection message. |
| Profile save (`ProfileForm.tsx`) | Call `moderateProfile({ name, bio, prompts })` before saving. Block if any field fails. |
| Photo upload (`ImageUpload.tsx`) | Call `moderateImage(file, "profile")` before uploading. Block explicit content. |
| Profile modal (three-dot menu) | Open `<ReportFlow>` component. |
| Chat (long-press on message) | Open `<ReportFlow>` component with message context. |
| App layout | Show `<UserWarningBanner>` if user has active strikes. |
| Admin route (`/admin/moderation`) | Render `<ModerationDashboard>`. Requires admin authentication. |

---

## Quarterly Review Checklist

- [ ] Review bad-words dictionary with native Hindi speakers
- [ ] Analyse false positive rate from appeal data
- [ ] Remove/add words based on community feedback
- [ ] Update pattern rules for new scam techniques
- [ ] Review skin-tone threshold accuracy
- [ ] Check SLA compliance (% of reports resolved within target)
- [ ] Publish transparency report (IT Rules 2021 compliance)
- [ ] Train new volunteer moderators (if applicable)

---

**© 2026 Bandhan AI. Internal document — not for public distribution.**
