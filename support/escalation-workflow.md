# Bandhan AI — Support Escalation Workflow

---

## Tier 1: AI Chatbot (Instant)
- **Handles:** FAQ queries, common questions, navigation help
- **SLA:** Immediate (0 seconds)
- **Escalates when:** No FAQ match found, user asks for human, complaint detected

## Tier 2: Support Team (24h)
- **Handles:** Account issues, billing queries, profile help, feature questions
- **SLA:** First response within 24 hours, resolution within 72 hours
- **Escalates when:** Safety report, legal issue, technical bug, unable to resolve

## Tier 3: Engineering / Founders (4h for critical)
- **Handles:** Critical bugs, safety incidents, legal threats, data breaches
- **SLA:** 4 hours for critical, 24 hours for high priority
- **Escalates when:** Never — this is the final tier

---

## Priority Matrix

| Category | Priority | Response SLA | Resolution SLA | Handler |
|----------|----------|-------------|----------------|---------|
| Safety report (harassment, threats) | 🔴 Critical | 4 hours | 24 hours | Tier 3 |
| Payment failure / wrong charge | 🟠 High | 12 hours | 48 hours | Tier 2 |
| Bug report (app crash) | 🟠 High | 24 hours | 72 hours | Tier 2 → Tier 3 |
| Account locked / verification issue | 🟡 Medium | 24 hours | 72 hours | Tier 2 |
| Profile / match question | 🟢 Low | 24 hours | 72 hours | Tier 1 → Tier 2 |
| Feature request | 🟢 Low | 48 hours | N/A (logged) | Tier 1 |

---

## Escalation Triggers

### Auto-escalate to Tier 2 (from chatbot)
- User types "talk to human" or similar
- User sends 3+ messages without satisfaction
- Complaint keywords detected (angry, frustrated, scam)
- Billing or payment related query

### Auto-escalate to Tier 3 (from Tier 2)
- Safety keyword: harassment, abuse, threat, stalking, blackmail
- Legal keyword: lawyer, court, police, FIR, legal action
- Data keyword: breach, leak, data stolen
- System keyword: all users affected, site down, database

---

## Response Templates

### Acknowledgment (Tier 2)
```
Hi [Name],

Thank you for reaching out. We've received your message and a team member will respond within 24 hours.

Ticket ID: [TICKET_ID]

If this is urgent, please email us at support@bandhan.ai with your ticket ID.

— Team Bandhan
```

### Resolution
```
Hi [Name],

Your issue has been resolved: [RESOLUTION_DETAILS]

If you have any other questions, feel free to reply to this ticket.

Thank you for using Bandhan AI.

— [AGENT_NAME], Team Bandhan
```

### Safety Escalation (Internal)
```
⚠️ SAFETY ESCALATION

User: [USER_ID]
Reported user: [REPORTED_USER_ID]
Category: [HARASSMENT / THREAT / ABUSE]
Details: [DESCRIPTION]
Evidence: [SCREENSHOTS / MESSAGES]

ACTION REQUIRED WITHIN 4 HOURS:
1. Review reported content
2. Suspend reported user (if warranted)
3. Notify reporting user of action taken
4. Log in moderation audit trail
```

---

## Moderation Actions

| Action | When | Reversible | Notification |
|--------|------|------------|--------------|
| Warning | First minor offense | Yes | In-app + email |
| 24h suspension | Second offense or moderate violation | Yes | In-app + email |
| 7-day suspension | Serious violation | Yes (appeal) | In-app + email |
| Permanent ban | Severe/repeated violation | Yes (appeal within 30 days) | Email only |
| Content removal | Inappropriate content flagged | No | In-app |

## Appeal Process

1. User emails appeal@bandhan.ai within 30 days of action
2. Different team member reviews (not the original moderator)
3. Decision communicated within 7 business days
4. Decision is final
