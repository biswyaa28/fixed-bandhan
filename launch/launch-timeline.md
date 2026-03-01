# Bandhan AI — Launch Timeline

> **Target Launch Date:** [TBD — insert when App Store approval is confirmed]
> **Status:** Pre-launch
> **Owner:** Founding team

---

## Week -4 (T-28 days)

### Product
- [ ] All critical bugs fixed (P0/P1 zero)
- [ ] Performance audit — Lighthouse 90+ on all routes
- [ ] Security audit — `npm audit` clean, OWASP ZAP scan passed
- [ ] Beta testing with 50+ users — feedback incorporated
- [ ] Load testing — handles 1,000 concurrent users
- [ ] Offline mode verified on 2G network
- [ ] Hindi translations reviewed by native speaker

### App Store Submission
- [ ] Apple App Store submission (allow 7-14 day review)
- [ ] Google Play Store submission (allow 3-7 day review)
- [ ] All screenshots created (6 per platform)
- [ ] Feature graphic (1024×500) designed
- [ ] App icon finalized (1024×1024)
- [ ] Privacy policy URL live
- [ ] Content rating questionnaire completed
- [ ] In-app purchase configuration tested

### Marketing Preparation
- [ ] Press kit assembled (logo, screenshots, founder bios, fact sheet)
- [ ] Press release drafted and approved
- [ ] List of 20 journalists/bloggers compiled
- [ ] Landing page live with waitlist form
- [ ] Social media profiles created (Instagram, LinkedIn, Twitter)

### Influencer Outreach
- [ ] 10 relationship coaches contacted
- [ ] 5 tech bloggers contacted
- [ ] 3 campus ambassadors recruited
- [ ] Beta access provided to all influencers

---

## Week -2 (T-14 days)

### Product
- [ ] App Store approval received (or escalate)
- [ ] Final QA pass on production build
- [ ] Monitoring dashboards live (Sentry, Umami)
- [ ] Support email (support@bandhan.ai) configured
- [ ] FAQ page published
- [ ] In-app feedback form tested

### Marketing
- [ ] Landing page launch — collect waitlist emails
- [ ] Social media teaser campaign begins
  - Day 1: "Something new is coming for Indian marriages"
  - Day 3: Feature reveal — AI matching
  - Day 5: Feature reveal — DigiLocker verification
  - Day 7: Feature reveal — Family View PDF
  - Day 9: "2 days to go" countdown
- [ ] WhatsApp broadcast list created (beta users)
- [ ] Email template finalized for waitlist announcement
- [ ] Reddit posts in r/india, r/IndianMatchmaking (non-promotional, story-based)

### Operations
- [ ] Grievance officer details published
- [ ] Moderation team briefed and on standby
- [ ] Support response SLA defined (24h)
- [ ] Escalation workflow documented
- [ ] Crisis communication plan reviewed

---

## Launch Week (T-0)

### Day -1 (Eve)
- [ ] Final production deployment
- [ ] Health check on all endpoints
- [ ] Team all-hands — launch briefing
- [ ] Pre-schedule all social media posts
- [ ] Email campaign queued (send at 10:00 AM IST)
- [ ] Monitoring alerts configured (error spike, API latency)

### Day 0 (Launch Day 🚀)

**Morning (8:00 AM IST)**
- [ ] App Store listing goes live (if approved)
- [ ] Play Store listing goes live
- [ ] Landing page updated: "Download Now" replaces waitlist

**10:00 AM IST**
- [ ] Waitlist email sent: "Bandhan AI is live!"
- [ ] Social media launch posts (all platforms simultaneously)
- [ ] Press release distributed to media contacts
- [ ] WhatsApp broadcast to beta users
- [ ] LinkedIn post by founders (personal accounts)
- [ ] Reddit announcement (r/india, r/startups)

**Ongoing (All Day)**
- [ ] Monitor app store for review approval delays
- [ ] Monitor Sentry for crash reports
- [ ] Monitor social media for mentions/feedback
- [ ] Respond to all app store reviews within 4 hours
- [ ] Team standup every 3 hours (8am, 11am, 2pm, 5pm, 8pm)

### Day 1 (Post-Launch)
- [ ] Review overnight metrics (downloads, signups, crashes)
- [ ] Fix any critical bugs discovered
- [ ] Respond to all user feedback
- [ ] Follow-up social media posts (user count milestone if applicable)
- [ ] Thank-you email to beta testers

### Day 2-3
- [ ] Collect first 10 app store reviews (prompt happy users)
- [ ] Address any negative reviews publicly
- [ ] Blog post: "Why We Built Bandhan AI" (founder story)
- [ ] Instagram Stories: Behind-the-scenes of launch

### Day 4-5
- [ ] Analyze first-week funnel (signup → profile → match → message)
- [ ] Identify top 3 drop-off points
- [ ] Prioritize v1.1 bug fixes
- [ ] Follow-up with press contacts who haven't responded

### Day 6-7
- [ ] Week 1 metrics report (downloads, MAU, matches, messages)
- [ ] Team retrospective: What went well, what didn't
- [ ] Plan v1.1 release (target: 2 weeks post-launch)
- [ ] Begin A/B tests on onboarding flow

---

## Week +1 (T+7)

### Product
- [ ] v1.1 release with critical bug fixes
- [ ] Performance optimizations based on real-user data
- [ ] Review and respond to ALL app store reviews
- [ ] Collect NPS from first 100 users

### Growth
- [ ] Activate referral program ("Invite 3 friends, get 1 week Premium")
- [ ] Launch campus ambassador program at 3 colleges
- [ ] Publish first success story (if available)
- [ ] Social media: Feature highlight series (1 feature/day)

### Operations
- [ ] Review moderation queue — adjust filters if needed
- [ ] Review support tickets — update FAQ with common questions
- [ ] Review false positive rates in content moderation
- [ ] Update onboarding based on drop-off data

---

## Week +2 to +4 (T+14 to T+28)

### Product Iteration
- [ ] v1.2 with top user-requested features
- [ ] Onboarding A/B test results — implement winner
- [ ] Voice note feature polish
- [ ] Push notification optimization

### Growth Scaling
- [ ] 5 college campus partnerships active
- [ ] 500+ daily active users target
- [ ] First paid Instagram/Google ad experiment (₹5,000 budget)
- [ ] WhatsApp community of 200+ engaged users

### Business
- [ ] Month 1 financial review
- [ ] Investor update email (if applicable)
- [ ] Begin seed round conversations (if traction warrants)

---

## Contingency Plans

### If App Store approval is delayed
- **Action:** Use TestFlight (iOS) / open testing (Android) for first 1,000 users
- **Timeline:** Shift launch by 1 week max
- **Communication:** "Early access" messaging to maintain excitement

### If critical bug discovered on launch day
- **Action:** Hotfix within 4 hours or roll back to previous version
- **Communication:** In-app banner: "We're fixing a small issue — back shortly"
- **Owner:** Lead engineer on-call

### If negative press/review goes viral
- **Action:** Acknowledge publicly within 2 hours, fix root cause within 24h
- **Communication:** Transparent, non-defensive response
- **Owner:** Founder + communications lead

### If server overload
- **Action:** Scale Firebase hosting (automatic), enable rate limiting
- **Communication:** "Overwhelmed by demand — scaling up!"
- **Threshold:** >500ms p95 latency triggers alert
