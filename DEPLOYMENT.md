# Bandhan AI — Deployment Guide

> Complete guide for deploying Bandhan AI to Firebase Hosting with
> static export, CI/CD, monitoring, and rollback instructions.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Architecture Overview](#architecture-overview)
4. [Firebase Hosting (Primary)](#firebase-hosting-primary)
5. [Environment Variables](#environment-variables)
6. [Build Modes](#build-modes)
7. [Deploy Commands](#deploy-commands)
8. [GitHub Actions CI/CD](#github-actions-cicd)
9. [Custom Domain](#custom-domain)
10. [Rollback](#rollback)
11. [Monitoring & Error Tracking](#monitoring--error-tracking)
12. [Security Checklist](#security-checklist)
13. [Alternative Platforms](#alternative-platforms)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Firebase CLI globally
npm install -g firebase-tools

# 3. Authenticate
firebase login

# 4. Set your project
firebase use default        # production
firebase use staging        # staging
firebase use development    # dev

# 5. Build + deploy to Firebase Hosting
npm run deploy:firebase
```

---

## Prerequisites

| Tool         | Version | Install                         |
| ------------ | ------- | ------------------------------- |
| Node.js      | ≥ 18.17 | `nvm install 20`                |
| npm          | ≥ 9     | Bundled with Node               |
| Firebase CLI | ≥ 13    | `npm install -g firebase-tools` |
| Git          | ≥ 2     | Pre-installed on macOS          |

```bash
# Verify installations
node -v          # v20.x.x
firebase --version # 13.x.x
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                          │
│                    (CDN — global edge)                       │
│                                                             │
│   Static HTML/CSS/JS ← Next.js static export (`out/`)      │
│                                                             │
│   Rewrites:                                                 │
│     /api/**  → Cloud Functions (asia-south1)                │
│     /**      → index.html (SPA fallback)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Cloud Functions (asia-south1 / Mumbai)                    │
│     - /api/health        Health check endpoint              │
│     - /api/auth/*        Authentication                     │
│     - /api/matches/*     Matching engine                    │
│     - /api/chat/*        Chat operations                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Firestore   │  Storage   │  Auth   │  Cloud Messaging     │
│   (Mumbai)    │  (Mumbai)  │         │  (Push notifs)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Build mode:** `output: "export"` (fully static). No Node.js server
required at the edge. API routes are handled by Cloud Functions.

---

## Firebase Hosting (Primary)

### Project Structure

```
.firebaserc          → Project aliases (prod / staging / dev)
firebase.json        → Hosting, Firestore, Storage, Functions config
firestore.rules      → Firestore security rules
firestore.indexes.json → Firestore composite indexes
storage.rules        → Storage security rules
out/                 → Static export output (build artifact)
api/                 → Cloud Functions source
```

### Initial Setup

```bash
# 1. Create Firebase projects (one-time)
#    Go to https://console.firebase.google.com and create:
#    - bandhan-ai-prod      (production)
#    - bandhan-ai-staging   (staging)
#    - bandhan-ai-dev       (development)

# 2. Enable services in each project:
#    - Authentication → Phone + Google sign-in
#    - Cloud Firestore → asia-south1 (Mumbai)
#    - Storage → asia-south1
#    - Hosting → Enable
#    - Cloud Functions → Enable (Blaze plan required)
#    - Cloud Messaging → Enable

# 3. Authenticate CLI
firebase login

# 4. Verify project aliases
firebase projects:list
cat .firebaserc
```

---

## Environment Variables

### Local Development (`.env.local`)

```bash
cp .env.local.example .env.local
# Fill in your Firebase project credentials
```

### Production (GitHub Secrets)

Add these secrets to your GitHub repository
(`Settings → Secrets → Actions`):

| Secret                                     | Description                       |
| ------------------------------------------ | --------------------------------- |
| `FIREBASE_TOKEN`                           | CI token from `firebase login:ci` |
| `FIREBASE_SERVICE_ACCOUNT`                 | JSON key for GH Actions deploy    |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API key                  |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `project.firebaseapp.com`         |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID               |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `project.appspot.com`             |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID                     |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID                   |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | GA4 measurement ID                |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY`           | FCM VAPID key (push notifs)       |

### Firebase Console Environment Config

For Cloud Functions environment variables:

```bash
firebase functions:config:set \
  app.environment="production" \
  razorpay.key_id="rzp_live_xxxx" \
  razorpay.key_secret="xxxx" \
  sentry.dsn="https://xxxx@sentry.io/xxxx"
```

---

## Build Modes

| Command                       | Mode              | Output   | Use Case                |
| ----------------------------- | ----------------- | -------- | ----------------------- |
| `npm run dev`                 | Development (SSR) | —        | Local development       |
| `npm run build`               | Production (SSR)  | `.next/` | Vercel / Node hosting   |
| `npm run build:firebase`      | Static export     | `out/`   | Firebase Hosting (prod) |
| `npm run build:firebase:demo` | Static + demo     | `out/`   | Firebase Hosting (demo) |

The `FIREBASE_STATIC=true` env var triggers:

- `output: "export"` in next.config.js
- `trailingSlash: true` for clean URLs
- `images: { unoptimized: true }` (no server needed)

---

## Deploy Commands

```bash
# ── Firebase Hosting ──────────────────────────────────────────

# Production (build + deploy)
npm run deploy:firebase

# Demo mode (build + deploy)
npm run deploy:firebase:demo

# Staging project
npm run deploy:firebase:staging

# Preview channel (expires in 7 days, generates unique URL)
npm run deploy:firebase:preview

# Deploy everything (hosting + functions + rules + indexes)
npm run deploy:firebase:all

# ── Individual Services ───────────────────────────────────────

# Cloud Functions only
npm run deploy:functions

# Firestore rules + indexes
npm run firestore:deploy

# ── Local Testing ─────────────────────────────────────────────

# Run all emulators
npm run emulators

# Build + test hosting locally
npm run emulators:hosting

# ── Pre-deploy Checks ────────────────────────────────────────

# Lint + type-check + build (CI gate)
npm run predeploy:check
```

---

## GitHub Actions CI/CD

### Automatic Deployment Pipeline

| Trigger                | Action                             |
| ---------------------- | ---------------------------------- |
| Push to `main`         | Build → Deploy to **production**   |
| Push to `staging`      | Build → Deploy to **staging**      |
| Pull request to `main` | Build → Deploy **preview channel** |

### Setup

```bash
# 1. Generate a CI token
firebase login:ci
# Copy the token

# 2. Add it as a GitHub secret
# Go to: Repository → Settings → Secrets → Actions
# Name: FIREBASE_TOKEN
# Value: (paste the token)

# 3. For PR previews, create a Firebase service account:
# Firebase Console → Project Settings → Service Accounts
# Generate New Private Key → download JSON
# Add as GitHub secret: FIREBASE_SERVICE_ACCOUNT
# (paste the entire JSON content)
```

The workflow file is at `.github/workflows/firebase-deploy.yml`.

### Production Deployment Safety

The production deploy job includes:

1. **Lint + type-check** before build
2. **Health check** after deploy (`/api/health` → HTTP 200)
3. **Automatic rollback** if health check fails
4. **Concurrency guard** — cancels in-progress deploys for same branch

---

## Custom Domain

### Firebase Hosting

```bash
# 1. Go to Firebase Console → Hosting → Custom domains
# 2. Add your domain: bandhan.ai
# 3. Add DNS records as instructed:
#    Type: A     Name: @    Value: 151.101.1.195 (Firebase IP)
#    Type: A     Name: @    Value: 151.101.65.195
#    Type: CNAME Name: www  Value: bandhan-ai-prod.web.app
# 4. Wait for SSL provisioning (can take 24–48h)
```

### Update Environment

After custom domain is active:

```bash
# Update .env.local / GitHub Secrets
NEXT_PUBLIC_APP_URL=https://bandhan.ai
```

---

## Rollback

### Instant Rollback (Firebase Hosting)

Firebase keeps a history of all deployments. Rollback is instant:

```bash
# Roll back to the previous release
npm run deploy:firebase:rollback

# Or via Firebase CLI directly
firebase hosting:rollback

# Roll back a specific project
firebase hosting:rollback -P staging
```

### View Deployment History

```bash
# Via Firebase Console:
# Hosting → Release History → click "Rollback" on any release
```

### Automated Rollback

The GitHub Actions workflow automatically rolls back production
if the post-deploy health check fails. See the `deploy-production`
job in `.github/workflows/firebase-deploy.yml`.

---

## Monitoring & Error Tracking

### Health Check

```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://bandhan-ai-prod.web.app/api/health

# Expected response:
{
  "status": "healthy",
  "demoMode": false,
  "production": true,
  "timestamp": "2026-02-27T12:00:00.000Z",
  "version": "1.0.0",
  "services": { ... }
}
```

### Firebase Performance Monitoring

Already configured via `firebase/analytics` in `lib/firebase/config.ts`.
View metrics in Firebase Console → Performance.

### Error Tracking (Sentry — recommended)

```bash
# 1. Install Sentry
npm install @sentry/nextjs

# 2. Run setup wizard
npx @sentry/wizard@latest -i nextjs

# 3. Add DSN to environment
NEXT_PUBLIC_SENTRY_DSN=https://xxxx@sentry.io/xxxx
SENTRY_AUTH_TOKEN=sntrys_xxxx
```

The `app/error.tsx` global error boundary is pre-wired with a
Sentry comment — uncomment when ready.

### Uptime Monitoring

Set up a cron health check with any monitoring service:

| Service         | Free Tier | Check URL                                    |
| --------------- | --------- | -------------------------------------------- |
| UptimeRobot     | 50 checks | `https://bandhan-ai-prod.web.app/api/health` |
| Firebase Alerts | Built-in  | Console → Alerts                             |
| GitHub Actions  | Built-in  | `npm run health:check:firebase`              |

---

## Security Checklist

### Headers (configured in `firebase.json`)

- [x] `Strict-Transport-Security` (HSTS with preload)
- [x] `X-Frame-Options: SAMEORIGIN`
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-XSS-Protection: 1; mode=block`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` (camera, mic, geo restricted to self)
- [x] `Content-Security-Policy` (full CSP with Firebase domains)
- [x] `X-DNS-Prefetch-Control: on`

### Caching Strategy

| Resource         | Cache-Control                                     |
| ---------------- | ------------------------------------------------- |
| JS / CSS / Fonts | `public, max-age=31536000, immutable`             |
| Images           | `public, max-age=31536000, immutable`             |
| HTML pages       | `public, max-age=0, must-revalidate`              |
| Service Worker   | `no-cache, no-store, must-revalidate`             |
| JSON data        | `public, max-age=300, stale-while-revalidate=600` |
| API responses    | `no-store, no-cache, must-revalidate`             |

### CORS (configured for API routes)

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Pre-Deploy Security Checks

```bash
# Run before every production deploy
npm run lint          # Catches code issues
npm run type-check    # Catches type errors
npm run predeploy:check  # All of the above + build
```

---

## Alternative Platforms

### Vercel (SSR)

```bash
npm run deploy:vercel
```

Config: `vercel.json` (pre-configured, region: `sin1` Singapore).

### Netlify (SSR)

```bash
npm run deploy:netlify
```

Config: `netlify.toml` (pre-configured).

Both platforms support Next.js SSR natively and don't require
`output: "export"`.

---

## Troubleshooting

### Build Fails with "export" errors

Some Next.js features (dynamic routes, `getServerSideProps`) are
incompatible with static export. Ensure:

- No `getServerSideProps` in any page
- Dynamic routes have `generateStaticParams()`
- API routes are handled by Cloud Functions, not local `/app/api`

```bash
# Clear cache and retry
rm -rf .next out node_modules/.cache
npm run build:firebase
```

### Firebase Deploy Fails — "Not logged in"

```bash
firebase login
firebase use default
firebase deploy --only hosting
```

### 404 on Page Refresh

Firebase Hosting SPA rewrite sends all non-file routes to
`/index.html`. If you still see 404s:

1. Check `firebase.json` → `rewrites` includes `"source": "**"`
2. Ensure `out/index.html` exists after build
3. Run `firebase hosting:channel:deploy test` to test

### CORS Errors on API Calls

API CORS headers are set in `firebase.json` under the `/api/**`
header block. For Cloud Functions, also set CORS in the function code:

```ts
// api/src/index.ts
import cors from "cors";
const corsHandler = cors({ origin: true });
```

### Environment Variables Not Working

```bash
# Verify build-time vars are baked in
grep "NEXT_PUBLIC" out/_next/static/chunks/*.js | head -5

# Ensure vars are prefixed with NEXT_PUBLIC_
# Server-only vars won't be in the static bundle
```

### Rollback After Bad Deploy

```bash
# Immediate rollback
firebase hosting:rollback

# Or via Console:
# Firebase Console → Hosting → Release History → Rollback
```

---

## Post-Deployment Checklist

- [ ] Health check returns HTTP 200: `curl https://your-domain/api/health`
- [ ] Home page loads without console errors
- [ ] Authentication works (OTP + Google sign-in)
- [ ] Profile photos load from Firebase Storage
- [ ] Chat messages send and receive in real-time
- [ ] Push notifications prompt appears
- [ ] Security headers present: `curl -I https://your-domain`
- [ ] HSTS header present: `Strict-Transport-Security: max-age=63072000`
- [ ] CSP header present: `Content-Security-Policy: ...`
- [ ] No mixed-content warnings in browser console
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility)
- [ ] Mobile responsive — test on 360px width
