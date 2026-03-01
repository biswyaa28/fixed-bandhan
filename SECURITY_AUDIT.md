# Bandhan AI — Security Audit Checklist

> **OWASP Top 10 (2021)** compliance tracker.
> Review quarterly. Last audit: **2026-02-28**
> Next scheduled audit: **2026-05-28**

---

## ✅ A01:2021 — Broken Access Control

| Control | Status | Implementation |
|---------|--------|----------------|
| Server-side CSRF validation | ✅ Done | `middleware.ts` — Origin/Referer checking on all mutating requests |
| Firebase Auth on every API call | ✅ Done | `lib/security.ts` — `secureHeaders()` attaches Bearer token |
| Firestore security rules | ✅ Done | `firestore.rules` — users can only read/write own docs |
| Rate limiting per IP | ✅ Done | `middleware.ts` — 100 req/min API, 10 req/min auth |
| Rate limiting per user | ✅ Done | `middleware.ts` — per-IP + route-class rate limits |
| Deny by default | ✅ Done | CSP `default-src 'self'` + Firestore rules deny all unless matched |
| CORS restricted | ✅ Done | `middleware.ts` — TRUSTED_ORIGINS whitelist |
| Path traversal blocked | ✅ Done | `middleware.ts` — `detectSuspiciousRequest()` |
| Frame embedding blocked | ✅ Done | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |

**Action items:**
- [ ] Enable Firebase App Check for additional device attestation
- [ ] Add per-user rate limiting using Firebase Auth UID from token

---

## ✅ A02:2021 — Cryptographic Failures

| Control | Status | Implementation |
|---------|--------|----------------|
| HTTPS only | ✅ Done | HSTS header + `upgrade-insecure-requests` CSP directive |
| No hardcoded secrets | ✅ Done | All secrets via `.env.local` (NEXT_PUBLIC_ prefix for client-safe only) |
| PII never logged | ✅ Done | `lib/security.ts` — `redactPII()` on all log/error output |
| PII redacted from Sentry | ✅ Done | `sentry.client.config.ts` — beforeSend scrubs PII |
| Firebase tokens short-lived | ✅ Done | 1-hour expiry (Firebase default), `refreshAuthToken()` on 401 |
| Aadhaar/PAN never stored in Firestore | ✅ Done | DigiLocker verification via API only, no raw storage |
| Passwords hashed (if applicable) | N/A | Phone OTP + Google OAuth only, no password storage |

**Action items:**
- [ ] Audit `.env.local` for any leaked NEXT_PUBLIC_ values that should be server-only
- [ ] Rotate Firebase service account key quarterly

---

## ✅ A03:2021 — Injection

| Control | Status | Implementation |
|---------|--------|----------------|
| HTML stripped from all input | ✅ Done | `lib/security.ts` — `stripHtml()`, `sanitizeText()`, `sanitizeName()` |
| SQL injection blocked | ✅ Done | No SQL DB — Firestore with parameterized queries. Middleware blocks SQL patterns. |
| NoSQL injection blocked | ✅ Done | Firestore rules validate field types. Zod schemas enforce types at client. |
| XSS prevention | ✅ Done | CSP blocks inline scripts. `escapeHtml()` for output. `stripHtml()` for input. |
| URL scheme validation | ✅ Done | `sanitizeUrl()` — only http/https allowed |
| File upload validation | ✅ Done | MIME type + extension + magic bytes validation |
| Zod schemas on all forms | ✅ Done | `lib/validation.ts` — 30+ schemas covering every user input |

**Action items:**
- [ ] Add Content-Type checking on API request bodies (reject non-JSON for API routes)
- [ ] Consider adding DOMPurify for any future rich-text fields

---

## ✅ A04:2021 — Insecure Design

| Control | Status | Implementation |
|---------|--------|----------------|
| Threat modelling done | ⬜ TODO | Document top 5 attack scenarios for Indian dating context |
| Business logic abuse prevention | ✅ Done | Daily like limits, special interest limits, enforced at client + Firestore rules |
| Account enumeration blocked | ✅ Done | Same error message for "phone not found" and "wrong OTP" |
| Profile scraping prevented | ✅ Done | Bot detection + rate limiting + blurred photos for non-matches |
| Photo screenshot detection | ⬜ TODO | Consider CSS-based watermarking for premium photos |

**Action items:**
- [ ] Create threat model document
- [ ] Review business logic for match manipulation vectors

---

## ✅ A05:2021 — Security Misconfiguration

| Control | Status | Implementation |
|---------|--------|----------------|
| Security headers on all routes | ✅ Done | `middleware.ts` — 12+ security headers |
| X-Powered-By removed | ✅ Done | `middleware.ts` + `next.config.js` → `poweredByHeader: false` |
| Server header removed | ✅ Done | `middleware.ts` — `response.headers.delete("Server")` |
| Error details hidden in production | ✅ Done | `compiler.removeConsole` + generic error pages |
| Default credentials changed | N/A | Firebase Auth — no default credentials |
| Unused features disabled | ✅ Done | `next.config.js` — strict `Permissions-Policy` |
| CSP in enforce mode | ✅ Done | Full CSP with nonce, report-uri in production |
| security.txt published | ✅ Done | `middleware.ts` — serves at `/.well-known/security.txt` |

**Action items:**
- [ ] Run `npx next lint` weekly
- [ ] Run `npm audit --production` weekly (automated via `security:audit` script)
- [ ] Test headers at securityheaders.com monthly

---

## ✅ A06:2021 — Vulnerable and Outdated Components

| Control | Status | Implementation |
|---------|--------|----------------|
| npm audit clean | ⬜ Check | Run `npm run security:audit` |
| Dependabot / Renovate enabled | ⬜ TODO | Set up GitHub Dependabot for automatic PRs |
| No known CVEs in production deps | ⬜ Check | Run `npm audit --production --audit-level=high` |
| Lock file committed | ✅ Done | `package-lock.json` committed |
| Node.js LTS version | ✅ Done | `engines.node >= 18.17.0` |

**Action items:**
- [ ] Set up Dependabot alerts in GitHub repository settings
- [ ] Schedule monthly dependency update review
- [ ] Run `npm run security:audit` in CI pipeline

---

## ✅ A07:2021 — Identification and Authentication Failures

| Control | Status | Implementation |
|---------|--------|----------------|
| OTP brute-force protection | ✅ Done | 10 req/min on auth routes + client-side 5-attempt lockout (15 min) |
| OTP expiry | ✅ Done | Firebase Auth OTP expires after 5 minutes |
| Session management | ✅ Done | Firebase ID tokens — 1 hour TTL, auto-refresh |
| Token validation on API calls | ✅ Done | `secureHeaders()` attaches Bearer token, API verifies via firebase-admin |
| Google OAuth (popup) | ✅ Done | Firebase Auth Google provider with popup flow |
| reCAPTCHA v3 on OTP send | ✅ Done | Invisible reCAPTCHA before OTP dispatch |
| Account lockout after failures | ✅ Done | `lib/security.ts` — `recordFailedAttempt()` — 5 failures → 15 min lockout |

**Action items:**
- [ ] Implement device fingerprinting for anomaly detection
- [ ] Add "Unusual sign-in" notifications

---

## ✅ A08:2021 — Software and Data Integrity Failures

| Control | Status | Implementation |
|---------|--------|----------------|
| CSP nonce on scripts | ✅ Done | Per-request nonce in `middleware.ts` |
| SRI for external scripts | ⬜ TODO | Add subresource integrity hashes for CDN scripts |
| CI/CD pipeline secure | ⬜ TODO | GitHub Actions with secrets, no plaintext tokens |
| Deployment reviewed | ✅ Done | `predeploy:check` script runs lint + typecheck + build |

**Action items:**
- [ ] Add SRI hashes for Firebase SDK and Razorpay scripts
- [ ] Set up GitHub Actions with `GITHUB_TOKEN` only (no PATs in secrets)

---

## ✅ A09:2021 — Security Logging and Monitoring Failures

| Control | Status | Implementation |
|---------|--------|----------------|
| PII-safe logging | ✅ Done | `secureLog()` — all logging passes through `redactPII()` |
| Rate limit violations logged | ✅ Done | 429 responses include IP (ops data, not PII) |
| Suspicious requests logged | ✅ Done | `middleware.ts` — `detectSuspiciousRequest()` logs attack type + path |
| CSP violations reported | ✅ Done | `report-uri /api/csp-report` in production CSP |
| Error tracking | ✅ Done | Sentry free tier with PII scrubbing |
| Uptime monitoring | ✅ Done | `/api/health` endpoint |

**Action items:**
- [ ] Set up alerts for >10 rate-limit violations per hour
- [ ] Set up alerts for >5 suspicious request blocks per hour
- [ ] Review CSP violation logs weekly

---

## ✅ A10:2021 — Server-Side Request Forgery (SSRF)

| Control | Status | Implementation |
|---------|--------|----------------|
| No user-controlled URLs in server fetch | ✅ Done | All API URLs are hardcoded (Firebase, Razorpay) |
| URL scheme validation | ✅ Done | `sanitizeUrl()` blocks non-http(s) schemes |
| Internal IP ranges blocked | ⬜ TODO | Add SSRF protection if server-side URL fetching is added |
| DigiLocker callback validated | ✅ Done | Callback URLs validated against whitelist |

**Action items:**
- [ ] If adding any server-side URL fetching, validate against allowlist

---

## ADDITIONAL INDIAN-CONTEXT SECURITY

| Control | Status | Implementation |
|---------|--------|----------------|
| DPDP Act 2023 compliance | ✅ Done | PII redaction, consent banner, data export button |
| Aadhaar data protection | ✅ Done | Never stored — DigiLocker API only, result discarded after verification |
| TRAI OTP compliance | ✅ Done | OTP disclaimer shown, consent checkbox on login |
| Women safety features | ✅ Done | "Share My Date" location sharing, safety button, report/block |
| Harassment protection | ✅ Done | Message reporting, auto-block after 3 reports, admin review queue |
| Fake profile prevention | ✅ Done | Photo verification flow, phone OTP, progressive verification tiers |

---

## WEEKLY SECURITY CHECKLIST

Run every Monday:

```bash
# 1. Dependency audit
npm run security:audit

# 2. Type safety check
npm run type-check

# 3. Lint check (includes a11y + React rules)
npm run lint

# 4. Check security headers (manual — paste URL)
echo "Test at: https://securityheaders.com/?q=https://bandhan.ai"

# 5. Mozilla Observatory (manual — paste URL)
echo "Test at: https://observatory.mozilla.org/analyze/bandhan.ai"

# 6. OWASP ZAP quick scan (install ZAP first)
# docker run -t zaproxy/zap-stable zap-baseline.py -t https://bandhan.ai
```

## MONTHLY SECURITY CHECKLIST

Run on 1st of each month:

1. **Dependency updates**: Review and merge Dependabot PRs
2. **Firebase Console audit**: Check auth settings, Firestore rules, Storage rules
3. **Secret rotation**: Rotate any compromised or >90-day-old secrets
4. **Access review**: Audit who has Firebase Console access
5. **Firestore rules review**: Verify rules match current schema
6. **CSP violation review**: Check /api/csp-report logs for new violations
7. **Penetration test**: Run OWASP ZAP full scan (docker)

---

## INCIDENT RESPONSE

1. **Detection** → Monitor Sentry alerts, rate-limit spikes, CSP violations
2. **Containment** → Disable affected feature flag or block IP range via middleware
3. **Investigation** → Check logs (PII-redacted), Firestore audit trail
4. **Resolution** → Deploy fix, rotate compromised secrets
5. **Communication** → Notify affected users within 72 hours (DPDP Act requirement)
6. **Post-mortem** → Document incident, update this checklist

**Emergency contacts:**
- Security Lead: security@bandhan.ai
- DPO: dpo@bandhan.ai
- Firebase Support: firebase-support@google.com
