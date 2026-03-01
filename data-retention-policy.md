# Bandhan AI — Data Retention Policy

> **Effective Date:** 28 February 2026
> **Version:** 2026-02-28-v1
>
> Compliance: DPDP Act 2023 (§8(7) — Data minimisation), IT Rules 2021, Income Tax Act 1961
>
> 📌 **Legal Review Notice:** This document must be reviewed and approved by a qualified Indian lawyer before publication.

---

## Table of Contents

1. [Principles](#1-principles)
2. [Retention Schedule](#2-retention-schedule)
3. [Automated Enforcement](#3-automated-enforcement)
4. [User-Initiated Deletion](#4-user-initiated-deletion)
5. [Inactive Account Policy](#5-inactive-account-policy)
6. [Data Minimisation Practices](#6-data-minimisation-practices)
7. [Legal Holds](#7-legal-holds)
8. [Technical Implementation](#8-technical-implementation)
9. [Audit & Review](#9-audit--review)
10. [Hindi Summary](#10-hindi-summary-हिंदी-सारांश)

---

## 1. Principles

Our data retention practices follow four principles, in order of priority:

1. **Minimisation** — We collect only what is necessary for the stated purpose and delete it when the purpose is fulfilled (DPDP Act §8(7)).
2. **Transparency** — Users know exactly what data we hold, for how long, and why. The retention schedule below is displayed in-app (Settings → Privacy → Data Retention).
3. **Legal Compliance** — Some data must be retained beyond its operational purpose to comply with Indian law (Income Tax Act, IT Rules 2021). These exceptions are clearly marked.
4. **User Control** — Where no legal requirement exists, users can request early deletion at any time.

---

## 2. Retention Schedule

| # | Data Category | Retention Period | Legal Basis | User Can Request Early Deletion | Auto-Delete |
|---|---------------|-----------------|-------------|-------------------------------|-------------|
| 1 | **Chat Messages** | **90 days** from send date | Operational purpose | ✅ Yes | ✅ Daily cron |
| 2 | **Voice Notes** | **90 days** from send date | Operational purpose | ✅ Yes | ✅ Daily cron |
| 3 | **Chat Photos** | **90 days** from send date | Operational purpose | ✅ Yes | ✅ Daily cron |
| 4 | **Analytics Events** | **90 days** from collection | Consent-based (marketing) | ✅ Yes | ✅ Daily cron |
| 5 | **Location Data** (Share My Date) | **24 hours** after session ends | Consent-based (safety) | ✅ Yes (immediate) | ✅ Hourly cron |
| 6 | **Push Notification Tokens** | **Until logout** or token refresh | Operational purpose | ✅ Yes (revoke) | ✅ On logout |
| 7 | **Profile Data** | **Account lifetime** + 1 year after deletion | DPDP Act §8(8) | ❌ No (legal minimum) | ✅ Post-deletion cron |
| 8 | **Profile Photos** | **Account lifetime** + 30 days after deletion | 30-day cooling-off | ✅ Yes (after cooling-off) | ✅ Post-deletion cron |
| 9 | **Match History** | **Account lifetime** + 1 year after deletion | DPDP Act §8(8) | ❌ No | ✅ Post-deletion cron |
| 10 | **Interests (Likes)** | **Account lifetime** | Operational purpose | ✅ Yes | ✅ On account deletion |
| 11 | **Profile Visit Logs** | **30 days** from visit | Operational purpose | ✅ Yes | ✅ Daily cron |
| 12 | **Notifications** | **30 days** from creation | Operational purpose | ✅ Yes | ✅ Daily cron |
| 13 | **Reports (Filed by user)** | **2 years** from submission | IT Rules 2021 §3(1)(a) | ❌ No | ✅ Bi-annual cron |
| 14 | **Reports (About user)** | **2 years** from submission | IT Rules 2021 §3(1)(a) | ❌ No | ✅ Bi-annual cron |
| 15 | **Moderation Logs** | **2 years** from action | IT Rules 2021 §4(1)(d) | ❌ No | ✅ Bi-annual cron |
| 16 | **Consent History** | **Account lifetime** + 1 year | DPDP Act §6 (proof of consent) | ❌ No | ✅ Post-deletion cron |
| 17 | **Payment Records** | **8 years** from transaction | Income Tax Act §44AA | ❌ No | ✅ Annual cron |
| 18 | **Success Stories** | **Indefinite** (with user consent) | Explicit consent | ✅ Yes (withdraw consent) | ❌ Manual |
| 19 | **Referral Codes** | **Account lifetime** | Operational purpose | ✅ Yes | ✅ On account deletion |
| 20 | **Inactive Accounts** | **1 year** of inactivity → 30-day warning → deletion | DPDP Act §8(7) | N/A | ✅ Daily cron |

---

## 3. Automated Enforcement

### 3.1 Daily Cleanup (runs at 03:00 IST)

A scheduled Cloud Function processes the following every day:

```
03:00 IST — Daily Retention Cleanup
├── Delete messages older than 90 days        (batch of 500/run)
├── Delete voice note files older than 90 days (Storage cleanup)
├── Delete chat photo files older than 90 days (Storage cleanup)
├── Delete analytics events older than 90 days (Umami + local)
├── Delete location sessions older than 24h
├── Delete profile visit logs older than 30 days
├── Delete notifications older than 30 days
├── Flag accounts inactive > 335 days (send warning)
└── Delete accounts inactive > 395 days (335 + 30 + 30 grace)
```

### 3.2 Hourly Cleanup

```
Every hour — Location Data Cleanup
└── Delete expired "Share My Date" sessions (24h TTL)
```

### 3.3 Post-Deletion Cleanup (runs on account deletion + 30 days)

```
After 30-day cooling-off expires
├── Delete all profile data
├── Delete all profile photos from Storage
├── Unlink all matches (remove user from match records)
├── Delete all sent interests
├── Delete all notifications
├── Delete Firebase Auth account
├── Retain: consent log (1 year), payments (8 years), moderation (2 years)
└── Send confirmation email
```

### 3.4 Client-Side Cleanup (on app startup)

```typescript
// Called in layout.tsx on every page load
import { cleanupLocalAnalytics } from "@/lib/privacy/retention-policy";
cleanupLocalAnalytics(); // Removes analytics events older than 90 days from localStorage
```

---

## 4. User-Initiated Deletion

### 4.1 Account Deletion

**Path:** Settings → Account → Delete Account

**Flow:**
1. User selects reason (optional) and provides feedback
2. User reviews what will be deleted and what will be retained (with legal reasons)
3. User types "DELETE" to confirm
4. Account immediately deactivated (hidden from others)
5. 30-day cooling-off period begins
6. Reminders sent at Day 7 and Day 25
7. If no reactivation, permanent deletion at Day 30

**Reactivation:** User can reactivate at any time during the cooling-off period by simply logging in. All data is restored.

### 4.2 Specific Data Deletion

Users can delete specific data without deleting their account:

| Action | How | Effect |
|--------|-----|--------|
| Delete a message | Long-press → Delete | Message removed from both sides |
| Delete a photo | Profile → Edit Photos → Remove | Photo deleted from Storage |
| Clear chat history | Chat → ⋮ Menu → Clear Chat | All messages in that chat deleted |
| Clear analytics | Settings → Privacy → Export & Delete → Delete My Data | localStorage analytics cleared |
| Withdraw consent | Settings → Privacy → Consent → Toggle off | Future data collection stopped; existing data deleted per retention schedule |

### 4.3 Right to Erasure (DPDP Act §12)

If a user contacts dpo@bandhan.ai requesting data erasure:
1. Identity verified (phone OTP or email confirmation)
2. Data scope confirmed with the user
3. Deletion executed within 30 days
4. Confirmation sent to the user
5. Consent log retained (legal requirement)

---

## 5. Inactive Account Policy

### Timeline

```
Day 0            User last seen
                 │
Day 335          ┌──────────────────────────────────────┐
(11 months)      │  WARNING: "Your account will be      │
                 │  deleted in 30 days due to inactivity.│
                 │  Log in to keep your account."        │
                 │  Sent via: SMS + Email (if available)  │
                 └──────────────────────────────────────┘
                 │
Day 365          ┌──────────────────────────────────────┐
(12 months)      │  FINAL WARNING: "Your account will   │
                 │  be deleted in 30 days."              │
                 └──────────────────────────────────────┘
                 │
Day 395          ┌──────────────────────────────────────┐
                 │  DELETION: Full account deletion      │
                 │  (same process as user-initiated)     │
                 └──────────────────────────────────────┘
```

### Exemptions
- **Premium accounts:** Not auto-deleted while subscription is active
- **Pending reports:** Account retained until all reports are resolved
- **Legal holds:** Account retained if under legal investigation

---

## 6. Data Minimisation Practices

### What We DON'T Collect
- ❌ Aadhaar number (DigiLocker verification is pass/fail only)
- ❌ Exact GPS coordinates (we use city-level location only)
- ❌ Contact list / phone book
- ❌ Browsing history outside the app
- ❌ Biometric data (photo verification uses AI comparison, not biometrics storage)
- ❌ Caste/religion unless explicitly provided by the user
- ❌ Financial details (Razorpay handles payments; we only store transaction IDs)

### Data Collected Per Purpose

| Purpose | Data Collected | Minimisation Measure |
|---------|---------------|---------------------|
| **Authentication** | Phone number, Google account ID | Phone is primary; email optional |
| **Profile** | Name, age, city, bio, photos | Only name + age required; rest optional |
| **Matching** | Preferences, dealbreakers, intent | Used only for algorithm; not shared with other users |
| **Safety** | Reports, blocks, verification status | Verification result is pass/fail only |
| **Analytics** | Anonymised events, page views | No PII in analytics; IP anonymised |
| **Payments** | Transaction ID, amount, status | Card/bank details handled by Razorpay |

---

## 7. Legal Holds

In certain circumstances, data that would otherwise be deleted must be preserved:

| Scenario | Action | Duration |
|----------|--------|----------|
| Active law enforcement request | Freeze all data for the specified user | Until request is fulfilled |
| Pending litigation | Freeze data related to the dispute | Until litigation concludes |
| Active report investigation | Retain reported content until resolved | Until resolution + 90 days |
| Government order (IT Act §69) | Comply with decryption/disclosure order | As specified in the order |

Legal holds override the normal retention schedule. The Grievance Officer is responsible for managing legal holds.

---

## 8. Technical Implementation

### File Reference

| File | Purpose |
|------|---------|
| `lib/privacy/consent-manager.ts` | Granular consent management (local + Firestore) |
| `lib/privacy/data-export.ts` | User data export builder (DPDP §11) |
| `lib/privacy/data-deletion.ts` | Account deletion workflow (DPDP §12) |
| `lib/privacy/retention-policy.ts` | Retention rules + client-side cleanup |
| `components/privacy/DataConsentSettings.tsx` | Consent toggle UI in Settings |
| `components/privacy/DataExportButton.tsx` | Data export button component |
| `components/privacy/AccountDeletionFlow.tsx` | Multi-step deletion modal |
| `components/ConsentBanner.tsx` | First-visit consent banner |

### Firestore Collections Affected

| Collection | Retention Cron | Deletion Field |
|------------|---------------|----------------|
| `messages` | Daily at 03:00 | `timestamp < (now - 90 days)` |
| `profileVisits` | Daily at 03:00 | `timestamp < (now - 30 days)` |
| `notifications` | Daily at 03:00 | `timestamp < (now - 30 days)` |
| `reports` | Bi-annually | `createdAt < (now - 2 years)` |
| `users` | Daily (inactive check) | `lastSeenAt < (now - 395 days)` |

### Storage Buckets Affected

| Path Pattern | Retention | Cleanup |
|-------------|-----------|---------|
| `users/{uid}/photos/*` | Account lifetime + 30 days | Post-deletion cron |
| `matches/{matchId}/voice/*` | 90 days | Daily cron |
| `matches/{matchId}/photos/*` | 90 days | Daily cron |

---

## 9. Audit & Review

### Quarterly Review
- [ ] Verify automated cleanup is running correctly (check Cloud Function logs)
- [ ] Sample 10 deleted accounts to confirm all data was removed
- [ ] Review retention periods for regulatory changes
- [ ] Check that no PII exists in analytics data
- [ ] Verify data localisation (all PII in asia-south1)

### Annual Review
- [ ] Full retention policy review with legal counsel
- [ ] Update for any new DPDP Act rules or amendments
- [ ] Publish transparency report (number of deletions, legal requests)
- [ ] Train team on updated retention practices
- [ ] Audit third-party data processors (Firebase, Razorpay)

### Metrics Tracked
- Number of account deletions per month
- Average time to complete deletion (target: < 30 days)
- Number of data export requests per month
- Number of inactive account warnings sent
- False positive rate in automated cleanup

---

## 10. Hindi Summary (हिंदी सारांश)

> **नोट:** यह सारांश केवल सुविधा के लिए है। विवाद की स्थिति में, अंग्रेजी संस्करण मान्य होगा।

### डेटा प्रतिधारण अवधि

| डेटा श्रेणी | अवधि | उपयोगकर्ता द्वारा जल्दी हटाना |
|-------------|-------|-------------------------------|
| चैट संदेश | 90 दिन | ✅ हाँ |
| वॉइस नोट | 90 दिन | ✅ हाँ |
| एनालिटिक्स | 90 दिन | ✅ हाँ |
| स्थान डेटा | 24 घंटे | ✅ हाँ |
| प्रोफ़ाइल डेटा | खाता जीवनकाल + 1 वर्ष | ❌ कानूनी आवश्यकता |
| भुगतान रिकॉर्ड | 8 वर्ष | ❌ आयकर अधिनियम |
| मॉडरेशन लॉग | 2 वर्ष | ❌ IT नियम 2021 |
| निष्क्रिय खाते | 1 वर्ष निष्क्रियता | स्वचालित |

### खाता हटाना

1. सेटिंग्स → खाता → खाता हटाएं
2. कारण चुनें (वैकल्पिक)
3. क्या हटाया जाएगा, इसकी समीक्षा करें
4. "DELETE" टाइप करके पुष्टि करें
5. 30-दिन की कूलिंग-ऑफ अवधि शुरू
6. इस अवधि में लॉग इन करके खाता पुनः सक्रिय करें
7. 30 दिन बाद स्थायी रूप से हटाया जाएगा

### आपके अधिकार (DPDP अधिनियम 2023)

- **§11 — पहुँच का अधिकार:** अपना सभी डेटा JSON में डाउनलोड करें
- **§12 — सुधार का अधिकार:** प्रोफ़ाइल संपादित करके जानकारी सुधारें
- **§12 — मिटाने का अधिकार:** खाता और सभी डेटा स्थायी रूप से हटाएं
- **§13 — शिकायत का अधिकार:** grievance@bandhan.ai पर संपर्क करें
- **§14 — नामांकन का अधिकार:** dpo@bandhan.ai पर नॉमिनी पंजीकरण करें

---

**© 2026 Bandhan AI. All rights reserved.**

*This document was last updated on 28 February 2026. A qualified Indian lawyer must review and finalise this document before publication.*
