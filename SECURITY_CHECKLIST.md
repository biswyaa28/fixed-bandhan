# ═══════════════════════════════════════════════════════════════════════════════
# Bandhan AI — Security Checklist
# ═══════════════════════════════════════════════════════════════════════════════
#
# Complete this checklist before every production deployment.
# Review monthly for ongoing compliance.
#
# Last reviewed: 2026-02-28
# Reviewer: [Your Name]
# ═══════════════════════════════════════════════════════════════════════════════


## 1. Firebase Console — Authentication

- [ ] **Phone Auth enabled** — Only +91 (India) region
- [ ] **Abuse prevention** — Enable reCAPTCHA Enterprise in Firebase Console
      → Authentication → Settings → Abuse prevention → reCAPTCHA Enterprise (free)
- [ ] **Authorized domains** — Whitelist ONLY:
      - `bandhan.ai`
      - `www.bandhan.ai`
      - `app.bandhan.ai`
      - `bandhan-ai-prod.web.app`
      - `bandhan-ai-prod.firebaseapp.com`
      - `localhost` (remove in production if not needed)
- [ ] **SMS sending limits** — Set reasonable daily limits per IP:
      → Authentication → Settings → User actions → Throttle SMS
      - Max 5 SMS per phone per hour
      - Max 10 SMS per IP per hour
- [ ] **Session duration** — Set token lifetime to 1 hour:
      → Firebase Admin → `auth.createSessionCookie(idToken, { expiresIn: 3600000 })`
- [ ] **Multi-factor auth** — Enable as option for premium users
- [ ] **Disable unused providers** — Only enable:
      - Phone (primary)
      - Google (secondary)
      - Disable: Email/Password, Anonymous, Facebook, Apple, etc.
- [ ] **Block disposable phone numbers** — Use Firebase Functions
      to reject known VoIP / disposable number ranges


## 2. Firebase Console — Firestore Security Rules

- [ ] **No open reads** — Every collection requires `request.auth != null`
- [ ] **User isolation** — Users can only read/write their own documents:
      ```
      match /users/{userId} {
        allow read, write: if request.auth.uid == userId;
      }
      ```
- [ ] **Validation rules** — All writes validate required fields:
      ```
      allow create: if request.resource.data.keys().hasAll(['name', 'age', 'phone'])
                     && request.resource.data.age is int
                     && request.resource.data.age >= 18;
      ```
- [ ] **Size limits** — Enforce document size limits:
      ```
      allow write: if request.resource.size() < 50000; // 50KB max
      ```
- [ ] **Rate limiting in rules** — Prevent batch writes:
      ```
      allow create: if request.time > resource.data.lastWrite + duration.value(1, 's');
      ```
- [ ] **No admin wildcards** — Never use `allow read, write: if true;`
- [ ] **Test with emulator** — Run `firebase emulators:start` and test all rules
- [ ] **Deploy rules** — `firebase deploy --only firestore:rules`


## 3. Firebase Console — Storage Security Rules

- [ ] **Auth required for all uploads**:
      ```
      match /users/{userId}/{allPaths=**} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == userId
                     && request.resource.size < 5 * 1024 * 1024  // 5MB
                     && request.resource.contentType.matches('image/.*');
      }
      ```
- [ ] **File type validation** — Only allow images and audio:
      - Images: `image/jpeg`, `image/png`, `image/webp`
      - Audio: `audio/webm`, `audio/ogg` (voice notes)
      - BLOCK: `application/*`, `text/*`, `video/*`
- [ ] **File size limits**:
      - Profile photos: 5MB max
      - Voice notes: 2MB max
      - Chat photos: 5MB max
- [ ] **No public read on sensitive paths**:
      - `/users/{uid}/verification/` — private
      - `/reports/` — admin only
- [ ] **CORS configuration** — Restrict to your domains only


## 4. Firebase Console — App Check (Free Abuse Prevention)

- [ ] **Enable App Check** — Firebase Console → App Check → Register
      - For web: Use reCAPTCHA v3 (free, invisible to users)
      - Provider: reCAPTCHA Enterprise
- [ ] **Enforce App Check** on:
      - [ ] Cloud Firestore — Console → App Check → Firestore → Enforce
      - [ ] Cloud Storage — Console → App Check → Storage → Enforce
      - [ ] Cloud Functions — Console → App Check → Functions → Enforce
      - [ ] Authentication — Console → App Check → Auth → Enforce
- [ ] **Debug token for development** — Add localhost debug token
- [ ] **Monitor** — Check App Check metrics weekly for abuse attempts


## 5. Firebase Console — Functions Security

- [ ] **CORS restricted** — Only allow requests from your domains
- [ ] **Input validation** — Validate all function parameters with Zod
- [ ] **Rate limiting** — Use App Check + custom rate limiting per user
- [ ] **Environment variables** — All secrets in Firebase Functions config:
      ```
      firebase functions:config:set razorpay.secret="xxx"
      ```
- [ ] **No admin SDK on client** — `firebase-admin` ONLY in functions/server
- [ ] **Min instances: 0** — Don't pay for idle functions
- [ ] **Max instances: 10** — Prevent runaway costs from abuse
- [ ] **Timeout: 60s** — Prevent long-running exploits


## 6. Application-Level Security

### Middleware (middleware.ts)
- [ ] **CSP headers** — Content-Security-Policy set on all responses
- [ ] **X-Frame-Options: DENY** — Prevent clickjacking
- [ ] **X-Content-Type-Options: nosniff** — Prevent MIME sniffing
- [ ] **Strict-Transport-Security** — HSTS with preload
- [ ] **Referrer-Policy: strict-origin-when-cross-origin**
- [ ] **Permissions-Policy** — Disable unused APIs
- [ ] **Rate limiting** — IP-based, per-route limits
- [ ] **Bot blocking** — Block known scraper user agents
- [ ] **CSRF protection** — Origin header validation on POST/PUT/DELETE

### Input Sanitization (lib/security.ts)
- [ ] **All text fields sanitized** — `sanitizeText()` strips HTML
- [ ] **Names validated** — `sanitizeName()` allows only letters
- [ ] **URLs validated** — `sanitizeUrl()` blocks javascript: schemes
- [ ] **Files validated** — `isAllowedImageType()` checks MIME + extension
- [ ] **Zod schemas** — Every form uses a Zod schema for validation
- [ ] **PII redaction** — `redactPII()` scrubs phone/email from logs

### Authentication
- [ ] **Firebase Auth tokens** — Used as CSRF tokens for API calls
- [ ] **Token refresh** — Auto-refresh before expiry (Firebase SDK handles this)
- [ ] **Logout cleanup** — Clear all local state on sign out
- [ ] **Session timeout** — 1 hour idle timeout
- [ ] **No token in URL** — Tokens only in Authorization header


## 7. Dependency Security

- [ ] **Run weekly**: `npm audit`
- [ ] **Fix critical**: `npm audit fix`
- [ ] **Monthly update**: `npx npm-check-updates -u && npm install`
- [ ] **Lock file committed**: `package-lock.json` in Git
- [ ] **No `eval()`**: ESLint rule `no-eval` enabled
- [ ] **No `innerHTML`**: Use React's JSX (auto-escapes)
- [ ] **Subresource Integrity**: For any external scripts (rare — we avoid them)

### Automated Security Script (add to package.json):
```json
{
  "scripts": {
    "security:audit": "npm audit --production",
    "security:check": "npm audit --production && npm run lint && npm run type-check"
  }
}
```


## 8. Infrastructure Security

### Vercel / Firebase Hosting
- [ ] **HTTPS only** — Enforced by platform (automatic)
- [ ] **Custom domain SSL** — Verify certificate is valid
- [ ] **Environment variables** — All secrets in platform dashboard
- [ ] **No `.env` in Git** — Verify `.gitignore` includes `.env*`
- [ ] **Preview deployments** — Password-protect or disable

### DNS
- [ ] **DNSSEC enabled** — Prevent DNS spoofing
- [ ] **CAA records** — Restrict which CAs can issue certificates
- [ ] **SPF + DKIM + DMARC** — For @bandhan.ai email (prevent phishing)


## 9. OWASP ZAP Testing (Free)

Run quarterly with OWASP ZAP (https://www.zaproxy.org/):

```bash
# Install ZAP (free, open source)
# macOS:
brew install --cask owasp-zap

# Run automated scan against staging:
zap-cli quick-scan --self-contained -t https://staging.bandhan.ai

# Or use the Docker image:
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://staging.bandhan.ai
```

Expected results:
- [ ] 0 High-risk findings
- [ ] 0 Medium-risk findings
- [ ] Low-risk findings reviewed and accepted/mitigated


## 10. Mozilla Observatory Check (Free)

Test at: https://observatory.mozilla.org/

Target score: **A+**

Required headers:
- [ ] Content-Security-Policy: A+
- [ ] Strict-Transport-Security: ✓
- [ ] X-Content-Type-Options: ✓
- [ ] X-Frame-Options: ✓
- [ ] Referrer-Policy: ✓


## 11. securityheaders.com Check (Free)

Test at: https://securityheaders.com/

Target grade: **A**


## 12. Monthly Security Review

### Every Month:
- [ ] Run `npm audit` and fix critical/high vulnerabilities
- [ ] Review Firebase Console → Authentication → Users for suspicious accounts
- [ ] Review Firebase Console → Firestore → Usage for abnormal patterns
- [ ] Review error reports for security-related failures
- [ ] Rotate any compromised secrets
- [ ] Check that `security.txt` expiry date is still in the future

### Every Quarter:
- [ ] Run OWASP ZAP scan
- [ ] Run Mozilla Observatory check
- [ ] Review and update security rules
- [ ] Update this checklist
- [ ] Conduct threat model review

### On Incident:
- [ ] Rotate all affected secrets immediately
- [ ] Notify affected users within 72 hours (DPDP Act requirement)
- [ ] File incident report
- [ ] Conduct post-mortem
- [ ] Update security measures based on findings


## 13. Security Contacts

| Role                  | Email                     | Response SLA |
|-----------------------|---------------------------|--------------|
| Security Lead         | security@bandhan.ai       | 24 hours     |
| Data Protection Officer| dpo@bandhan.ai           | 48 hours     |
| Grievance Officer     | grievance@bandhan.ai      | 30 days      |
| Emergency (breach)    | security@bandhan.ai       | 4 hours      |
