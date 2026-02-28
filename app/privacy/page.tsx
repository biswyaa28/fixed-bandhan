/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Privacy Policy Page
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Compliant with:
 *   - Digital Personal Data Protection Act, 2023 (India)
 *   - Information Technology Act, 2000 (India)
 *   - IT (Reasonable Security Practices) Rules, 2011
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Bandhan AI Privacy Policy — DPDP Act 2023 Compliant",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-8 pb-24 text-[#212121]">
      <header className="mb-8">
        <h1 className="text-xl font-bold text-black uppercase tracking-wider border-b-[3px] border-black pb-3 mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#9E9E9E]">
          Last updated: 28 February 2026 · Version 2026-02-28-v1
        </p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed">
        {/* ── 1. Who We Are ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            1. Who We Are
          </h2>
          <p>
            Bandhan AI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated by [Your Company
            Name], a company registered under the laws of India with registered
            office at [Address, City, State, PIN Code].
          </p>
          <p className="mt-2">
            <strong>Data Protection Officer:</strong> [Name], reachable at{" "}
            <a href="mailto:dpo@bandhan.ai" className="text-black underline font-bold">
              dpo@bandhan.ai
            </a>
          </p>
          <p className="mt-2">
            <strong>Grievance Officer (IT Act §5(9)):</strong> [Name], reachable
            at{" "}
            <a href="mailto:grievance@bandhan.ai" className="text-black underline font-bold">
              grievance@bandhan.ai
            </a>
          </p>
        </section>

        {/* ── 2. What Data We Collect ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            2. What Data We Collect
          </h2>
          <table className="w-full text-xs border-2 border-black">
            <thead>
              <tr className="bg-[#F8F8F8]">
                <th className="text-left p-2 border-b-2 border-black font-bold uppercase tracking-wider">Category</th>
                <th className="text-left p-2 border-b-2 border-black font-bold uppercase tracking-wider">Examples</th>
                <th className="text-left p-2 border-b-2 border-black font-bold uppercase tracking-wider">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E0E0E0]">
                <td className="p-2 font-bold">Identity</td>
                <td className="p-2">Name, age, gender, photos</td>
                <td className="p-2">Profile creation, matching</td>
              </tr>
              <tr className="border-b border-[#E0E0E0]">
                <td className="p-2 font-bold">Contact</td>
                <td className="p-2">Phone number (verified via OTP)</td>
                <td className="p-2">Authentication, safety</td>
              </tr>
              <tr className="border-b border-[#E0E0E0]">
                <td className="p-2 font-bold">Verification</td>
                <td className="p-2">DigiLocker ID verification status</td>
                <td className="p-2">Trust & safety badges</td>
              </tr>
              <tr className="border-b border-[#E0E0E0]">
                <td className="p-2 font-bold">Preferences</td>
                <td className="p-2">Intent, values, lifestyle choices</td>
                <td className="p-2">AI matching algorithm</td>
              </tr>
              <tr className="border-b border-[#E0E0E0]">
                <td className="p-2 font-bold">Usage</td>
                <td className="p-2">Page views, feature usage (anonymised)</td>
                <td className="p-2">Product improvement</td>
              </tr>
              <tr>
                <td className="p-2 font-bold">Messages</td>
                <td className="p-2">Chat messages, voice notes</td>
                <td className="p-2">Communication between matches</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-[#424242]">
            We do NOT collect: Aadhaar numbers, biometrics, financial data,
            caste information, or health records.
          </p>
        </section>

        {/* ── 3. Analytics & Tracking ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            3. Analytics & Tracking
          </h2>
          <div className="border-2 border-black p-3 bg-[#F8F8F8] space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider">
              ✓ We use Umami — self-hosted, open-source, privacy-first analytics.
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-[#424242]">
              <li>NO Google Analytics or third-party tracking</li>
              <li>NO cookies — visitor identification uses anonymised hashing</li>
              <li>IP addresses are anonymised (last octet stripped)</li>
              <li>All data stored on servers in India (Mumbai region)</li>
              <li>Data auto-deleted after 90 days</li>
              <li>Do Not Track (DNT) browser setting is respected</li>
              <li>Data is NEVER sold to or shared with third parties</li>
            </ul>
          </div>
          <p className="mt-2 text-xs">
            We track only aggregated metrics: daily active users, match rates,
            message response rates, profile completion rates, and feature usage
            (e.g., voice notes, safety button). No individual user profiles
            are built from analytics data.
          </p>
        </section>

        {/* ── 4. Consent (DPDP Act §6) ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            4. Consent (DPDP Act §6)
          </h2>
          <p>
            We obtain your consent separately for each of the following
            purposes, as required by §6(3) of the Digital Personal Data
            Protection Act, 2023:
          </p>
          <ul className="mt-2 space-y-2">
            <li className="border-l-[3px] border-black pl-3">
              <strong>Essential (always on):</strong> Core app functionality,
              safety features, error reporting. Legal basis: legitimate interest
              and performance of contract.
            </li>
            <li className="border-l-[3px] border-black pl-3">
              <strong>Matching Analytics:</strong> Improving match quality and
              discovery. You can opt out at any time.
            </li>
            <li className="border-l-[3px] border-black pl-3">
              <strong>Safety Analytics:</strong> Detecting fake profiles and
              preventing harassment. You can opt out at any time.
            </li>
            <li className="border-l-[3px] border-black pl-3">
              <strong>Product Improvement:</strong> Understanding usage patterns
              to build better features. You can opt out at any time. Data is
              never shared with third parties.
            </li>
          </ul>
          <p className="mt-2">
            You can withdraw consent at any time by visiting Settings → Privacy
            or by tapping the &quot;Manage Privacy&quot; option in the consent
            banner.
          </p>
        </section>

        {/* ── 5. Your Rights (DPDP Act §11-13) ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            5. Your Rights Under DPDP Act 2023
          </h2>
          <ul className="space-y-2">
            <li className="border-l-[3px] border-black pl-3">
              <strong>Right to Access (§11):</strong> You can export all your
              data at any time via Settings → Privacy → Export My Data. The
              export includes all analytics events and consent records.
            </li>
            <li className="border-l-[3px] border-black pl-3">
              <strong>Right to Correction (§12(1)):</strong> You can edit your
              profile information at any time via the Profile page.
            </li>
            <li className="border-l-[3px] border-black pl-3">
              <strong>Right to Erasure (§12(2)):</strong> You can delete all
              your analytics data via Settings → Privacy → Delete My Data. To
              delete your entire account, contact{" "}
              <a href="mailto:dpo@bandhan.ai" className="underline font-bold">
                dpo@bandhan.ai
              </a>
              .
            </li>
            <li className="border-l-[3px] border-black pl-3">
              <strong>Right to Grievance Redressal (§13):</strong> Complaints
              can be filed with our Grievance Officer at{" "}
              <a href="mailto:grievance@bandhan.ai" className="underline font-bold">
                grievance@bandhan.ai
              </a>
              . We will respond within 30 days.
            </li>
            <li className="border-l-[3px] border-black pl-3">
              <strong>Right to Nominate (§14):</strong> You may nominate another
              person to exercise your rights in the event of your death or
              incapacity.
            </li>
          </ul>
        </section>

        {/* ── 6. Data Storage & Retention ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            6. Data Storage & Retention
          </h2>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>
              <strong>Location:</strong> All data is stored on servers located
              in India (Mumbai region) in compliance with DPDP Act data
              localisation requirements.
            </li>
            <li>
              <strong>Analytics data:</strong> Auto-deleted after 90 days via
              automated retention cron jobs.
            </li>
            <li>
              <strong>Account data:</strong> Retained while your account is
              active. Deleted within 30 days of account deletion request.
            </li>
            <li>
              <strong>Chat messages:</strong> Retained while the conversation is
              active. Deleted when either party deletes the conversation.
            </li>
            <li>
              <strong>Safety reports:</strong> Retained for up to 1 year for
              legal compliance and platform safety.
            </li>
          </ul>
        </section>

        {/* ── 7. Data Sharing ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            7. Data Sharing
          </h2>
          <div className="border-2 border-black p-3 bg-[#F8F8F8]">
            <p className="font-bold text-xs uppercase tracking-wider mb-2">
              We NEVER sell your data to third parties.
            </p>
            <p className="text-xs text-[#424242]">
              Your data may only be shared with:
            </p>
            <ul className="text-xs space-y-1 list-disc list-inside text-[#424242] mt-1">
              <li>Your matched connections (only profile info you choose to share)</li>
              <li>
                DigiLocker (only for identity verification, with your explicit
                consent)
              </li>
              <li>
                Law enforcement (only when legally required under Indian law,
                with valid court order)
              </li>
              <li>Payment processors (Razorpay — for premium subscriptions only)</li>
            </ul>
          </div>
        </section>

        {/* ── 8. Security ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            8. Security Measures
          </h2>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>All data transmitted over HTTPS (TLS 1.3)</li>
            <li>Phone numbers verified via Firebase Authentication</li>
            <li>Firestore Security Rules enforce user-level data isolation</li>
            <li>Profile photos stored in Firebase Storage with access controls</li>
            <li>Regular security audits and penetration testing</li>
            <li>Incident response: Users notified within 72 hours of any data breach</li>
          </ul>
        </section>

        {/* ── 9. Children ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            9. Children&apos;s Privacy
          </h2>
          <p>
            Bandhan AI is intended for adults aged 18 and above. We do not
            knowingly collect data from anyone under 18. If we learn that a
            minor has provided us data, we will delete it immediately and
            terminate the account.
          </p>
        </section>

        {/* ── 10. Changes to Policy ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. When we do, we will:
          </p>
          <ul className="mt-1 space-y-1 text-xs list-disc list-inside">
            <li>Update the &quot;Last updated&quot; date at the top</li>
            <li>Show the consent banner again so you can review changes</li>
            <li>Notify registered users via in-app notification</li>
          </ul>
          <p className="mt-2">
            Continued use of the app after policy changes constitutes
            acceptance of the updated policy.
          </p>
        </section>

        {/* ── 11. Contact ── */}
        <section>
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            11. Contact Us
          </h2>
          <div className="border-2 border-black p-3 space-y-1 text-xs">
            <p>
              <strong>Data Protection Officer:</strong>{" "}
              <a href="mailto:dpo@bandhan.ai" className="underline">dpo@bandhan.ai</a>
            </p>
            <p>
              <strong>Grievance Officer:</strong>{" "}
              <a href="mailto:grievance@bandhan.ai" className="underline">grievance@bandhan.ai</a>
            </p>
            <p>
              <strong>General:</strong>{" "}
              <a href="mailto:support@bandhan.ai" className="underline">support@bandhan.ai</a>
            </p>
            <p>
              <strong>Address:</strong> [Registered Office Address, City, State,
              PIN Code, India]
            </p>
          </div>
        </section>

        {/* ── Hindi summary ── */}
        <section lang="hi" className="border-t-2 border-[#E0E0E0] pt-6">
          <h2 className="text-sm font-bold text-black uppercase tracking-wider border-b-2 border-black pb-1 mb-3">
            गोपनीयता नीति सारांश (हिंदी)
          </h2>
          <div className="text-xs text-[#424242] space-y-2 leading-relaxed">
            <p>
              बंधन एआई आपकी गोपनीयता की रक्षा करने के लिए प्रतिबद्ध है। डिजिटल
              व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के अनुसार:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>हम कोई Google Analytics या तृतीय-पक्ष ट्रैकिंग का उपयोग नहीं करते।</li>
              <li>सभी डेटा भारत (मुंबई) में संग्रहीत है।</li>
              <li>एनालिटिक्स डेटा 90 दिनों के बाद स्वतः हटाया जाता है।</li>
              <li>आपका डेटा कभी तीसरे पक्ष को नहीं बेचा जाता।</li>
              <li>आप कभी भी अपना डेटा निर्यात या हटा सकते हैं।</li>
              <li>शिकायत के लिए: grievance@bandhan.ai</li>
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
}
