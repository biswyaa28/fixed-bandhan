/**
 * /admin — Admin hub linking to all analytics dashboards.
 */
"use client";

import Link from "next/link";
import {
  BarChart3,
  Users,
  CreditCard,
  Activity,
  TestTube2,
  Shield,
  MessageCircle,
} from "lucide-react";

const DASHBOARDS = [
  {
    href: "/admin/growth",
    icon: BarChart3,
    title: "Growth Dashboard",
    subtitle:
      "AARRR pirate metrics — Acquisition, Activation, Retention, Revenue, Referral",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "User Analytics",
    subtitle: "Session patterns, feature usage, lifecycle stages, A/B tests",
  },
  {
    href: "/admin/revenue",
    icon: CreditCard,
    title: "Revenue Analytics",
    subtitle: "MRR, conversion funnel, unit economics, upsell effectiveness",
  },
  {
    href: "/admin/experiments",
    icon: TestTube2,
    title: "A/B Experiments",
    subtitle: "Running experiments, feature flags, statistical significance, results",
  },
  {
    href: "/admin/moderation",
    icon: Shield,
    title: "Moderation",
    subtitle: "Reports queue, ban management, appeals, content review, SLA tracking",
  },
  {
    href: "/admin/feedback",
    icon: MessageCircle,
    title: "User Feedback",
    subtitle:
      "NPS score, bug reports, feature requests, testimonials, sentiment analysis",
  },
];

export default function AdminHub() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-[3px] border-black bg-[#212121] px-4 py-3 text-white">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <Activity size={16} strokeWidth={3} />
          <h1 className="text-sm font-bold uppercase tracking-wider">Admin Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        {DASHBOARDS.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="block border-[2px] border-black bg-white p-5 no-underline shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-[2px] border-black bg-[#F8F8F8]">
                <d.icon size={18} strokeWidth={2.5} className="text-[#212121]" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
                  {d.title}
                </h2>
                <p className="mt-0.5 text-[10px] text-[#9E9E9E]">{d.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
