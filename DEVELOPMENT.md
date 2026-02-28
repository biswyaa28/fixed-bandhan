# Bandhan AI — Local Development Guide

> Complete setup guide for developing Bandhan AI on macOS, Linux, and Windows.
> Written for Indian developers — includes fixes for Jio/Airtel network issues,
> port conflicts, and low-RAM machines.

---

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Running the App](#running-the-app)
5. [Demo Mode vs Firebase Mode](#demo-mode-vs-firebase-mode)
6. [Firebase Emulators](#firebase-emulators)
7. [Developer Scripts Reference](#developer-scripts-reference)
8. [Debugging](#debugging)
9. [Performance Profiling](#performance-profiling)
10. [Network Issues (India-Specific)](#network-issues-india-specific)
11. [Windows-Specific Setup](#windows-specific-setup)
12. [Linux / Ubuntu Setup](#linux--ubuntu-setup)
13. [Low-RAM Machine Tips](#low-ram-machine-tips)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/bandhan-ai/bandhan-ai.git
cd bandhan-ai
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start in demo mode (no Firebase needed)
npm run demo

# Open in browser
# → http://localhost:3000
```

That's it. Demo mode uses mock data — no Firebase, no backend, no API keys.

---

## Prerequisites

### Required

| Tool | Version | Check Command | Install |
|------|---------|---------------|---------|
| Node.js | ≥ 18.17 | `node -v` | [nodejs.org/en/download](https://nodejs.org/en/download/) |
| npm | ≥ 9.0 | `npm -v` | Comes with Node.js |
| Git | ≥ 2.30 | `git --version` | [git-scm.com](https://git-scm.com/) |

### Recommended

| Tool | Purpose | Install |
|------|---------|---------|
| VS Code | Editor with shared settings | [code.visualstudio.com](https://code.visualstudio.com/) |
| Git Bash | Required on Windows for Husky hooks | [gitforwindows.org](https://gitforwindows.org/) |
| Java 11+ | Firebase emulators (Firestore) | `sudo apt install default-jre` (Ubuntu) |
| Firebase CLI | Deploy, emulators | `npm install -g firebase-tools` |

### Version Check Script

```bash
echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
echo "Git:  $(git --version)"
echo "Java: $(java -version 2>&1 | head -1)"
```

---

## Environment Setup

### 1. Copy the Template

```bash
cp .env.local.example .env.local
```

### 2. Configure for Demo Mode (Fastest Start)

Edit `.env.local` — set only these two lines:

```dotenv
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Everything else can stay empty. Demo mode uses mock auth, mock data, and mock APIs.

### 3. Configure for Firebase (Full Backend)

If you're working on auth, chat, or real-time features, you need a Firebase project:

```dotenv
NEXT_PUBLIC_DEMO_MODE=false

# Get from: Firebase Console → Project Settings → General → Your Apps
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bandhan-ai-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bandhan-ai-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bandhan-ai-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# Use emulators instead of production
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

Then start the emulators:

```bash
npm run emulators   # Terminal 1
npm run dev         # Terminal 2
```

---

## Running the App

### Demo Mode (Recommended for Most Work)

```bash
npm run demo
```

- Uses mock authentication (auto-login)
- Uses mock match data (sample Indian profiles)
- Uses mock chat messages
- No Firebase needed
- Works completely offline after first load
- Hot reload on all file changes

### Development Mode (Real Firebase)

```bash
npm run dev
```

- Connects to Firebase (needs `.env.local` configured)
- Real phone auth OTP
- Real Firestore data
- Real Storage uploads

### Build and Test Locally

```bash
npm run build       # Production build
npm run start       # Serve production build
```

---

## Demo Mode vs Firebase Mode

| Feature | Demo Mode | Firebase Mode |
|---------|-----------|---------------|
| Auth | Auto-login, mock user | Real Phone OTP / Google |
| Data | Hardcoded sample profiles | Firestore database |
| Chat | Mock messages | Real-time Firestore |
| Storage | Placeholder images | Firebase Storage |
| Offline | Works fully | Needs internet |
| Speed | Instant | Depends on network |
| Use case | UI work, styling, layout | Auth, chat, backend features |

### Toggle at Runtime

The demo/real mode is controlled by `NEXT_PUBLIC_DEMO_MODE` in `.env.local`.
Change it and restart the dev server:

```bash
# Switch to demo mode
# In .env.local: NEXT_PUBLIC_DEMO_MODE=true
npm run demo

# Switch to real mode
# In .env.local: NEXT_PUBLIC_DEMO_MODE=false
npm run dev
```

---

## Firebase Emulators

Firebase emulators let you develop against local Firebase services — free, fast, and offline.

### Start Emulators

```bash
# Prerequisites: Java 11+ installed
npm run emulators
```

This starts:
- **Auth Emulator** on `localhost:9099`
- **Firestore Emulator** on `localhost:8080`
- **Storage Emulator** on `localhost:9199`
- **Functions Emulator** on `localhost:5001`
- **Emulator UI** on `localhost:4000`

### Seed Test Data

```bash
# Seed demo profiles into the local Firestore emulator
npm run seed
```

This creates sample profiles: Priya, Rohan, Anjali, Vikram — with realistic Indian data.

### Emulator UI

Open `http://localhost:4000` to see the Emulator Suite UI:
- View/edit Firestore documents
- See auth users
- View Storage files
- Check function logs

---

## Developer Scripts Reference

### Core

| Script | What It Does |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run demo` | Start in demo mode |
| `npm run build` | Production build |
| `npm run start` | Serve production build |

### Quality

| Script | What It Does |
|--------|-------------|
| `npm run lint` | Run ESLint on all files |
| `npm run type-check` | TypeScript compiler check (no emit) |
| `npm run format` | Prettier format all files |
| `npm run dx:check` | Lint + type-check + format check |
| `npm run dx:fix` | Auto-fix lint errors + reformat |

### Firebase

| Script | What It Does |
|--------|-------------|
| `npm run emulators` | Start Firebase emulators |
| `npm run seed` | Seed test data into local Firestore |
| `npm run firestore:deploy` | Deploy Firestore rules + indexes |

### Analysis

| Script | What It Does |
|--------|-------------|
| `npm run analyze` | Bundle size analysis (opens in browser) |
| `npm run security:audit` | Check dependencies for vulnerabilities |
| `npm run dx:ports` | List processes on dev ports |

### Maintenance

| Script | What It Does |
|--------|-------------|
| `npm run dx:clean` | Delete .next, out, and npm caches |
| `npm run dx:fresh` | Delete node_modules + reinstall |

---

## Debugging

### Browser DevTools

1. Open `http://localhost:3000`
2. Press `F12` (or `Cmd+Option+I` on Mac)
3. Go to **Console** tab
4. Debug logs are categorised:
   - `[Analytics:matching]` — analytics events
   - `[Bandhan Error]` — error boundary catches
   - `[ErrorBoundary:chat]` — section-specific errors

### Next.js Debug Mode

```bash
# Verbose Next.js logging
NODE_OPTIONS='--inspect' npm run dev
```

Then open `chrome://inspect` in Chrome to attach the Node.js debugger.

### React DevTools

Install the [React DevTools browser extension](https://react.dev/learn/react-developer-tools) (free).

- **Components tab** — inspect component props and state
- **Profiler tab** — record renders and find slow components

### Console Log Filtering

The ESLint rule `no-console` warns on `console.log` but allows:
- `console.warn` — for warnings
- `console.error` — for errors
- `console.info` — for informational messages

Use these instead of `console.log` so messages survive the linter and are easy to filter in DevTools.

### VS Code Debugging

Press `F5` in VS Code → select "Next.js: debug full stack". This attaches debuggers to both the server and client.

---

## Performance Profiling

### Bundle Analysis

```bash
npm run analyze
```

Opens an interactive treemap of the bundle. Look for:
- Large dependencies that should be lazy-loaded
- Duplicate libraries
- Unused code

**Target:** < 150KB initial JS bundle (critical for 2G users in Tier 2/3 cities).

### Lighthouse

1. Build: `npm run build`
2. Start: `npm run start`
3. Open Chrome → `http://localhost:3000`
4. Open DevTools → **Lighthouse** tab
5. Run audit with "Mobile" preset

**Targets:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90

### React Profiler

1. Install React DevTools extension
2. Open app → DevTools → **Profiler** tab
3. Click "Record" → interact with the app → click "Stop"
4. Look for components that re-render unnecessarily

---

## Network Issues (India-Specific)

### npm Install Times Out on Jio/Airtel

```bash
# Option 1: Use npm mirror (faster in India)
npm config set registry https://registry.npmmirror.com
npm install
npm config set registry https://registry.npmjs.org  # Reset after

# Option 2: Increase timeout
npm install --fetch-timeout=120000 --fetch-retries=5

# Option 3: Use a mobile hotspot from a different carrier
# (sometimes one carrier has better peering than another)
```

### Firebase Emulators Download Fails

The emulators download ~100MB on first run. On slow connections:

```bash
# Download with retries
firebase setup:emulators:firestore
firebase setup:emulators:storage
firebase setup:emulators:auth

# If it still fails, download manually:
# https://firebase.google.com/docs/emulator-suite/install_and_configure
```

### Dev Server Slow to Start

On machines with < 4GB RAM or slow HDDs:

```bash
# Use turbopack (experimental but much faster)
npm run dev -- --turbo

# Or reduce watched files
echo "WATCHPACK_POLLING=true" >> .env.local
```

### Hot Reload Not Working

```bash
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Windows: already handled by polling
# macOS: already handled by FSEvents
```

---

## Windows-Specific Setup

### Prerequisites

1. **Install Git Bash** — [gitforwindows.org](https://gitforwindows.org/)
   - During installation, select "Use Git from Git Bash only"
   - This is required for Husky pre-commit hooks

2. **Install Node.js** — [nodejs.org](https://nodejs.org/)
   - Download the **LTS** version
   - During installation, check "Automatically install the necessary tools"

3. **Set Git Bash as VS Code terminal:**
   - VS Code → Settings → search "terminal default profile windows"
   - Set to "Git Bash"

### Windows-Specific Issues

**Line endings (CRLF vs LF):**
```bash
# Configure Git to use LF (Linux line endings)
git config --global core.autocrlf input
```

**PowerShell execution policy (if using PowerShell instead of Git Bash):**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**Port conflicts (IIS, Skype, etc.):**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

**npm global packages not found:**
```bash
# Add npm global bin to PATH
# In Git Bash:
export PATH="$PATH:$(npm config get prefix)/bin"
# Add this line to ~/.bashrc to make it permanent
```

---

## Linux / Ubuntu Setup

### Quick Setup Script

```bash
#!/bin/bash
# Run: curl -fsSL https://raw.githubusercontent.com/bandhan-ai/bandhan-ai/main/scripts/setup-ubuntu.sh | bash

# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install Java (for Firebase emulators)
sudo apt update
sudo apt install -y default-jre

# Clone and setup
git clone https://github.com/bandhan-ai/bandhan-ai.git
cd bandhan-ai
npm install
cp .env.local.example .env.local
echo "NEXT_PUBLIC_DEMO_MODE=true" >> .env.local

# Increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

echo ""
echo "✅ Setup complete! Run: cd bandhan-ai && npm run demo"
```

### Common Ubuntu Issues

**`sharp` fails to install (common on ARM / Raspberry Pi):**
```bash
# Install build tools
sudo apt install -y build-essential libvips-dev
npm rebuild sharp
```

**Permission denied on `.husky/`:**
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

---

## Low-RAM Machine Tips

For machines with 2–4 GB RAM (common in Indian colleges):

### 1. Close Other Apps

Close Chrome tabs, Slack, and any Electron apps before running the dev server. Each Chrome tab uses ~100MB.

### 2. Use Demo Mode

```bash
npm run demo
```

Demo mode doesn't connect to Firebase, saving ~200MB of overhead.

### 3. Disable Source Maps (If Build is Slow)

In `next.config.js`, temporarily set:
```javascript
productionBrowserSourceMaps: false,
```

### 4. Increase Node.js Memory (If Build Crashes)

```bash
# Increase to 2GB
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### 5. Use Turbopack (Faster Dev Server)

```bash
npm run dev -- --turbo
```

### 6. Skip Type Checking During Development

```bash
# In .env.local, add:
NEXT_SKIP_TYPE_CHECK=true
```

---

## Troubleshooting

### "Module not found" After `git pull`

```bash
npm install
npm run dx:clean
```

### Build Fails with "JavaScript heap out of memory"

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### "EACCES: permission denied" on npm install

```bash
# Fix npm permissions (never use sudo npm install)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Firewall Blocking Localhost (Corporate / College Networks)

Some corporate networks and college WiFi block localhost ports. Try:

```bash
# Use a different port
PORT=8080 npm run dev

# Or use 0.0.0.0 to listen on all interfaces
npm run dev -- --hostname 0.0.0.0
```

### "Pre-commit Hook Failed"

```bash
# See what the linter is complaining about
npm run lint

# Auto-fix
npm run dx:fix

# Nuclear option: bypass hook (use sparingly)
git commit --no-verify -m "chore: emergency fix"
```

### Everything Broken (Nuclear Reset)

```bash
npm run dx:fresh
# This deletes node_modules and .next, then reinstalls
```

---

## Environment Variable Cheat Sheet

| Variable | Demo Mode | Firebase Mode |
|----------|-----------|---------------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` | `false` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `http://localhost:3000` |
| Firebase keys | Not needed | Required |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` | Not needed | `true` (local dev) |

---

## Getting Help

- **Issue tracker:** [github.com/bandhan-ai/bandhan-ai/issues](https://github.com/bandhan-ai/bandhan-ai/issues)
- **Discussions:** [github.com/bandhan-ai/bandhan-ai/discussions](https://github.com/bandhan-ai/bandhan-ai/discussions)
- **Email:** dev@bandhan.ai
- **Contributing guide:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Security issues:** security@bandhan.ai (do NOT open a public issue)
