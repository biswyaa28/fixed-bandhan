/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Revenue Analytics Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tracks all monetization KPIs:
 *   • MRR / ARR with trend lines
 *   • Conversion funnel (Free → Trial → Paid)
 *   • ARPU, LTV, LTV:CAC ratio
 *   • Revenue by plan and payment method
 *   • Churn revenue impact
 *   • Upsell effectiveness
 *   • Unit economics summary
 *
 * Comic book aesthetic. Monochromatic. Hard shadows.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Users,
  Crown,
  ArrowRight,
  BarChart3,
  RefreshCw,
  Receipt,
} from "lucide-react";
import {
  generateGrowthReport,
  formatMetricValue,
  type GrowthReport,
  type MetricPeriod,
  type MetricSnapshot,
  METRIC_TARGETS,
} from "@/lib/analytics/growth-metrics";
import {
  getEventsByName,
  getPremiumConversionRate,
} from "@/lib/analytics";

// ─── Sub-Components ──────────────────────────────────────────────────────

function BigNumber({
  label,
  value,
  format,
  target,
  isOnTrack,
}: {
  label: string;
  value: number;
  format: "number" | "percent" | "currency" | "decimal";
  target?: number | null;
  isOnTrack?: boolean | null;
}) {
  return (
    <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-4 text-center">
      <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#212121]">
        {formatMetricValue(value, format)}
      </p>
      {target != null && (
        <p className={`text-[8px] mt-1 font-bold ${isOnTrack ? "text-[#212121]" : "text-[#9E9E9E]"}`}>
          Target: {formatMetricValue(target, format)} {isOnTrack ? "✓" : "✗"}
        </p>
      )}
    </div>
  );
}

function ConversionFunnel({
  freeUsers,
  trialUsers,
  paidUsers,
}: {
  freeUsers: number;
  trialUsers: number;
  paidUsers: number;
}) {
  const total = Math.max(freeUsers, 1);
  const stages = [
    { label: "Free Users", count: freeUsers, pct: 100 },
    { label: "Started Trial", count: trialUsers, pct: Math.round((trialUsers / total) * 100) },
    { label: "Paid Users", count: paidUsers, pct: Math.round((paidUsers / total) * 100) },
  ];

  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={s.label}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-bold text-[#424242]">{s.label}</span>
            <span className="text-[9px] text-[#9E9E9E]">
              {s.count} ({s.pct}%)
            </span>
          </div>
          <div className="h-4 bg-[#F8F8F8] border border-[#E0E0E0]">
            <div
              className="h-full bg-[#212121] transition-all"
              style={{ width: `${s.pct}%` }}
            />
          </div>
          {i < stages.length - 1 && (
            <div className="flex justify-center my-1">
              <ArrowRight size={10} strokeWidth={3} className="text-[#E0E0E0] rotate-90" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UpsellEffectiveness() {
  const impressions = getEventsByName("upsell_modal_shown").length;
  const clicks = getEventsByName("upgrade_cta_clicked").length;
  const dismissals = getEventsByName("upsell_modal_dismissed").length;
  const reminders = getEventsByName("remind_me_tomorrow_clicked").length;
  const conversions = getEventsByName("premium_converted").length;

  const clickRate = impressions > 0 ? Math.round((clicks / impressions) * 100) : 0;
  const convRate = clicks > 0 ? Math.round((conversions / clicks) * 100) : 0;

  const data = [
    { label: "Upsell Shown", count: impressions },
    { label: "CTA Clicked", count: clicks },
    { label: "Dismissed", count: dismissals },
    { label: "Remind Tomorrow", count: reminders },
    { label: "Converted", count: conversions },
  ];

  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center justify-between py-1 border-b border-dashed border-[#E0E0E0] last:border-0">
          <span className="text-[9px] text-[#424242]">{d.label}</span>
          <span className="text-[9px] font-bold text-[#212121]">{d.count}</span>
        </div>
      ))}
      <div className="border-t-[2px] border-black pt-2 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-[#212121]">Click-through Rate</span>
          <span className="text-[9px] font-bold">{clickRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-[#212121]">Click-to-Conversion</span>
          <span className="text-[9px] font-bold">{convRate}%</span>
        </div>
      </div>
    </div>
  );
}

function UnitEconomics({
  arpu,
  ltv,
  cac,
  churnRate,
  grossMargin,
  paybackDays,
}: {
  arpu: number;
  ltv: number;
  cac: number;
  churnRate: number;
  grossMargin: number;
  paybackDays: number;
}) {
  const ltvCac = cac > 0 ? Math.round(ltv / cac) : 0;
  const healthy = ltvCac >= 3;

  return (
    <div className="space-y-2">
      {[
        { label: "ARPU (Monthly)", value: `₹${arpu}`, target: `₹${METRIC_TARGETS.revenue.arpu}` },
        { label: "LTV", value: `₹${ltv}`, target: `₹${METRIC_TARGETS.revenue.ltv}` },
        { label: "CAC", value: `₹${cac}`, target: `<₹${METRIC_TARGETS.acquisition.cpa}` },
        { label: "LTV:CAC", value: `${ltvCac}:1`, target: "≥3:1" },
        { label: "Gross Margin", value: `${grossMargin}%`, target: ">90%" },
        { label: "Monthly Churn", value: `${churnRate}%`, target: `<${METRIC_TARGETS.retention.monthlyChurnRate}%` },
        { label: "Payback Period", value: `${paybackDays} days`, target: "<30 days" },
      ].map((row) => (
        <div key={row.label} className="flex items-center justify-between py-1 border-b border-dashed border-[#E0E0E0] last:border-0">
          <span className="text-[9px] text-[#424242]">{row.label}</span>
          <div className="text-right">
            <span className="text-[9px] font-bold text-[#212121]">{row.value}</span>
            <span className="text-[7px] text-[#9E9E9E] block">target: {row.target}</span>
          </div>
        </div>
      ))}
      <div className={`mt-2 p-2 border-[2px] text-center text-[9px] font-bold ${healthy ? "border-black bg-[#F8F8F8]" : "border-black border-dashed bg-white"}`}>
        {healthy ? "✓ Unit economics healthy" : "⚠ LTV:CAC below 3:1 threshold"}
      </div>
    </div>
  );
}

function PaymentMethodBreakdown() {
  const convEvents = getEventsByName("premium_converted");
  const byMethod: Record<string, number> = { upi: 0, card: 0, netbanking: 0, wallet: 0 };

  convEvents.forEach((e) => {
    const method = (e.properties as any)?.payment_method || "upi";
    byMethod[method] = (byMethod[method] || 0) + 1;
  });

  const total = Math.max(Object.values(byMethod).reduce((a, b) => a + b, 0), 1);

  return (
    <div className="space-y-1">
      {Object.entries(byMethod).map(([method, count]) => (
        <div key={method} className="flex items-center gap-2">
          <span className="text-[9px] text-[#424242] w-20 capitalize">{method}</span>
          <div className="flex-1 h-3 bg-[#F8F8F8] border border-[#E0E0E0]">
            <div
              className="h-full bg-[#212121]"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-bold w-12 text-right">
            {count} ({Math.round((count / total) * 100)}%)
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function RevenueDashboard() {
  const [period, setPeriod] = useState<MetricPeriod>("30d");
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => generateGrowthReport(period), [period, refreshKey]);
  const rev = report.revenue;

  // Derive unit economics
  const arpu = rev.arpu.value || METRIC_TARGETS.revenue.arpu;
  const churnRate = report.retention.churnRate.value || METRIC_TARGETS.retention.monthlyChurnRate;
  const ltv = churnRate > 0 ? Math.round(arpu / (churnRate / 100)) : 0;
  const cac = report.acquisition.costPerAcquisition.value || 2; // ₹2 organic
  const grossMargin = 95; // from pricing-strategy.md
  const paybackDays = arpu > 0 ? Math.round((cac / (arpu * (grossMargin / 100))) * 30) : 0;

  // Funnel numbers
  const trialEvents = getEventsByName("checkout_started").length;
  const convEvents = getEventsByName("premium_converted").length;
  const totalUsers = Math.max(report.acquisition.signupsTotal.value, 1);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={16} strokeWidth={3} />
            <h1 className="text-sm font-bold uppercase tracking-wider">Revenue Analytics</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as MetricPeriod)}
              className="appearance-none bg-transparent border-[2px] border-white text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1"
            >
              <option value="today" className="text-black">Today</option>
              <option value="7d" className="text-black">7 Days</option>
              <option value="30d" className="text-black">30 Days</option>
              <option value="90d" className="text-black">90 Days</option>
            </select>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="border-[2px] border-white p-1 hover:bg-white hover:text-black transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Top-line numbers */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <BigNumber label="MRR" value={rev.mrr.value} format="currency" target={rev.mrr.target} isOnTrack={rev.mrr.isOnTrack} />
          <BigNumber label="ARR" value={rev.arr.value} format="currency" />
          <BigNumber label="ARPU" value={rev.arpu.value} format="currency" target={rev.arpu.target} isOnTrack={rev.arpu.isOnTrack} />
          <BigNumber label="Conversion" value={rev.conversionRate.value} format="percent" target={rev.conversionRate.target} isOnTrack={rev.conversionRate.isOnTrack} />
          <BigNumber label="Paying Users" value={rev.payingUsers.value} format="number" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <TrendingUp size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Conversion Funnel</h2>
            </div>
            <div className="p-4">
              <ConversionFunnel
                freeUsers={totalUsers}
                trialUsers={trialEvents}
                paidUsers={convEvents}
              />
            </div>
          </section>

          {/* Upsell Effectiveness */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <Crown size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Upsell Effectiveness</h2>
            </div>
            <div className="p-4">
              <UpsellEffectiveness />
            </div>
          </section>

          {/* Unit Economics */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <DollarSign size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Unit Economics</h2>
            </div>
            <div className="p-4">
              <UnitEconomics
                arpu={arpu}
                ltv={ltv}
                cac={cac}
                churnRate={churnRate}
                grossMargin={grossMargin}
                paybackDays={paybackDays}
              />
            </div>
          </section>

          {/* Payment Methods */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <Receipt size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Payment Methods</h2>
            </div>
            <div className="p-4">
              <PaymentMethodBreakdown />
            </div>
          </section>
        </div>

        {/* Revenue by Plan */}
        {rev.revenueByPlan.length > 0 && (
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <BarChart3 size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Revenue by Plan</h2>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead>
                    <tr className="border-b-[2px] border-black bg-[#F8F8F8]">
                      <th className="text-left px-3 py-2 font-bold text-[#424242] uppercase tracking-wider">Plan</th>
                      <th className="text-right px-3 py-2 font-bold text-[#424242] uppercase tracking-wider">Users</th>
                      <th className="text-right px-3 py-2 font-bold text-[#424242] uppercase tracking-wider">Revenue</th>
                      <th className="text-right px-3 py-2 font-bold text-[#424242] uppercase tracking-wider">ARPU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rev.revenueByPlan.map((p) => (
                      <tr key={p.plan} className="border-b border-[#E0E0E0] hover:bg-[#F8F8F8]">
                        <td className="px-3 py-2 font-bold text-[#212121] capitalize">{p.plan}</td>
                        <td className="px-3 py-2 text-right text-[#424242]">{p.users}</td>
                        <td className="px-3 py-2 text-right text-[#424242]">₹{p.revenue}</td>
                        <td className="px-3 py-2 text-right text-[#424242]">
                          ₹{p.users > 0 ? Math.round(p.revenue / p.users) : 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <p className="text-[8px] text-[#9E9E9E] text-center">
          Generated: {new Date(report.generatedAt).toLocaleString("en-IN")} · Period: {period}
        </p>
      </main>
    </div>
  );
}
