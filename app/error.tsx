/**
 * Bandhan AI — Global Error Boundary (Next.js App Router)
 *
 * Catches unhandled runtime errors at the route level.
 * Logs PII-redacted error details and shows a comic book 500 page.
 */

"use client";

import { useEffect } from "react";
import { redactPII } from "@/lib/security";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ── PII-safe logging ──
    const safeMessage = redactPII(error.message);
    const safeStack = redactPII(error.stack || "");
    console.error("[Bandhan Error]", safeMessage);

    // ── Report to error service if registered ──
    if (
      typeof window !== "undefined" &&
      (window as any).__BANDHAN_REPORT_ERROR
    ) {
      try {
        (window as any).__BANDHAN_REPORT_ERROR({
          message: safeMessage,
          stack: safeStack,
          digest: error.digest,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        });
      } catch {
        // Reporting failed — don't cascade
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* 8-bit styled 500 */}
        <div className="inline-block border-[3px] border-black px-6 py-3 shadow-[4px_4px_0px_#000000] mb-6">
          <h1 className="text-5xl font-bold text-black tracking-wider m-0">
            500
          </h1>
        </div>

        <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-2">
          Something Went Wrong
        </h2>
        <p className="text-xs text-[#9E9E9E] mb-1">
          An unexpected error occurred. Our team has been notified.
        </p>
        <p className="text-xs text-[#9E9E9E] mb-6" lang="hi">
          एक अनपेक्षित त्रुटि हुई। हमारी टीम को सूचित कर दिया गया है।
        </p>

        {error.digest && (
          <p className="text-[9px] text-[#E0E0E0] font-mono mb-4">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-black bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all no-underline"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
