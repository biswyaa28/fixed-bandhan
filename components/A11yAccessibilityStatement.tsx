/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Accessibility Statement Footer
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * WCAG 2.1 AA — Displayed in the profile/settings pages.
 * Bilingual: English + Hindi.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function AccessibilityStatement({
  language = "en",
}: {
  language?: "en" | "hi";
}) {
  if (language === "hi") {
    return (
      <section
        lang="hi"
        aria-labelledby="a11y-statement-heading"
        className="border-t-2 border-[#E0E0E0] mt-8 pt-6 px-4 pb-8"
      >
        <h2
          id="a11y-statement-heading"
          className="text-sm font-bold text-black uppercase tracking-wider mb-3"
        >
          सुलभता विवरण
        </h2>
        <div className="text-xs text-[#424242] space-y-2 leading-relaxed max-w-prose">
          <p>
            बंधन एआई सभी के लिए सुलभ होने के लिए प्रतिबद्ध है। हमारा लक्ष्य
            WCAG 2.1 AA मानकों का पालन करना है।
          </p>
          <p>हम निम्नलिखित सुलभता सुविधाएँ प्रदान करते हैं:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>सम्पूर्ण कीबोर्ड नेविगेशन (Tab, Enter, Escape)</li>
            <li>स्क्रीन रीडर समर्थन (NVDA, TalkBack, VoiceOver)</li>
            <li>हिंदी और अंग्रेज़ी दोनों में स्क्रीन रीडर समर्थन</li>
            <li>WCAG AA कलर कंट्रास्ट अनुपात (4.5:1 न्यूनतम)</li>
            <li>कम गति वरीयता समर्थन</li>
            <li>सभी छवियों पर ऑल्ट टेक्स्ट</li>
            <li>फ़ोकस इंडिकेटर सभी इंटरैक्टिव तत्वों पर</li>
          </ul>
          <p>
            सुलभता संबंधी समस्याओं की रिपोर्ट करने के लिए, कृपया
            accessibility@bandhan.ai पर ईमेल करें।
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      lang="en"
      aria-labelledby="a11y-statement-heading"
      className="border-t-2 border-[#E0E0E0] mt-8 pt-6 px-4 pb-8"
    >
      <h2
        id="a11y-statement-heading"
        className="text-sm font-bold text-black uppercase tracking-wider mb-3"
      >
        Accessibility Statement
      </h2>
      <div className="text-xs text-[#424242] space-y-2 leading-relaxed max-w-prose">
        <p>
          Bandhan AI is committed to ensuring digital accessibility for all
          users, including people with disabilities. We aim to conform to WCAG
          2.1 Level AA standards.
        </p>
        <p>We provide the following accessibility features:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Full keyboard navigation (Tab, Enter, Escape)</li>
          <li>Screen reader support (NVDA, TalkBack, VoiceOver, ChromeVox)</li>
          <li>Bilingual screen reader support (English and Hindi)</li>
          <li>WCAG AA color contrast ratios (minimum 4.5:1 for text)</li>
          <li>Reduced motion preference support</li>
          <li>Alt text on all images including profile photos</li>
          <li>Visible focus indicators on all interactive elements</li>
          <li>Form error announcements for screen readers</li>
          <li>Skip-to-content navigation link</li>
        </ul>
        <p>
          To report an accessibility issue, please email{" "}
          <a
            href="mailto:accessibility@bandhan.ai"
            className="text-black underline font-bold"
          >
            accessibility@bandhan.ai
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export default AccessibilityStatement;
