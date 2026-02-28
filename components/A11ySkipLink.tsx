/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Skip-to-Content Navigation Link
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Provides keyboard-only users a way to jump directly to the main content,
 * bypassing the BottomNav and any repeated header elements.
 *
 * WCAG 2.1 Success Criterion 2.4.1 — Bypass Blocks (Level A)
 *
 * The link is visually hidden until it receives focus via keyboard Tab,
 * at which point it slides into view at the top of the viewport.
 *
 * Works with screen readers (NVDA, ChromeVox, TalkBack):
 *   - Announced as "Skip to main content" / "मुख्य सामग्री पर जाएं"
 *   - Activates with Enter key → moves focus to #main-content
 *
 * Usage in layout.tsx:
 *   <A11ySkipLink />
 *   <main id="main-content" tabIndex={-1}> ... </main>
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

export function A11ySkipLink() {
  return (
    <>
      {/* Primary: Skip to main content */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only
          focus:fixed focus:top-0 focus:left-0 focus:right-0 focus:z-[9999]
          focus:block focus:bg-black focus:text-white
          focus:px-6 focus:py-3 focus:text-sm focus:font-bold focus:uppercase
          focus:tracking-wider focus:text-center
          focus:border-b-[3px] focus:border-white
          focus:shadow-[0_4px_0px_#000000]
          focus:no-underline
          focus:outline-none
        "
      >
        {/* Bilingual: English + Hindi */}
        <span lang="en">Skip to main content</span>
        {" · "}
        <span lang="hi">मुख्य सामग्री पर जाएं</span>
      </a>

      {/* Secondary: Skip to navigation */}
      <a
        href="#bottom-nav"
        className="
          sr-only focus:not-sr-only
          focus:fixed focus:top-0 focus:left-0 focus:right-0 focus:z-[9999]
          focus:block focus:bg-[#212121] focus:text-white
          focus:px-6 focus:py-3 focus:text-sm focus:font-bold focus:uppercase
          focus:tracking-wider focus:text-center
          focus:border-b-[3px] focus:border-white
          focus:no-underline
          focus:outline-none
        "
      >
        <span lang="en">Skip to navigation</span>
        {" · "}
        <span lang="hi">नेविगेशन पर जाएं</span>
      </a>
    </>
  );
}

export default A11ySkipLink;
