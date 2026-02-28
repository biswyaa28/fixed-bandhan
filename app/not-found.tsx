/**
 * Bandhan AI — 404 Not Found (Comic Book / 8-Bit)
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* 8-bit styled 404 */}
        <div className="inline-block border-[3px] border-black px-6 py-3 shadow-[4px_4px_0px_#000000] mb-6">
          <h1 className="text-5xl font-bold text-black tracking-wider m-0">
            404
          </h1>
        </div>

        <h2 className="text-sm font-bold text-black uppercase tracking-wider mb-2">
          Page Not Found
        </h2>
        <p className="text-xs text-[#9E9E9E] mb-1">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <p className="text-xs text-[#9E9E9E] mb-6">
          जो पेज आप ढूंढ रहे हैं वह मौजूद नहीं है।
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all no-underline"
          >
            Go Home
          </Link>
          <Link
            href="/matches"
            className="inline-flex items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-wider text-black bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all no-underline"
          >
            View Matches
          </Link>
        </div>
      </div>
    </div>
  );
}
