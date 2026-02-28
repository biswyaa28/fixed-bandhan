# Bandhan AI — Content Guidelines & Community Moderation

> This document governs all user-generated content (UGC) on Bandhan AI:
> profiles, chat messages, success stories, and community contributions.
>
> **Last Updated:** February 28, 2026
> **Contact:** content@bandhan.ai

---

## Table of Contents

1. [Content Principles](#1-content-principles)
2. [What's Allowed](#2-whats-allowed)
3. [What's NOT Allowed](#3-whats-not-allowed)
4. [Profile Content Rules](#4-profile-content-rules)
5. [Chat Message Rules](#5-chat-message-rules)
6. [Success Story Guidelines](#6-success-story-guidelines)
7. [Icebreaker & Prompt Contributions](#7-icebreaker--prompt-contributions)
8. [Photo Guidelines](#8-photo-guidelines)
9. [Hindi Content Standards](#9-hindi-content-standards)
10. [Community Moderation System](#10-community-moderation-system)
11. [Moderation Workflow (Firebase)](#11-moderation-workflow-firebase)
12. [Volunteer Moderator Guide](#12-volunteer-moderator-guide)
13. [Escalation Process](#13-escalation-process)
14. [Appeals Process](#14-appeals-process)
15. [Legal Compliance](#15-legal-compliance)

---

## 1. Content Principles

Every piece of content on Bandhan AI must pass the **"Family Test":**

> *Would you be comfortable if your parents, siblings, or future in-laws saw this content?*

If the answer is no, it doesn't belong here.

### Core Values

- **Respectful** — Treat every user with dignity. No casteism, sexism, or discrimination.
- **Honest** — No fake profiles, misleading photos, or exaggerated bios.
- **Safe** — No harassment, threats, or pressure. Marriage is a choice, not an obligation.
- **Inclusive** — Welcome all religions, languages, regions, and backgrounds.
- **Family-Friendly** — Content suitable for all ages (parents use the Family View feature).

---

## 2. What's Allowed

✅ **Genuine self-expression** — Hobbies, interests, life goals, values
✅ **Cultural references** — Festivals, traditions, food, music, cinema
✅ **Family information** — Family values, traditions (with consent)
✅ **Career and education** — Achievements, goals, aspirations
✅ **Humor** — Clean, lighthearted jokes and personality
✅ **Hindi, English, or mixed** — Hinglish is perfectly fine
✅ **Regional language references** — Tamil, Telugu, Bengali, etc. in context
✅ **Honest preferences** — Diet, lifestyle, deal-breakers (stated respectfully)
✅ **Voice notes** — Under 15 seconds, in any Indian language
✅ **Success stories** — With both partners' consent

---

## 3. What's NOT Allowed

### Zero Tolerance (Immediate Ban)

🚫 **Sexual or explicit content** — nudity, graphic descriptions, sexual solicitation
🚫 **Harassment** — threatening, stalking, persistent unwanted contact
🚫 **Hate speech** — content targeting religion, caste, gender, region, or disability
🚫 **Child safety violations** — any content involving minors
🚫 **Impersonation** — using someone else's identity or photos
🚫 **Fraud** — fake profiles, catfishing, financial scams

### Warning + Removal

⚠️ **Casteist preferences** — "Only Brahmin" or "No SC/ST" (stated in discriminatory way)
⚠️ **Dowry references** — Any mention of dowry expectations
⚠️ **Body shaming** — "Only fair-skinned" or negative comments about appearance
⚠️ **Religious intolerance** — Derogatory comments about any religion
⚠️ **Political content** — Partisan political statements in profiles
⚠️ **Commercial content** — Advertising, MLM, business promotion
⚠️ **Substance references** — Glorifying drugs, excessive alcohol
⚠️ **Contact info in profiles** — Phone numbers, email, Instagram handles (safety risk)
⚠️ **Pressure tactics** — "Marry me or else" or emotional manipulation

---

## 4. Profile Content Rules

### Bio (max 300 characters)

- Must be about **yourself** — not a list of demands for a partner
- No contact information (phone, email, social media)
- No explicit income demands ("must earn 20LPA+")
- Hindi and English both welcome

**Good example:**
> "Software engineer who loves weekend treks and masala chai. Family means everything to me. Looking for someone to share Sunday morning chai with. 🏔️☕"

**Bad example:**
> "Only fair, slim, convent-educated from upper caste family. Must earn 15LPA+. No time-wasters. DM on Instagram @..."

### Profile Prompts

- Answers must be genuine and personal
- No copied text from the internet
- No explicit or sexual content
- Voice answers: clean language, under 15 seconds
- Photo answers: follow Photo Guidelines (section 8)

---

## 5. Chat Message Rules

### Allowed

- Respectful conversation about getting to know each other
- Asking about values, lifestyle, family (with sensitivity)
- Sharing voice notes in any Indian language
- Sharing photos (clothed, appropriate)
- Discussing meeting in person (public places suggested)

### Not Allowed

- Unsolicited sexual messages or images
- Persistent messaging after being ignored or blocked
- Asking for money or financial information
- Sharing others' personal information without consent
- Aggressive or threatening language
- Pressuring for phone number before the other person is ready

### Auto-Moderation (Firestore-based)

The following patterns are flagged automatically:
- Phone numbers in messages (safety concern)
- Email addresses in messages
- Common abuse/slur patterns (keyword list)
- Rapid-fire messaging (spam detection)

---

## 6. Success Story Guidelines

### Submission Requirements

1. **Both partners must consent** — verified via checkboxes in the form
2. **Only first names used** — never full names or surnames
3. **No identifying photos** unless explicitly uploaded by the couple
4. **Story must be truthful** — no fabricated testimonials
5. **Minimum 30 characters** in English
6. **Hindi translation optional** — volunteer translators may help

### Content Standards

- Focus on: how you met, what clicked, what Bandhan AI did well
- Avoid: explicit details, financial information, family drama
- Positive tone encouraged — but honesty about challenges is fine
- No mention of competing apps or services

### Moderation Flow

```
User submits → Firestore (status: "pending")
  → Volunteer moderator reviews
    → Approved → Published in feed
    → Rejected → User notified with reason
    → Flagged → Escalated to admin
```

### Withdrawal

Users can withdraw their story anytime:
- Settings → Privacy → "My Success Story" → "Delete Story"
- This removes the story from Firestore within 24 hours

---

## 7. Icebreaker & Prompt Contributions

We welcome community contributions for new icebreaker questions and profile prompts!

### How to Contribute

1. **GitHub PR** — Add questions to `data/icebreaker-questions.ts` or `data/profile-prompts.ts`
2. **Google Form** — Submit at [bandhan.ai/contribute-content] (coming soon)
3. **Email** — Send to content@bandhan.ai

### Contribution Requirements

- Must include both **English** and **Hindi** versions
- Hindi must be **natural** (not Google Translated)
- Must be culturally appropriate for Indian audience
- Must be gender-neutral
- Must follow the "Family Test" above
- No explicit, political, or discriminatory content
- No questions about caste, income, or dowry

### Review Process

1. Submission received
2. Hindi native speaker reviews translation quality
3. Cultural sensitivity check
4. Added to the question bank with contributor credit (optional)

### Credit

Contributors are acknowledged in the question's metadata (optional — you can choose to remain anonymous).

---

## 8. Photo Guidelines

### Profile Photos (max 5)

✅ **Allowed:**
- Clear face photos (required for verification)
- Full-body photos (clothed)
- Group photos (with family or friends — indicate which one is you)
- Hobby/activity photos (travel, cooking, sports)
- Pet photos
- Professional headshots

🚫 **Not Allowed:**
- Nudity or revealing clothing
- Photos of others without their consent
- Photos with children (safety concern)
- Photos with celebrities (misleading)
- Heavily filtered photos that misrepresent appearance
- Stock photos or downloaded images
- Photos with visible contact information
- Gym selfies showing excessive skin

### Chat Photos

Same rules as profile photos, with additional restrictions:
- No screenshots of other conversations
- No memes with offensive content
- No unsolicited personal photos

---

## 9. Hindi Content Standards

### Translation Quality

- **Natural Hindi** — The way people actually speak, not textbook Hindi
- **Formal register** — Use "aap" (आप), not "tum" (तुम)
- **Hinglish is fine** — "Weekend plan kya hai?" is acceptable
- **Regional sensitivity** — Don't assume all users speak Shudh Hindi
- **Script** — Use Devanagari (not Roman transliteration) for all official Hindi

### Text Expansion

Hindi text is approximately **30% longer** than English. UI components must:
- Allow text wrapping (no fixed widths)
- Use flexible layouts
- Test with Hindi text before shipping

### Font Requirements

- Primary Hindi font: **Noto Sans Devanagari**
- Fallback: system Devanagari fonts
- Minimum size: 14px for Hindi body text (Devanagari needs more space)

---

## 10. Community Moderation System

### Overview

Bandhan AI uses a **community-driven moderation system** — zero cost, powered by volunteer moderators and automated Firestore checks.

### Three Layers

| Layer | Method | Cost |
|-------|--------|------|
| **L1: Automated** | Keyword filters, pattern matching in Firestore security rules | Free |
| **L2: Community** | Volunteer moderators review flagged content | Free |
| **L3: Admin** | Core team handles escalations | Free |

### Community Flagging

Any user can flag content:
- **Profile flag** — "Report Profile" in three-dot menu
- **Message flag** — Long-press message → "Report"
- **Story flag** — "Report" button on success stories

Flags are stored in Firestore `/reports` collection with:
- Reporter ID
- Content type (profile, message, story)
- Content ID
- Reason (fake, harassment, spam, inappropriate, other)
- Optional comment
- Timestamp

---

## 11. Moderation Workflow (Firebase)

### Firestore Collections

```
/reports/{reportId}
  - reporterId: string
  - contentType: "profile" | "message" | "story"
  - contentId: string
  - reason: string
  - comment?: string
  - status: "pending" | "reviewed" | "actioned" | "dismissed"
  - moderatorId?: string
  - moderatorAction?: "warn" | "remove" | "ban" | "dismiss"
  - createdAt: timestamp
  - reviewedAt?: timestamp

/moderators/{userId}
  - role: "volunteer" | "admin"
  - assignedSince: timestamp
  - reviewCount: number
  - region: string  // e.g., "hindi-belt", "south-india"
```

### Moderation Queue (Zero-Cost Implementation)

Since we can't afford paid moderation tools, the queue is a simple Firestore query:

```typescript
// Get pending reports for a moderator
const pendingReports = await getDocs(
  query(
    collection(db, "reports"),
    where("status", "==", "pending"),
    orderBy("createdAt", "asc"),
    limit(20)
  )
);
```

### Auto-Moderation Rules (Firestore Security Rules)

```
// Block messages containing phone numbers
match /messages/{matchId}/messages/{messageId} {
  allow create: if
    !request.resource.data.content.matches('.*[6-9][0-9]{9}.*')
    && request.resource.data.content.size() <= 1000;
}
```

### Thresholds

| Reports on Content | Action |
|---------------------|--------|
| 1 report | Logged, queued for review |
| 3 reports | Content hidden pending review |
| 5 reports | Content removed, user warned |
| 10+ reports on same user | Account suspended for review |

---

## 12. Volunteer Moderator Guide

### Who Can Moderate

- Verified users (Silver or Gold badge) with 30+ days on platform
- Must complete a 10-question moderation quiz
- Must agree to Moderator Code of Conduct
- Regional language speakers preferred (for Hindi/regional content)

### Moderator Responsibilities

1. Review flagged content within 24 hours
2. Apply consistent standards (this document)
3. Provide clear reason for removal decisions
4. Escalate unclear cases to admins
5. Never share flagged content outside the platform
6. Never contact reported users directly

### Moderator Actions

| Action | When to Use |
|--------|-------------|
| **Dismiss** | Flag is invalid — content is fine |
| **Warn** | Minor violation — user gets a warning message |
| **Remove** | Clear violation — content deleted |
| **Ban** | Severe/repeat violation — account suspended |

### Moderator Code of Conduct

- **Impartial** — Don't let personal beliefs affect decisions
- **Confidential** — Never share moderation details externally
- **Consistent** — Follow these guidelines, not personal judgment
- **Respectful** — Even when reviewing offensive content
- **Available** — Review at least 10 reports per week to stay active

### Recognition

Active moderators receive:
- Special "Moderator" badge on profile (optional)
- Priority support for their own account
- Monthly recognition in community newsletter
- Certificate of community service (for college/career)

---

## 13. Escalation Process

```
User flags content
  │
  ├── Auto-check: matches known patterns?
  │   ├── Yes → Auto-remove + notify user
  │   └── No → Add to moderation queue
  │
  ├── Volunteer moderator reviews (within 24h)
  │   ├── Clear violation → Remove + warn/ban
  │   ├── Borderline → Escalate to admin
  │   └── False flag → Dismiss
  │
  └── Admin reviews (within 48h)
      ├── Confirm removal → Permanent action
      ├── Override moderator → Restore content
      └── Legal concern → Forward to legal team
```

### Emergency Escalation

For content involving:
- **Threats of violence** — Immediate removal + admin alert
- **Child safety** — Immediate removal + law enforcement notification
- **Suicide/self-harm** — Immediate removal + crisis resource display

Contact: emergency@bandhan.ai (checked every 4 hours)

---

## 14. Appeals Process

Users whose content is removed can appeal:

1. Go to Settings → Help → "Appeal a Decision"
2. Select the removed content
3. Write a brief explanation (max 300 characters)
4. Submit — reviewed by a different moderator within 48 hours

### Appeal Outcomes

- **Upheld** — Original decision stands. Content stays removed.
- **Overturned** — Content restored. Moderator coached on guidelines.
- **Modified** — Partial restoration with edits required.

### Limits

- 1 appeal per removed content
- 3 appeals per month per user
- Zero-tolerance items (section 3) cannot be appealed

---

## 15. Legal Compliance

### Information Technology Act, 2000 (India)

- Section 79: Intermediary liability — we remove content within 36 hours of valid complaint
- Section 66A (struck down): We do NOT restrict legitimate speech
- IT (Intermediary Guidelines) Rules, 2021: Grievance officer appointed

### DPDP Act, 2023

- Section 6: Consent obtained for all UGC sharing
- Section 11: Users can withdraw consent and delete content
- Section 12: Right to erasure — stories deleted within 24 hours of request
- Section 13: Grievance officer contactable at grievance@bandhan.ai

### Grievance Officer

| Detail | Value |
|--------|-------|
| Name | [Appointed Officer] |
| Email | grievance@bandhan.ai |
| Response Time | 24 hours acknowledgment, 15 days resolution |
| Address | [Registered office address] |

---

## Version History

| Date | Change | Author |
|------|--------|--------|
| 2026-02-28 | Initial version | Content Team |

---

*These guidelines are reviewed quarterly. Suggestions welcome at content@bandhan.ai.*
