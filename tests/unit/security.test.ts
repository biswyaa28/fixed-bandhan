/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit Tests — Security Utilities (lib/security.ts)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests XSS prevention, input sanitization, URL validation, and Zod schemas.
 * These are pure functions — no Firebase mocks needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  stripHtml,
  escapeHtml,
  sanitizeText,
  sanitizeUrl,
} from "@/lib/security";

describe("Security Utilities", () => {
  // ─── stripHtml ───────────────────────────────────────────────────────────
  describe("stripHtml()", () => {
    it("removes all HTML tags", () => {
      expect(stripHtml("<b>Hello</b> <i>World</i>")).toBe("Hello World");
    });

    it("removes script tags and content", () => {
      expect(stripHtml('<script>alert("xss")</script>Hello')).toBe("Hello");
    });

    it("removes img onerror XSS vectors", () => {
      expect(stripHtml('<img onerror=alert(1)> Hello')).toBe("Hello");
    });

    it("handles nested tags", () => {
      expect(stripHtml("<div><p><b>Nested</b></p></div>")).toBe("Nested");
    });

    it("returns empty string for empty input", () => {
      expect(stripHtml("")).toBe("");
    });

    it("returns empty string for null-ish input", () => {
      expect(stripHtml(undefined as any)).toBe("");
      expect(stripHtml(null as any)).toBe("");
    });

    it("preserves plain text", () => {
      expect(stripHtml("Hello World")).toBe("Hello World");
    });

    it("handles encoded entities that bypass first pass", () => {
      // &lt;script&gt; → <script> after decode → stripped
      expect(stripHtml("&lt;script&gt;alert(1)&lt;/script&gt;")).toBe(
        "alert(1)",
      );
    });
  });

  // ─── escapeHtml ──────────────────────────────────────────────────────────
  describe("escapeHtml()", () => {
    it("escapes angle brackets", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    });

    it("escapes quotes", () => {
      expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
    });

    it("escapes ampersands", () => {
      expect(escapeHtml("a & b")).toBe("a &amp; b");
    });

    it("escapes single quotes", () => {
      expect(escapeHtml("it's")).toBe("it&#x27;s");
    });

    it("escapes backticks", () => {
      expect(escapeHtml("`code`")).toBe("&#96;code&#96;");
    });

    it("returns empty string for empty input", () => {
      expect(escapeHtml("")).toBe("");
    });
  });

  // ─── sanitizeText ────────────────────────────────────────────────────────
  describe("sanitizeText()", () => {
    it("strips HTML and trims", () => {
      expect(sanitizeText("  <b>Hi</b> there!  ")).toBe("Hi there!");
    });

    it("collapses multiple whitespace", () => {
      expect(sanitizeText("Hello    World")).toBe("Hello World");
    });

    it("enforces max length", () => {
      const long = "a".repeat(600);
      expect(sanitizeText(long, 500).length).toBe(500);
    });

    it("removes null bytes", () => {
      expect(sanitizeText("Hello\0World")).toBe("HelloWorld");
    });

    it("returns empty for empty input", () => {
      expect(sanitizeText("")).toBe("");
    });
  });

  // ─── sanitizeUrl ─────────────────────────────────────────────────────────
  describe("sanitizeUrl()", () => {
    it("allows https URLs", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
    });

    it("allows http URLs", () => {
      expect(sanitizeUrl("http://example.com")).toBe("http://example.com/");
    });

    it("blocks javascript: protocol", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    });

    it("blocks data: protocol", () => {
      expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
    });

    it("blocks empty string", () => {
      expect(sanitizeUrl("")).toBe("");
    });

    it("blocks malformed URLs", () => {
      expect(sanitizeUrl("not a url")).toBe("");
    });

    it("trims whitespace", () => {
      expect(sanitizeUrl("  https://example.com  ")).toBe(
        "https://example.com/",
      );
    });
  });
});
