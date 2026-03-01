/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Jest Setup / Global Test Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Runs after the test framework is installed in the environment.
 * Provides:
 *   • @testing-library/jest-dom matchers
 *   • Global mocks for browser APIs (localStorage, matchMedia, etc.)
 *   • Firebase mock infrastructure
 *   • Common test helpers
 * ─────────────────────────────────────────────────────────────────────────────
 */

import "@testing-library/jest-dom";

// ─── Browser API Mocks ───────────────────────────────────────────────────────

// localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// sessionStorage
Object.defineProperty(window, "sessionStorage", { value: localStorageMock });

// matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

// scrollTo
window.scrollTo = jest.fn();

// navigator.vibrate (haptic feedback)
Object.defineProperty(navigator, "vibrate", {
  writable: true,
  value: jest.fn(),
});

// URL.createObjectURL
URL.createObjectURL = jest.fn(() => "blob:http://localhost:3000/mock-blob-url");
URL.revokeObjectURL = jest.fn();

// ─── Console noise suppression ───────────────────────────────────────────────
// Suppress expected warnings/errors during tests (e.g. framer-motion, React)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    // Suppress known noise
    if (
      msg.includes("Warning: ReactDOM.render") ||
      msg.includes("act(") ||
      msg.includes("Not implemented: HTMLCanvasElement")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("componentWillReceiveProps")) return;
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ─── Global cleanup ──────────────────────────────────────────────────────────
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  document.body.innerHTML = "";
});
