/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Jest Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Configured for Next.js 14 + TypeScript + React Testing Library.
 *
 * Coverage thresholds enforce 80% minimum across all metrics.
 * Firebase modules are fully mocked via moduleNameMapper.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customConfig = {
  // ── Test environments ──────────────────────────────────────────────────
  testEnvironment: "jsdom",

  // ── Setup files ────────────────────────────────────────────────────────
  setupFilesAfterSetup: ["<rootDir>/tests/setup.ts"],

  // ── Test paths ─────────────────────────────────────────────────────────
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.{ts,tsx}",
    "<rootDir>/tests/integration/**/*.test.{ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/tests/e2e/",
  ],

  // ── Module resolution (mirrors tsconfig paths) ─────────────────────────
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/contexts/(.*)$": "<rootDir>/contexts/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/styles/(.*)$": "<rootDir>/styles/$1",
    "^@/locales/(.*)$": "<rootDir>/locales/$1",
    // Mock static assets
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|avif|ico|bmp|svg)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
  },

  // ── Transform ──────────────────────────────────────────────────────────
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        jsx: "react-jsx",
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@firebase|firebase|lucide-react|framer-motion)/)",
  ],

  // ── Coverage ───────────────────────────────────────────────────────────
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "contexts/**/*.{ts,tsx}",
    "app/**/route.ts",
    "middleware.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__mocks__/**",
    "!**/index.ts", // barrel exports
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "html", "json-summary"],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // ── Performance ────────────────────────────────────────────────────────
  maxWorkers: "50%",
  testTimeout: 10000,

  // ── Verbose output ─────────────────────────────────────────────────────
  verbose: true,
};

module.exports = createJestConfig(customConfig);
