# Contributing to Bandhan AI

Thank you for your interest in contributing to Bandhan AI! 🇮🇳

This guide is written with Indian developers in mind — including those on Windows laptops, Jio/Airtel connections, and college lab machines.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Commit Convention](#commit-convention)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Translation Contributions](#translation-contributions)
9. [Testing](#testing)
10. [Common Issues & Fixes](#common-issues--fixes)

---

## Code of Conduct

- Be respectful to all contributors regardless of background, experience, or language.
- Use English for code and comments. Hindi is welcome in UI translations and issue discussions.
- No harassment, casteism, sexism, or discrimination of any kind.
- Respect different coding styles — the linter enforces consistency, not the reviewer.

---

## Getting Started

### Prerequisites

| Tool | Version | Install Guide |
|------|---------|---------------|
| **Node.js** | ≥ 18.17 | [nodejs.org](https://nodejs.org/) — download the LTS version |
| **npm** | ≥ 9.0 | Comes with Node.js |
| **Git** | ≥ 2.30 | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

**Windows users:** Install [Git Bash](https://gitforwindows.org/) — the Husky hooks require a bash-compatible shell.

### First-time Setup

```bash
# 1. Fork the repo on GitHub, then clone YOUR fork
git clone https://github.com/YOUR_USERNAME/bandhan-ai.git
cd bandhan-ai

# 2. Add the upstream remote
git remote add upstream https://github.com/bandhan-ai/bandhan-ai.git

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.local.example .env.local
# Edit .env.local — for demo mode, just set:
#   NEXT_PUBLIC_DEMO_MODE=true

# 5. Start the dev server
npm run demo
# Open http://localhost:3000
```

### VS Code Setup

When you open the project in VS Code, you'll see a popup: **"This workspace has recommended extensions."** — click **Install All**. This gives you:

- **Prettier** — auto-formats on save
- **ESLint** — highlights errors as you type
- **Tailwind CSS IntelliSense** — autocomplete for classes
- **axe Accessibility Linter** — catches a11y issues inline

These settings are shared across the team via `.vscode/settings.json`.

---

## Development Workflow

### Branch Naming

```
feat/voice-note-recording
fix/otp-timeout-jio
docs/setup-guide-windows
chore/update-firebase-sdk
```

Pattern: `<type>/<short-description-in-kebab-case>`

### Daily Workflow

```bash
# 1. Sync with upstream
git checkout main
git pull upstream main

# 2. Create a branch
git checkout -b feat/my-feature

# 3. Make changes, commit frequently
git add .
git commit -m "feat: add voice note waveform display"

# 4. Push and create PR
git push origin feat/my-feature
# Then open a PR on GitHub
```

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run demo` | Start in demo mode (no Firebase needed) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run format` | Format all files with Prettier |
| `npm run dx:check` | Lint + type-check + format check (CI equivalent) |
| `npm run dx:fix` | Auto-fix lint + format issues |
| `npm run dx:clean` | Clear build caches |
| `npm run dx:fresh` | Nuclear option — reinstall everything |
| `npm run dx:ports` | Check for port conflicts |
| `npm run emulators` | Start Firebase emulators |
| `npm run analyze` | Analyse bundle size |

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/). The commit-msg hook enforces this.

### Format

```
<type>(<optional scope>): <description>
```

### Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add profile completion progress bar` |
| `fix` | Bug fix | `fix: OTP not sending on Airtel numbers` |
| `docs` | Documentation | `docs: add Windows setup troubleshooting` |
| `style` | Formatting only | `style: fix indentation in ChatBubble` |
| `refactor` | Code restructure | `refactor: extract useMatchScore hook` |
| `perf` | Performance | `perf: lazy-load discovery feed images` |
| `test` | Tests | `test: add unit tests for sanitizeText` |
| `chore` | Tooling/deps | `chore: update ESLint to v9` |
| `ci` | CI/CD | `ci: add deploy preview on PR` |
| `revert` | Revert a commit | `revert: undo chat bubble border change` |

### Bypass (emergency only)

```bash
git commit --no-verify -m "hotfix: critical auth bug in production"
```

---

## Pull Request Process

1. **Create a focused PR** — one feature or fix per PR. Keep it under 400 lines changed.
2. **Fill out the PR template** — describe what and why.
3. **Ensure CI passes** — lint, type-check, build must all pass.
4. **Request review** — tag at least one maintainer.
5. **Address feedback** — push new commits, don't force-push during review.
6. **Squash on merge** — maintainers will squash-merge to keep history clean.

### PR Title Format

Same as commit convention:
```
feat: add profile visitors page
fix: chat messages not loading on slow connections
```

### PR Checklist

- [ ] Lint passes (`npm run lint`)
- [ ] Type-check passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tested in demo mode (`npm run demo`)
- [ ] Responsive — tested at 320px, 768px, 1280px
- [ ] Accessible — keyboard navigation works, screen reader friendly
- [ ] No console.log left (use `console.warn` / `console.error` only)
- [ ] No hardcoded strings — use translation keys for UI text

---

## Coding Standards

### TypeScript

- **Prefer `interface` over `type`** for object shapes (better error messages).
- **Avoid `any`** — use `unknown` and narrow the type. Linter will warn.
- **Name files** in kebab-case: `use-daily-limit.ts`, `match-insights.tsx`
- **Name components** in PascalCase: `ProfileCard`, `ChatBubble`
- **Name hooks** starting with `use`: `useMatchScore`, `useFilters`

### React

- **Use `"use client"`** directive only when the component uses hooks, event handlers, or browser APIs.
- **Prefer Server Components** (default in Next.js App Router) for data fetching and static content.
- **Always add `key` prop** to elements in `.map()` — the linter enforces this.
- **Memoize expensive computations** with `useMemo`. Memoize callbacks with `useCallback` when passing to child components.

### CSS / Tailwind

- **Use Tailwind classes** — no custom CSS unless absolutely necessary.
- **Use the `cn()` utility** from `lib/utils` for conditional classes.
- **Mobile-first** — write base styles for mobile, then add `md:` and `lg:` breakpoints.
- **Monochromatic palette** — white, grays, and black only. No colour gradients.

### Imports

```typescript
// 1. External libraries
import { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";

// 2. Internal modules (use @/ aliases)
import { sanitizeText } from "@/lib/security";
import { useFilters } from "@/hooks/useFilters";

// 3. Components
import { ProfileCard } from "@/components/ProfileCard";

// 4. Types (import type when possible)
import type { UserProfile } from "@/lib/firebase/schema";
```

---

## Accessibility Guidelines

Every PR must consider accessibility:

- **Images:** Always include `alt` text.
- **Buttons:** Use `<button>` not `<div onClick>`. If you must, add `role="button"`, `tabIndex={0}`, and keyboard handlers.
- **Forms:** Every input needs a visible `<label>` or `aria-label`.
- **Colour:** Never convey information through colour alone.
- **Focus:** Interactive elements must have visible focus indicators.
- **Motion:** Wrap animations in `prefers-reduced-motion` checks.
- **Language:** Add `lang="hi"` to Hindi text sections.

Run the axe accessibility linter in VS Code to catch issues before pushing.

---

## Translation Contributions

We need native speakers for translations. Currently supported:
- **English** (`locales/en.json`) ✅
- **Hindi** (`locales/hi.json`) ✅

### How to Contribute Translations

1. Open the English file (`locales/en.json`).
2. Copy it to a new file for your language (e.g., `locales/ta.json` for Tamil).
3. Translate each value (NOT the keys).
4. Test by changing the language in the app.
5. Submit a PR with title: `docs: add Tamil translations`

### Translation Rules

- **Natural language** — translate the meaning, not word-for-word.
- **Respectful tone** — use formal "aap" (आप) not informal "tum" (तुम) in Hindi.
- **Keep placeholders** — `{{name}}` must stay as-is.
- **Test text length** — Hindi text is ~30% longer than English. Make sure it fits.

---

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- --testPathPattern=security
```

### What to Test

- **Utility functions** (`lib/security.ts`, `lib/analytics.ts`): Unit tests.
- **Hooks** (`hooks/useFilters.ts`): Test with React Testing Library.
- **Components**: Test render + user interaction, not implementation details.
- **Zod schemas**: Test valid and invalid inputs.

### Test File Location

Put test files next to the source:
```
lib/
  security.ts
  security.test.ts      ← here
components/
  ProfileCard.tsx
  ProfileCard.test.tsx   ← here
```

---

## Common Issues & Fixes

### Port 3000 Already in Use

```bash
# macOS / Linux
lsof -i :3000
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use the helper script
npm run dx:ports
```

### `npm install` Fails on Slow Connection (Jio/Airtel)

```bash
# Use the npm mirror (faster in India)
npm config set registry https://registry.npmmirror.com

# Or use a smaller timeout
npm install --fetch-timeout=120000

# Reset to default when done
npm config set registry https://registry.npmjs.org
```

### Husky Hooks Not Running

```bash
# Reinstall husky
npx husky install

# Make hooks executable (Linux/macOS)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Windows: hooks run automatically via Git Bash
```

### TypeScript Errors After `git pull`

```bash
# Clear caches and rebuild
npm run dx:clean
npm run type-check
```

### Firebase Emulators Won't Start

```bash
# Check Java is installed (required for Firestore emulator)
java -version
# If not: sudo apt install default-jre (Ubuntu) or download from java.com

# Check ports aren't in use
npm run dx:ports
```

### ESLint Errors After Upgrading

```bash
# Auto-fix everything
npm run dx:fix

# If that fails, check the specific rule
npx eslint --debug path/to/file.tsx
```

---

## Questions?

- **GitHub Issues:** For bug reports and feature requests
- **GitHub Discussions:** For questions and ideas
- **Email:** dev@bandhan.ai

We're happy to help new contributors get started! Don't hesitate to ask. 🙏
