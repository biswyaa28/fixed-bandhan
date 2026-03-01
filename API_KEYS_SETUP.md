# Bandhan AI — API Keys Setup Guide (Step-by-Step)

> **File to edit:** `.env.local` (in your project root)
> **Current status:** Your `.env.local` has `NEXT_PUBLIC_DEMO_MODE=true` with dummy keys.
> **Goal:** Replace dummy keys with real ones to go live.

---

## 🟢 PRIORITY 1: Required to Run (Without Demo Mode)

These are the ONLY keys you need to switch from demo mode to a working app.

---

### 1. Firebase (FREE — Spark Plan)

**What it does:** Authentication (phone OTP + Google login), database (Firestore), file storage, hosting.

**Cost:** ₹0 — Free tier covers 50K auth/month, 1GB Firestore, 5GB storage.

**Step-by-step:**

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it `bandhan-ai` → Continue
4. Disable Google Analytics (you'll use Umami instead) → **Create Project**
5. Wait for creation → Click **Continue**

**Get your Web App keys:**

6. In the Firebase dashboard, click the **gear icon** (⚙️) → **Project Settings**
7. Scroll down to **"Your apps"** → Click the **web icon** (`</>`)
8. Register app name: `Bandhan AI Web` → Click **Register app**
9. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",              // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "bandhan-ai.firebaseapp.com",  // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "bandhan-ai",          // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "bandhan-ai.appspot.com",   // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",    // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123",         // → NEXT_PUBLIC_FIREBASE_APP_ID
  measurementId: "G-XXXXXXXXXX"      // → NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

10. Copy each value into your `.env.local`

**Enable Authentication:**

11. In Firebase Console → **Build** → **Authentication** → **Get Started**
12. Click **Sign-in method** tab
13. Enable **Phone** → Save
14. Enable **Google** → Enter your support email → Save

**Create Firestore Database:**

15. **Build** → **Firestore Database** → **Create database**
16. Select **asia-south1 (Mumbai)** as location → Next
17. Start in **test mode** (you'll deploy security rules later) → Create

**Enable Storage:**

18. **Build** → **Storage** → **Get Started**
19. Start in **test mode** → select **asia-south1 (Mumbai)** → Done

**Get Firebase Admin keys (for backend/server):**

20. **Project Settings** (⚙️) → **Service Accounts** tab
21. Click **"Generate new private key"** → **Generate key**
22. A JSON file downloads. Open it and copy these values:

```
"project_id"    → FIREBASE_ADMIN_PROJECT_ID
"client_email"  → FIREBASE_ADMIN_CLIENT_EMAIL
"private_key"   → FIREBASE_ADMIN_PRIVATE_KEY  (keep the \n characters!)
```

**Get VAPID key (for push notifications):**

23. **Project Settings** → **Cloud Messaging** tab
24. Under **Web Push certificates**, click **Generate key pair**
25. Copy the key → `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

**Your `.env.local` entries:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bandhan-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bandhan-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bandhan-ai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BLz...your-vapid-key

FIREBASE_ADMIN_PROJECT_ID=bandhan-ai
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bandhan-ai.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your-key...\n-----END PRIVATE KEY-----\n"
```

---

### 2. NextAuth Secret (FREE — Generate Locally)

**What it does:** Encrypts session cookies.

**Step-by-step:**

1. Open your terminal
2. Run:
   ```bash
   openssl rand -base64 32
   ```
3. Copy the output (e.g., `aB3kd8f...long-random-string`)
4. Paste into `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=aB3kd8f...your-generated-string
```

---

### 3. Switch Off Demo Mode

After adding Firebase keys + NextAuth secret, change this in `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_FIREBASE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**That's it! The app is now functional with real auth, database, and storage.**

---

## 🟡 PRIORITY 2: Needed Before Public Launch

These are needed when you deploy to production for real users.

---

### 4. Razorpay (FREE Test Mode → Pay Per Transaction in Production)

**What it does:** Accepts UPI, card, and net banking payments for Premium subscriptions.

**Cost:** 2% per transaction (no monthly fee). Free in test mode.

**Step-by-step:**

1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with email + PAN card (required for Indian business)
3. After login, click **Settings** (left sidebar) → **API Keys**
4. Click **Generate Test Key** (or **Generate Live Key** for production)
5. You'll see:
   - **Key ID:** `rzp_test_xxxxxxxxxxxxxxx`
   - **Key Secret:** `xxxxxxxxxxxxxxxxxxxxxxxx` (shown only once! Save it!)

6. For webhook:
   - Go to **Settings** → **Webhooks**
   - Click **Add New Webhook**
   - URL: `https://your-domain.com/api/payments/webhook`
   - Secret: create a random string
   - Events: Select `payment.captured`, `subscription.activated`, `subscription.cancelled`

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_string
```

> **Note:** Use `rzp_test_` keys for development. Switch to `rzp_live_` for production.

---

### 5. PostgreSQL Database (FREE — Supabase or Neon)

**What it does:** Stores structured data via Prisma ORM (user metadata, transactions).

**Option A: Supabase (FREE — 500MB)**

1. Go to [https://supabase.com](https://supabase.com) → Sign up (GitHub login)
2. Click **New project**
3. Name: `bandhan-ai`, Password: (generate a strong one, save it!), Region: **South Asia (Mumbai)**
4. Wait for creation (~2 min)
5. Go to **Settings** → **Database** → scroll to **Connection string**
6. Copy the **URI** format:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
```

**Option B: Neon (FREE — 512MB)**

1. Go to [https://neon.tech](https://neon.tech) → Sign up
2. Create project → Region: **Asia Pacific (Singapore)** (closest to India)
3. Copy the connection string from the dashboard

Then run migrations:
```bash
npx prisma migrate deploy
```

---

### 6. Sentry Error Tracking (FREE — 5,000 events/month)

**What it does:** Catches and reports frontend/backend errors automatically.

**Step-by-step:**

1. Go to [https://sentry.io/signup](https://sentry.io/signup) → Sign up (GitHub login)
2. Create organization: `bandhan-ai`
3. Create project → Platform: **Next.js** → Name: `bandhan-ai-web`
4. You'll see a DSN like: `https://abc123@o456.ingest.sentry.io/789`
5. Copy it:

```env
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
```

6. For the auth token (needed for source maps):
   - Go to **Settings** → **Auth Tokens**
   - Create new token with `project:releases` scope
   - Copy:

```env
SENTRY_AUTH_TOKEN=sntrys_eyJ...your-token
```

---

## 🔵 PRIORITY 3: Needed for Specific Features

Only set these up when you're ready to use the specific feature.

---

### 7. DigiLocker (FREE — Government API)

**What it does:** Aadhaar-based identity verification for Silver/Gold badges.

**Step-by-step:**

1. Go to [https://partners.digilocker.gov.in](https://partners.digilocker.gov.in)
2. Click **Register as Partner**
3. Fill in: Organization name, type (Startup), PAN, etc.
4. Submit application (review takes **2-4 weeks**)
5. Once approved, you'll get:
   - Client ID
   - Client Secret
6. Set redirect URI in their portal to: `https://your-domain.com/api/auth/digilocker`

```env
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret
DIGILOCKER_REDIRECT_URI=http://localhost:3000/api/auth/digilocker
```

> **Note:** DigiLocker approval takes weeks. Use mock verification during development (`NEXT_PUBLIC_DEMO_MODE=true`).

---

### 8. MSG91 SMS (Paid — ₹0.15/SMS)

**What it does:** Backup SMS OTP provider when Firebase Phone Auth quota is exceeded.

**Step-by-step:**

1. Go to [https://msg91.com](https://msg91.com) → Sign up
2. Complete KYC (PAN + Aadhaar required for Indian SMS regulations)
3. Once approved:
   - Dashboard → **SMS** → **API Keys** → Copy auth key
   - **Sender ID:** Register `BNDHAN` (6 chars, DLT registration required)
   - **Templates:** Create OTP template → Copy template ID

```env
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=BNDHAN
MSG91_TEMPLATE_ID=your_template_id
```

> **Note:** You MUST register your sender ID and templates on the DLT portal (TRAI regulation). This takes 1-2 weeks. Firebase Phone Auth works without this for most cases.

---

### 9. AWS S3 (FREE Tier — 5GB for 12 months)

**What it does:** Stores profile photos, voice notes, chat attachments at scale.

**Step-by-step:**

1. Go to [https://aws.amazon.com](https://aws.amazon.com) → Create account
2. Sign in to AWS Console
3. Search for **S3** → **Create bucket**
   - Name: `bandhan-media`
   - Region: **Asia Pacific (Mumbai) ap-south-1**
   - Uncheck "Block all public access" (you'll need read access for photos)
   - Create bucket
4. Go to **IAM** → **Users** → **Create user**
   - Name: `bandhan-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or create a more restrictive one)
   - Create user → **Security credentials** → **Create access key**
   - Copy both keys:

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET=bandhan-media
```

> **Note:** Firebase Storage (already set up in step 1) handles file storage for free up to 5GB. AWS S3 is only needed at scale (100K+ users). Skip this initially.

---

### 10. Umami Analytics (FREE — Self-Hosted)

**What it does:** Privacy-first analytics (no Google tracking). Tracks pageviews, events, retention.

**Option A: Local (Docker)**
```bash
cd /Users/biswyaa/Downloads/bandhan-ai
docker compose up -d
```
Then open `http://localhost:3000` (Umami dashboard).

**Option B: Railway (FREE tier, hosted)**

1. Go to [https://railway.app](https://railway.app) → Sign up (GitHub login)
2. Click **Deploy a Template** → Search "Umami"
3. Deploy → Wait for build
4. Open the deployed URL → Login with `admin` / `umami`
5. **Change password immediately**
6. Click **Settings** → **Websites** → **Add website**
   - Name: `Bandhan AI`
   - Domain: `bandhan.ai` (or `localhost` for dev)
7. Copy the **Website ID** (UUID)

```env
NEXT_PUBLIC_UMAMI_HOST=https://your-umami.up.railway.app
NEXT_PUBLIC_UMAMI_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

### 11. reCAPTCHA (FREE)

**What it does:** Protects phone OTP from bots (invisible reCAPTCHA v3).

**Step-by-step:**

1. Go to [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Click **+ (Create)**
3. Label: `Bandhan AI`
4. Type: **reCAPTCHA v3**
5. Domains: `localhost`, `bandhan.ai`, `your-domain.web.app`
6. Accept terms → **Submit**
7. Copy the **Site Key**:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...your-site-key
```

> **Note:** Firebase Phone Auth has its own built-in reCAPTCHA. This is an optional extra layer.

---

## ⚫ PRIORITY 4: Optional / Future

Skip these until you need them.

---

### 12. AWS KMS (Paid — ~$1/month per key)

**What it does:** Encrypts sensitive user data (Aadhaar numbers, etc.) at rest.

- Only needed when storing real Aadhaar/PAN data
- Set up when DigiLocker integration is live
- For now, use the placeholder:

```env
KMS_KEY_ARN=
ENCRYPTION_SECRET=generate-a-random-64-char-string
```

### 13. Socket.io Server (FREE — run locally)

**What it does:** Real-time chat (typing indicators, instant messages).

- Firebase Firestore `onSnapshot` handles real-time for now
- Socket.io is only needed for ultra-low-latency features
- Skip until 10K+ concurrent chat users

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
```

### 14. CDN (FREE with Firebase Hosting)

**What it does:** Serves images/assets globally with caching.

- Firebase Hosting includes a CDN automatically
- No separate CDN needed initially

```env
NEXT_PUBLIC_CDN_URL=https://bandhan-ai-prod.web.app
NEXT_PUBLIC_MEDIA_URL=https://bandhan-ai-prod.web.app/images
```

---

## 📋 Quick Reference: Where Each Key Goes

| Key | Where to Get | Cost | Priority |
|-----|-------------|------|----------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings | FREE | 🟢 Required |
| `FIREBASE_ADMIN_*` | Firebase Console → Service Accounts | FREE | 🟢 Required |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | FREE | 🟢 Required |
| `NEXT_PUBLIC_RAZORPAY_*` | Razorpay Dashboard → API Keys | FREE test / 2% live | 🟡 Pre-launch |
| `DATABASE_URL` | Supabase or Neon dashboard | FREE | 🟡 Pre-launch |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry → Project Settings | FREE (5K events) | 🟡 Pre-launch |
| `DIGILOCKER_*` | DigiLocker Partner Portal | FREE (2-4 week approval) | 🔵 Feature |
| `MSG91_*` | MSG91 Dashboard | ₹0.15/SMS | 🔵 Feature |
| `AWS_*` | AWS Console → IAM | FREE tier 12mo | 🔵 Feature |
| `NEXT_PUBLIC_UMAMI_*` | Self-hosted Umami | FREE | 🔵 Feature |
| `NEXT_PUBLIC_RECAPTCHA_*` | Google reCAPTCHA Admin | FREE | 🔵 Feature |
| `KMS_KEY_ARN` | AWS KMS Console | ~$1/mo | ⚫ Future |
| `NEXT_PUBLIC_SOCKET_URL` | Self-hosted Node.js server | FREE | ⚫ Future |

---

## 🚀 Minimum Viable Setup (5 Minutes)

To get the app running with REAL Firebase (not demo mode), you only need:

```bash
# 1. Create Firebase project (steps 1-18 above)
# 2. Generate NextAuth secret
openssl rand -base64 32

# 3. Edit .env.local with real Firebase keys + NextAuth secret
# 4. Turn off demo mode:
#    NEXT_PUBLIC_DEMO_MODE=false

# 5. Deploy Firestore rules
npx firebase deploy --only firestore:rules

# 6. Run the app
npm run dev
```

Everything else can be added incrementally as you need each feature.
