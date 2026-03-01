/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — User Behavior Analytics Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Deep-dives into individual user behavior:
 *   • Session patterns (when, how often, how long)
 *   • Feature usage heatmap
 *   • User lifecycle stage distribution
 *   • Cohort analysis (simplified)
 *   • A/B test results
 *   • Top user actions
 *
 * Comic book aesthetic. Monochromatic. Hard shadows.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo } from "react";
import {
  User,
  Clock,
  MousePointerClick,
  BarChart3,
  Layers,
  TestTube2,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  getAllEvents,
  getEventsByName,
  getRetentionRates,
  getDAUMAURatio,
  getChurnStatus,
  getFunnelProgress,
  type AnalyticsEvent,
} from "@/lib/analytics";

// ─── Helpers ─────────────────────────────────────────────────────────────

function groupByHour(events: AnalyticsEvent[]): Record<number, number> {
  const byHour: Record<number, number> = {};
  for (let h = 0; h < 24; h++) byHour[h] = 0;
  events.forEach((e) => {
    const hour = new Date(e.event_timestamp).getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;
  });
  return byHour;
}

function groupByDayOfWeek(events: AnalyticsEvent[]): Record<string, number> {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byDay: Record<string, number> = {};
  days.forEach((d) => (byDay[d] = 0));
  events.forEach((e) => {
    const day = days[new Date(e.event_timestamp).getDay()];
    byDay[day] = (byDay[day] || 0) + 1;
  });
  return byDay;
}

function topNEvents(events: AnalyticsEvent[], n: number): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.event_name] = (counts[e.event_name] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

const FEATURE_LABELS: Record<string, string> = {
  interest_sent: "Send Like",
  message_sent: "Send Message",
  profile_viewed: "View Profile",
  voice_note_recorded: "Voice Note",
  safety_button_pressed: "Safety Button",
  daily_limit_reached: "Hit Daily Limit",
  upsell_modal_shown: "Upsell Shown",
  upgrade_cta_clicked: "Upgrade Clicked",
  match_created: "Match Created",
  profile_updated: "Profile Updated",
  discovery_feed_loaded: "Discovery Feed",
  premium_converted: "Converted to Premium",
};

// ─── Sub-Components ──────────────────────────────────────────────────────

function HeatmapGrid({
  title,
  data,
}: {
  title: string;
  data: Record<string | number, number>;
}) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div>
      <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
        {title}
      </p>
      <div className="flex gap-[2px] flex-wrap">
        {entries.map(([key, val]) => {
          const intensity = Math.round((val / max) * 100);
          const bg =
            intensity > 80
              ? "bg-[#212121]"
              : intensity > 60
                ? "bg-[#424242]"
                : intensity > 40
                  ? "bg-[#9E9E9E]"
                  : intensity > 20
                    ? "bg-[#E0E0E0]"
                    : "bg-[#F8F8F8]";
          return (
            <div key={key} className="text-center" title={`${key}: ${val}`}>
              <div
                className={`w-5 h-5 border border-[#E0E0E0] ${bg}`}
              />
              <span className="text-[6px] text-[#9E9E9E] block mt-0.5">{key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureUsageTable({ events }: { events: AnalyticsEvent[] }) {
  const top = topNEvents(events, 12);
  const maxCount = Math.max(...top.map((t) => t.count), 1);

  return (
    <div className="space-y-1">
      {top.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className="text-[9px] text-[#424242] w-28 truncate">
            {FEATURE_LABELS[item.name] || item.name}
          </span>
          <div className="flex-1 h-3 bg-[#F8F8F8] border border-[#E0E0E0]">
            <div
              className="h-full bg-[#212121]"
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-[#212121] w-6 text-right">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function LifecycleDistribution() {
  const funnel = getFunnelProgress();
  const churn = getChurnStatus();
  const retention = getRetentionRates();

  const stages = [
    { label: "New (< 1 day)", active: retention.daysSinceSignup < 1 },
    { label: "Activated", active: funnel.stages.some((s) => s.stage === "first_like_sent") },
    { label: "Engaged", active: churn.status === "active" && retention.totalActiveDays > 3 },
    { label: "Retained", active: retention.day7 },
    { label: "At Risk", active: churn.status === "at-risk" },
    { label: "Churned", active: churn.status === "churned" },
    { label: "Paying", active: funnel.stages.some((s) => s.stage === "premium_converted") },
  ];

  return (
    <div className="space-y-1">
      {stages.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <div
            className={`w-3 h-3 border border-black ${
              s.active ? "bg-[#212121]" : "bg-white"
            }`}
          />
          <span
            className={`text-[9px] ${
              s.active ? "font-bold text-[#212121]" : "text-[#9E9E9E]"
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ABTestResults({ events }: { events: AnalyticsEvent[] }) {
  const abEvents = events.filter((e) => e.event_name === "ab_test_exposure");
  if (abEvents.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-[10px] text-[#9E9E9E]">No A/B tests running</p>
        <p className="text-[8px] text-[#E0E0E0] mt-1">
          Track with: trackABTestExposure(testId, variant)
        </p>
      </div>
    );
  }

  // Group by test ID
  const byTest: Record<string, Record<string, number>> = {};
  abEvents.forEach((e) => {
    const props = e.properties as Record<string, any>;
    const testId = props?.test_id || "unknown";
    const variant = props?.variant || "control";
    if (!byTest[testId]) byTest[testId] = {};
    byTest[testId][variant] = (byTest[testId][variant] || 0) + 1;
  });

  return (
    <div className="space-y-3">
      {Object.entries(byTest).map(([testId, variants]) => (
        <div key={testId} className="border border-[#E0E0E0] p-2">
          <p className="text-[9px] font-bold text-[#212121] mb-1">{testId}</p>
          <div className="space-y-1">
            {Object.entries(variants).map(([variant, count]) => (
              <div key={variant} className="flex items-center justify-between">
                <span className="text-[8px] text-[#424242]">{variant}</span>
                <span className="text-[8px] font-bold">{count} exposures</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function UserDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allEvents = useMemo(() => getAllEvents(), [refreshKey]);

  const retention = getRetentionRates();
  const dauMau = getDAUMAURatio();
  const churn = getChurnStatus();

  const sessionEvents = allEvents.filter((e) => e.event_name === "daily_active_session");
  const hourData = groupByHour(allEvents);
  const dayData = groupByDayOfWeek(allEvents);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={16} strokeWidth={3} />
            <h1 className="text-sm font-bold uppercase tracking-wider">User Analytics</h1>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="border-[2px] border-white p-1 hover:bg-white hover:text-black transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={12} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Events", value: String(allEvents.length), icon: Activity },
            { label: "Active Days", value: String(retention.totalActiveDays), icon: Clock },
            { label: "DAU/MAU", value: `${dauMau.stickiness}%`, icon: BarChart3 },
            { label: "Churn Status", value: churn.status, icon: User },
            { label: "Days Since Signup", value: String(retention.daysSinceSignup), icon: Clock },
          ].map((s) => (
            <div
              key={s.label}
              className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-3 text-center"
            >
              <s.icon size={14} strokeWidth={2.5} className="text-[#9E9E9E] mx-auto mb-1" />
              <p className="text-sm font-bold text-[#212121]">{s.value}</p>
              <p className="text-[8px] text-[#9E9E9E] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Patterns */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <Clock size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Session Patterns</h2>
            </div>
            <div className="p-4 space-y-4">
              <HeatmapGrid title="Activity by Hour (IST)" data={hourData} />
              <HeatmapGrid title="Activity by Day" data={dayData} />
            </div>
          </section>

          {/* Feature Usage */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <MousePointerClick size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">Feature Usage</h2>
            </div>
            <div className="p-4">
              <FeatureUsageTable events={allEvents} />
            </div>
          </section>

          {/* Lifecycle Stage */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <Layers size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">User Lifecycle</h2>
            </div>
            <div className="p-4">
              <LifecycleDistribution />
            </div>
          </section>

          {/* A/B Tests */}
          <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
              <TestTube2 size={12} strokeWidth={3} />
              <h2 className="text-[10px] font-bold uppercase tracking-wider">A/B Tests</h2>
            </div>
            <div className="p-4">
              <ABTestResults events={allEvents} />
            </div>
          </section>
        </div>

        {/* Raw events table */}
        <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
          <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
            <Activity size={12} strokeWidth={3} />
            <h2 className="text-[10px] font-bold uppercase tracking-wider">
              Recent Events (Last 20)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b-[2px] border-black bg-[#F8F8F8]">
                  <th className="text-left px-3 py-2 font-bold text-[#424242] uppercase tracking-wider">
                    Event
                  </th>
                  <th className="text-left px-3 py-2 font-bold text-[#424242] uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-3 py-2 font-bold text-[#424242] uppercase tracking-wider">
                    Properties
                  </th>
                </tr>
              </thead>
              <tbody>
                {allEvents
                  .slice(-20)
                  .reverse()
                  .map((e, i) => (
                    <tr key={i} className="border-b border-[#E0E0E0] hover:bg-[#F8F8F8]">
                      <td className="px-3 py-1.5 font-bold text-[#212121]">
                        {FEATURE_LABELS[e.event_name] || e.event_name}
                      </td>
                      <td className="px-3 py-1.5 text-[#9E9E9E]">
                        {new Date(e.event_timestamp).toLocaleTimeString("en-IN")}
                      </td>
                      <td className="px-3 py-1.5 text-[#9E9E9E] max-w-[200px] truncate">
                        {e.properties ? JSON.stringify(e.properties) : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
