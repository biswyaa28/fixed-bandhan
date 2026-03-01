# Bandhan AI — Pre-Launch Checklist

> **Purpose:** Every item must be checked before going live.
> **Rule:** No launch with any P0 (critical) item unchecked.

---

## 🔴 P0 — Critical (Launch Blockers)

### Product
- [ ] All P0/P1 bugs resolved — zero known crashes
- [ ] Authentication flow works (Phone OTP + Google Sign-In)
- [ ] Profile creation completes successfully
- [ ] Match creation works (mutual like → match)
- [ ] Chat messaging sends/receives in real-time
- [ ] Safety button ("Share My Date") sends SMS
- [ ] Payment flow completes (UPI + card)
- [ ] Premium features gated correctly (free vs paid)

### Performance
- [ ] Lighthouse score ≥90 on mobile
- [ ] Time to Interactive <3s on 3G connection
- [ ] Initial bundle <150KB
- [ ] No memory leaks (tested 30-min session)

### Security
- [ ] `npm audit` — zero high/critical vulnerabilities
- [ ] CSP headers configured on all routes
- [ ] Firebase security rules deployed and tested
- [ ] No hardcoded API keys in source code
- [ ] Rate limiting active (Firebase App Check)

### Legal & Compliance
- [ ] Privacy policy live at public URL
- [ ] Terms of service live at public URL
- [ ] DPDP Act consent flow implemented
- [ ] Grievance officer details published
- [ ] Age gate (18+) on signup
- [ ] Content rating questionnaire submitted to stores

### App Stores
- [ ] Apple App Store submission approved
- [ ] Google Play Store submission approved
- [ ] All screenshots uploaded (6 per platform)
- [ ] App icon, feature graphic uploaded
- [ ] In-app purchase products configured and tested

---

## 🟡 P1 — High Priority (Fix within 48h post-launch)

### Product
- [ ] Offline mode handles network loss gracefully
- [ ] Push notifications deliver on Android + iOS
- [ ] Image compression works (photos <500KB)
- [ ] Voice note recording/playback works
- [ ] Skeleton loaders shown during data fetch
- [ ] Empty states have helpful messaging
- [ ] Hindi translations complete for core flows

### Monitoring
- [ ] Sentry error tracking configured (client + server)
- [ ] Umami analytics tracking pageviews and events
- [ ] Health check endpoint (`/api/health`) returns 200
- [ ] Uptime monitoring configured (free tier: UptimeRobot)
- [ ] Alert thresholds set (error rate >5%, p95 latency >1s)

### Operations
- [ ] Support email configured (support@bandhan.ai)
- [ ] FAQ page published with top 10 questions
- [ ] Moderation queue accessible to team
- [ ] Escalation workflow documented
- [ ] On-call rotation for launch week defined

---

## 🟢 P2 — Nice to Have (Fix within Week 2)

### Product Polish
- [ ] Animations run at 60fps on mid-range devices
- [ ] Custom 404 page styled
- [ ] Custom error page styled
- [ ] PWA install prompt shows on Android
- [ ] Service worker caches critical assets
- [ ] "Rate us" prompt configured (triggers after first match)

### Marketing
- [ ] Landing page live with download links
- [ ] Press kit assembled (logos, screenshots, fact sheet)
- [ ] Social media accounts created and branded
- [ ] Waitlist email template ready
- [ ] Referral system tested end-to-end

### Documentation
- [ ] DEPLOYMENT.md updated with production steps
- [ ] CONTRIBUTING.md complete for open-source contributors
- [ ] API documentation for any public endpoints
- [ ] Runbook for common operational issues

---

## Launch Day Team Assignments

| Role | Person | Responsibility |
|------|--------|---------------|
| **Incident Commander** | [Founder 1] | Final go/no-go decision, crisis communication |
| **Engineering Lead** | [Engineer] | Monitor errors, deploy hotfixes, on-call |
| **Product Lead** | [Founder 2] | Monitor metrics, user feedback, app store reviews |
| **Marketing Lead** | [Marketing] | Execute social media calendar, press distribution |
| **Support Lead** | [Support] | Respond to user queries, moderate reports |

---

## Go / No-Go Decision

**Time:** Launch Day, 7:30 AM IST
**Attendees:** All team members
**Criteria:**

| Check | Status |
|-------|--------|
| All P0 items green? | ☐ |
| App Store approvals received? | ☐ |
| Monitoring dashboards live? | ☐ |
| Team on standby confirmed? | ☐ |
| Contingency plans reviewed? | ☐ |

**Decision:** ☐ GO / ☐ NO-GO (delay by ___ days)
