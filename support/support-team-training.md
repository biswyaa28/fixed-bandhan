# Bandhan AI — Support Team Training Guide

> **Audience:** All support and moderation team members
> **Review:** Quarterly. Mandatory re-read after each policy update.

---

## 1. Our Mission

We help Indians find their life partner safely and respectfully. Every support interaction should reflect that mission. Users trust us with the most personal part of their lives — honour that trust.

---

## 2. Core Principles

### Be Human First
- Use the person's name
- Acknowledge their feelings before solving the problem
- Never copy-paste a template without personalizing it
- If you'd be annoyed receiving your own reply, rewrite it

### Be Fast
- First response within 24 hours (target: 4 hours)
- Safety reports: respond within 4 hours
- Billing issues: resolve within 48 hours
- If you can't solve it, acknowledge and give a timeline

### Be Honest
- Never promise what you can't deliver
- If you don't know the answer, say so and escalate
- If it's our bug, own it. Don't blame the user.
- If the user is wrong, be kind but clear

### Be Safe
- Women's safety reports get automatic Tier 3 escalation
- Never share one user's data with another user
- Never share a user's phone number or location
- When in doubt, prioritize safety over engagement

---

## 3. Response Templates

### Use these as STARTING POINTS, not final messages

**Greeting:**
> Hi [Name], thank you for reaching out to Bandhan support. I'm [Your Name] and I'll be helping you today.

**Acknowledgment:**
> I understand this is frustrating, and I want to help resolve this as quickly as possible.

**Resolution:**
> Great news — I've [action taken]. You should see the change in your app within [time]. Let me know if there's anything else I can help with!

**Escalation:**
> I want to make sure this gets the attention it deserves, so I'm escalating this to our senior team. You'll hear back within [time]. Your ticket ID is [ID] for reference.

**Closing:**
> Is there anything else I can help you with? Wishing you all the best in finding your life partner! 🤝

---

## 4. Common Scenarios

### "I can't log in / OTP not received"
1. Confirm phone number format (+91 XXXXXXXXXX)
2. Ask them to check SMS spam/blocked folder
3. Check if their carrier is known for SMS delays (BSNL, some MTNL)
4. Offer Google Sign-In as alternative
5. If persistent: escalate to engineering (possible Firebase Auth issue)

### "I matched with someone and they unmatched me"
1. Be empathetic: "I understand that's disappointing"
2. Explain: unmatching is a normal part of the process
3. Do NOT reveal the other person's reasons (privacy)
4. Encourage: "Your perfect match is still out there"
5. If they're upset: suggest completing their profile for better matches

### "I want a refund"
1. Check: was the subscription within 7 days?
2. Within 7 days: process full refund, no questions asked
3. After 7 days: explain pro-rated refund policy
4. For App Store/Play Store subscriptions: guide them to store settings
5. Always be generous — a ₹499 refund costs less than a 1-star review

### "Someone is harassing me"
1. **PRIORITY: Escalate to Tier 3 immediately**
2. Ask: "Can you share screenshots or the message content?"
3. Reassure: "We take this very seriously. The person will be investigated within 4 hours."
4. Action: Temporarily restrict the reported user's messaging
5. Follow up within 24 hours with the action taken
6. Offer: "Would you like us to help you block this person?"

### "I think this profile is fake"
1. Thank them for reporting
2. Ask for the profile name/details they saw
3. Check verification level (Bronze/Silver/Gold)
4. If unverified: flag for moderation review
5. If verified: investigate more deeply (possible stolen photos)
6. Respond within 24h with outcome

### "How do I delete my account?"
1. Confirm they want permanent deletion (not just deactivation)
2. Guide: Settings → Account → Delete Account
3. Explain: all data deleted within 30 days (DPDP Act)
4. Ask (optional): "We'd love to know why — any feedback helps us improve"
5. Process immediately. Never add friction to deletion.

---

## 5. Cultural Sensitivity Guidelines

### Language
- Many users are more comfortable in Hindi — switch if they initiate in Hindi
- Avoid colloquialisms that may not translate well
- Use "life partner" instead of "boyfriend/girlfriend" — our users seek marriage
- Use "showing interest" instead of "liking" — more culturally appropriate

### Family Dynamics
- Some accounts may be managed by parents — be respectful
- Never judge family involvement in matchmaking
- The Family View PDF is a feature, not a workaround

### Religious & Caste Sensitivity
- Never make assumptions about a user's beliefs
- If a user reports caste-based harassment, escalate to Tier 3 immediately
- Our filters include religion/community by user choice — never impose
- Treat all communities with equal respect

### Regional Differences
- Users from Tier 2/3 cities may have slower internet — be patient
- Users may use Hindi-English mix (Hinglish) — respond accordingly
- Festival greetings are welcome but keep them inclusive

---

## 6. Moderation Decisions

### Three-Strike Policy

| Strike | Action | Duration | Reversible |
|--------|--------|----------|------------|
| 1st | Warning (in-app + email) | Permanent record | N/A |
| 2nd | 7-day suspension | 7 days | Auto-lifts |
| 3rd | Permanent ban | Indefinite | Appeal within 30 days |

### Immediate Ban (No Strikes)
These violations result in instant permanent ban:
- Underage user (< 18)
- Scam/fraud attempts
- Sharing explicit sexual content
- Threats of violence
- Impersonating another person with their photos

### Grey Areas (Discuss with Team Lead)
- User complains about match quality → product feedback, not moderation
- User sends too many messages to one person → borderline, depends on content
- Profile text in a language you don't read → escalate, don't guess
- User asks for another user's phone number → deny, explain in-app calling

---

## 7. Tools Access

| Tool | Purpose | Access Level |
|------|---------|-------------|
| `/admin/moderation` | Ticket queue, ban management | All support staff |
| `/admin/users` | User profiles, activity | Senior support only |
| Firebase Console | Direct database access | Engineering only |
| Sentry | Error logs | Engineering only |
| support@bandhan.ai | Email inbox | All support staff |

---

## 8. Self-Care

Dealing with harassment reports and angry users is emotionally taxing. Please:

- Take breaks when you need them
- Don't take negative feedback personally
- If a case is affecting you, pass it to another team member
- We have a zero-tolerance policy for abuse directed at our team — escalate to founders
- Monthly team check-ins for well-being

---

*Last updated: 28 February 2026*
