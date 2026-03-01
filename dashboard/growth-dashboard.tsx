/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Growth Dashboard (AARRR Overview)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Top-level dashboard showing all five AARRR pillars at a glance.
 * Comic book aesthetic: thick borders, hard shadows, monochromatic.
 *
 * Route: /admin/growth (protected — admin only)
 *
 * Sections:
 *   1. Health Score (0-100) with colour indicator
 *   2. Alert banner (critical / warning)
 *   3. AARRR summary cards
 *   4. Signup trend chart (sparkline)
 *   5. Funnel visualization
 *   6. Retention curve
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  XCircle,
  Users,
  Zap,
  RotateCcw,
  CreditCard,
  Share2,
  Activity,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import {
  generateGrowthReport,
  formatMetricValue,
  type GrowthReport,
  type MetricSnapshot,
  type MetricPeriod,
  type MetricAlert,
} from "@/lib/analytics/growth-metrics";

// ─── Period Selector ─────────────────────────────────────────────────────

const PERIODS: { value: MetricPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

// ─── Sub-Components ──────────────────────────────────────────────────────

function MetricCard({
  title,
  snapshot,
  format,
  icon: Icon,
  isGoodWhenUp = true,
}: {
  title: string;
  snapshot: MetricSnapshot;
  format: "number" | "percent" | "currency" | "decimal" | "hours";
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  isGoodWhenUp?: boolean;
}) {
  const formatted = formatMetricValue(snapshot.value, format);
  const isOnTrack = snapshot.isOnTrack;

  return (
    <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
          {title}
        </span>
        <Icon size={14} strokeWidth={2.5} className="text-[#9E9E9E]" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-[#212121]">{formatted}</span>
        {snapshot.changePercent != null && (
          <span
            className={`text-[9px] font-bold flex items-center gap-0.5 ${
              (snapshot.trend === "up" && isGoodWhenUp) || (snapshot.trend === "down" && !isGoodWhenUp)
                ? "text-[#212121]"
                : snapshot.trend === "flat"
                  ? "text-[#9E9E9E]"
                  : "text-[#424242]"
            }`}
          >
            {snapshot.trend === "up" ? (
              <TrendingUp size={10} strokeWidth={3} />
            ) : snapshot.trend === "down" ? (
              <TrendingDown size={10} strokeWidth={3} />
            ) : (
              <Minus size={10} strokeWidth={3} />
            )}
            {Math.abs(snapshot.changePercent)}%
          </span>
        )}
      </div>
      {snapshot.target != null && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[8px] text-[#9E9E9E]">
            <span>Target: {formatMetricValue(snapshot.target, format)}</span>
            <span className={`font-bold ${isOnTrack ? "text-[#212121]" : "text-[#9E9E9E]"}`}>
              {isOnTrack ? "✓ On track" : "✗ Below"}
            </span>
          </div>
          <div className="mt-1 h-1 bg-[#E0E0E0]">
            <div
              className={`h-full ${isOnTrack ? "bg-[#212121]" : "bg-[#9E9E9E]"}`}
              style={{
                width: `${Math.min(100, (snapshot.value / snapshot.target) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AlertBanner({ alerts }: { alerts: MetricAlert[] }) {
  if (alerts.length === 0) return null;

  const critical = alerts.filter((a) => a.severity === "critical");
  const warnings = alerts.filter((a) => a.severity === "warning");

  return (
    <div className="space-y-2">
      {critical.map((a) => (
        <div
          key={a.id}
          className="border-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2"
        >
          <XCircle size={14} strokeWidth={3} className="flex-shrink-0" />
          <span className="text-[10px] font-bold">{a.message}</span>
          <span className="text-[8px] text-[#9E9E9E] ml-auto">
            Value: {a.value} | Threshold: {a.threshold}
          </span>
        </div>
      ))}
      {warnings.map((a) => (
        <div
          key={a.id}
          className="border-[2px] border-black bg-[#F8F8F8] px-4 py-2 flex items-center gap-2"
        >
          <AlertTriangle size={14} strokeWidth={3} className="text-[#424242] flex-shrink-0" />
          <span className="text-[10px] font-bold text-[#424242]">{a.message}</span>
          <span className="text-[8px] text-[#9E9E9E] ml-auto">
            Value: {a.value} | Threshold: {a.threshold}
          </span>
        </div>
      ))}
    </div>
  );
}

function HealthScore({ score }: { score: number }) {
  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Attention" : "Critical";

  return (
    <div className="border-[3px] border-black shadow-[6px_6px_0px_#000] bg-white p-6 text-center">
      <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-2">
        Product Health Score
      </p>
      <div className="inline-flex items-center justify-center w-20 h-20 border-[3px] border-black">
        <span className="text-3xl font-bold text-[#212121]">{score}</span>
      </div>
      <p className="text-xs font-bold text-[#212121] mt-2">{label}</p>
      <div className="mt-3 h-2 bg-[#E0E0E0] border border-black">
        <div
          className="h-full bg-[#212121] transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function SparklineChart({
  data,
  height = 40,
}: {
  data: { date: string; count: number }[];
  height?: number;
}) {
  if (data.length < 2) {
    return <div className="h-10 flex items-center justify-center text-[9px] text-[#9E9E9E]">Not enough data</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const barWidth = Math.max(2, Math.min(8, 200 / data.length));

  return (
    <div className="flex items-end gap-[1px]" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className="bg-[#212121] hover:bg-black transition-colors"
          style={{
            width: barWidth,
            height: `${Math.max(2, (d.count / maxVal) * height)}px`,
          }}
          title={`${d.date}: ${d.count}`}
        />
      ))}
    </div>
  );
}

function FunnelVisualization({
  dropoffs,
}: {
  dropoffs: { stage: string; dropRate: number }[];
}) {
  const stageLabels: Record<string, string> = {
    app_opened: "App Opened",
    login_started: "Login Started",
    otp_verified: "OTP Verified",
    profile_created: "Profile Created",
    profile_completed: "Profile Completed",
    first_like_sent: "First Like Sent",
    first_match: "First Match",
    first_message_sent: "First Message",
    first_message_received: "Reply Received",
    premium_viewed: "Premium Viewed",
    premium_converted: "Converted",
  };

  return (
    <div className="space-y-1">
      {dropoffs.map((d, i) => {
        const widthPct = Math.max(20, 100 - i * 8);
        const isReached = d.dropRate === 0;
        return (
          <div key={d.stage} className="flex items-center gap-2">
            <span className="text-[8px] text-[#9E9E9E] w-24 text-right truncate">
              {stageLabels[d.stage] || d.stage}
            </span>
            <div className="flex-1 h-4 bg-[#F8F8F8] border border-[#E0E0E0] relative">
              <div
                className={`h-full ${isReached ? "bg-[#212121]" : "bg-[#E0E0E0]"}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="text-[8px] font-bold w-8 text-right">
              {isReached ? "✓" : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────

export default function GrowthDashboard() {
  const [period, setPeriod] = useState<MetricPeriod>("30d");
  const [refreshKey, setRefreshKey] = useState(0);

  const report = useMemo(() => generateGrowthReport(period), [period, refreshKey]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} strokeWidth={3} />
            <h1 className="text-sm font-bold uppercase tracking-wider">Growth Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as MetricPeriod)}
                className="appearance-none bg-transparent border-[2px] border-white text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 pr-6 cursor-pointer"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value} className="text-black">
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
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
        {/* Alerts */}
        <AlertBanner alerts={report.alerts} />

        {/* Health Score + AARRR Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <HealthScore score={report.healthScore} />
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-2 gap-3">
            <MetricCard
              title="Signups Today"
              snapshot={report.acquisition.signupsToday}
              format="number"
              icon={Users}
            />
            <MetricCard
              title="Activation Rate"
              snapshot={report.activation.activationRate}
              format="percent"
              icon={Zap}
            />
            <MetricCard
              title="DAU/MAU Ratio"
              snapshot={report.retention.dauMauRatio}
              format="percent"
              icon={RotateCcw}
            />
            <MetricCard
              title="MRR"
              snapshot={report.revenue.mrr}
              format="currency"
              icon={CreditCard}
            />
          </div>
        </div>

        {/* AARRR Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Acquisition */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <Users size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Acquisition</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  title="Total Signups"
                  snapshot={report.acquisition.signupsTotal}
                  format="number"
                  icon={Users}
                />
                <MetricCard
                  title="Organic %"
                  snapshot={report.acquisition.organicPercentage}
                  format="percent"
                  icon={Users}
                />
              </div>
              {/* Source breakdown */}
              <div>
                <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                  Source Breakdown
                </p>
                <div className="space-y-1">
                  {Object.entries(report.acquisition.signupsBySource).map(([src, count]) => (
                    <div key={src} className="flex items-center gap-2">
                      <span className="text-[9px] text-[#424242] w-16 capitalize">{src}</span>
                      <div className="flex-1 h-2 bg-[#F8F8F8] border border-[#E0E0E0]">
                        <div
                          className="h-full bg-[#212121]"
                          style={{
                            width: `${Math.min(100, (count / Math.max(1, report.acquisition.signupsTotal.value)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-bold w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Signup trend */}
              <div>
                <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                  Signup Trend
                </p>
                <SparklineChart data={report.acquisition.signupTrend} />
              </div>
            </div>
          </section>

          {/* Activation */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <Zap size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Activation</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  title="Profile Completion"
                  snapshot={report.activation.profileCompletionRate}
                  format="percent"
                  icon={Zap}
                />
                <MetricCard
                  title="Time to Match"
                  snapshot={report.activation.timeToFirstMatch}
                  format="hours"
                  icon={Zap}
                  isGoodWhenUp={false}
                />
              </div>
              {/* Funnel */}
              <div>
                <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                  Conversion Funnel
                </p>
                <FunnelVisualization dropoffs={report.activation.funnelDropoffs} />
              </div>
            </div>
          </section>

          {/* Retention */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <RotateCcw size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Retention</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <MetricCard title="D1" snapshot={report.retention.day1} format="percent" icon={RotateCcw} />
                <MetricCard title="D7" snapshot={report.retention.day7} format="percent" icon={RotateCcw} />
                <MetricCard title="D30" snapshot={report.retention.day30} format="percent" icon={RotateCcw} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  title="Churn Rate"
                  snapshot={report.retention.churnRate}
                  format="percent"
                  icon={RotateCcw}
                  isGoodWhenUp={false}
                />
                <MetricCard
                  title="Sessions/Week"
                  snapshot={report.retention.sessionFrequency}
                  format="decimal"
                  icon={RotateCcw}
                />
              </div>
              {/* Retention curve */}
              <div>
                <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                  Retention Curve
                </p>
                <div className="flex items-end gap-1 h-10">
                  {report.retention.retentionCurve.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-[#212121]"
                        style={{ height: `${Math.max(2, (d.retained / 100) * 40)}px` }}
                      />
                      <span className="text-[7px] text-[#9E9E9E] mt-0.5">D{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Revenue */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <CreditCard size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Revenue</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MetricCard title="MRR" snapshot={report.revenue.mrr} format="currency" icon={CreditCard} />
                <MetricCard title="ARPU" snapshot={report.revenue.arpu} format="currency" icon={CreditCard} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricCard
                  title="Conversion"
                  snapshot={report.revenue.conversionRate}
                  format="percent"
                  icon={CreditCard}
                />
                <MetricCard title="LTV" snapshot={report.revenue.ltv} format="currency" icon={CreditCard} />
              </div>
              {/* Plan breakdown */}
              {report.revenue.revenueByPlan.length > 0 && (
                <div>
                  <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                    Revenue by Plan
                  </p>
                  {report.revenue.revenueByPlan.map((p) => (
                    <div key={p.plan} className="flex items-center justify-between py-1 border-b border-dashed border-[#E0E0E0] last:border-0">
                      <span className="text-[9px] text-[#424242] capitalize">{p.plan}</span>
                      <span className="text-[9px] font-bold">₹{p.revenue} ({p.users} users)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Referral (full-width) */}
        <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
          <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
            <Share2 size={12} strokeWidth={3} />
            <h2 className="text-[10px] font-bold uppercase tracking-wider">Referral</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                title="K-Factor"
                snapshot={report.referral.viralCoefficient}
                format="decimal"
                icon={Share2}
              />
              <MetricCard
                title="Ref. Conversion"
                snapshot={report.referral.referralConversionRate}
                format="percent"
                icon={Share2}
              />
              <MetricCard
                title="Invites Sent"
                snapshot={report.referral.invitesSent}
                format="number"
                icon={Share2}
              />
              <MetricCard
                title="Invites Converted"
                snapshot={report.referral.invitesConverted}
                format="number"
                icon={Share2}
              />
            </div>
          </div>
        </section>

        {/* Generated timestamp */}
        <p className="text-[8px] text-[#9E9E9E] text-center">
          Generated: {new Date(report.generatedAt).toLocaleString("en-IN")} · Period: {period}
        </p>
      </main>
    </div>
  );
}
