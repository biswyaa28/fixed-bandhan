/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — A/B Experiment Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Admin view of all experiments, results, and significance.
 * Route: /admin/experiments
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  TestTube2,
  Play,
  Pause,
  CheckCircle,
  Archive,
  FileEdit,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Flag,
} from "lucide-react";

import { registerExperiments } from "@/lib/experiments/experiment-service";
import { initFeatureFlags, getAllFlags } from "@/lib/experiments/feature-flags";
import {
  getAllExperimentReports,
  getExperimentsSummary,
  type ExperimentReport,
} from "@/lib/experiments/analytics-integration";

import { onboardingExperiments } from "@/experiments/onboarding-variants";
import { pricingExperiments } from "@/experiments/pricing-variants";
import { uiExperiments } from "@/experiments/ui-variants";

// ─── Status helpers ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft: { icon: FileEdit, label: "Draft", bg: "bg-[#F8F8F8]", text: "text-[#9E9E9E]" },
  running: { icon: Play, label: "Running", bg: "bg-[#212121]", text: "text-white" },
  paused: { icon: Pause, label: "Paused", bg: "bg-[#E0E0E0]", text: "text-[#424242]" },
  completed: { icon: CheckCircle, label: "Done", bg: "bg-white", text: "text-[#212121]" },
  archived: { icon: Archive, label: "Archived", bg: "bg-[#F8F8F8]", text: "text-[#9E9E9E]" },
} as const;

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const c = STATUS_CONFIG[status];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border-[2px] border-black text-[8px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      <Icon size={8} strokeWidth={3} />
      {c.label}
    </span>
  );
}

// ─── Experiment Card ─────────────────────────────────────────────────────

function ExperimentCard({ report }: { report: ExperimentReport }) {
  const [open, setOpen] = useState(false);
  const exp = report.experiment;
  const sig = report.significance;

  return (
    <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#F8F8F8] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <StatusBadge status={exp.status} />
            {exp.tags.map((t) => (
              <span key={t} className="text-[7px] font-bold text-[#9E9E9E] uppercase tracking-wider border border-[#E0E0E0] px-1.5 py-0.5">
                {t}
              </span>
            ))}
          </div>
          <p className="text-xs font-bold text-[#212121] truncate">{exp.name}</p>
          <p className="text-[9px] text-[#9E9E9E] truncate">{exp.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick stats */}
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#212121]">{report.totalSample} exposed</p>
            <p className="text-[8px] text-[#9E9E9E]">{report.daysRunning}d running</p>
          </div>
          {/* Significance indicator */}
          {sig && sig.isSignificant ? (
            <div className="w-6 h-6 border-[2px] border-black bg-[#212121] flex items-center justify-center" title="Significant!">
              <TrendingUp size={10} strokeWidth={3} className="text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 border-[2px] border-[#E0E0E0] flex items-center justify-center" title="Not significant">
              <AlertTriangle size={10} strokeWidth={2} className="text-[#E0E0E0]" />
            </div>
          )}
          {open ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 pb-4 border-t-[2px] border-black">
          {/* Hypothesis */}
          <div className="mt-3 p-2 bg-[#F8F8F8] border border-[#E0E0E0]">
            <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-0.5">Hypothesis</p>
            <p className="text-[9px] text-[#424242] leading-relaxed">{exp.hypothesis}</p>
          </div>

          {/* Variant results table */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b-[2px] border-black bg-[#F8F8F8]">
                  <th className="text-left px-2 py-1.5 font-bold text-[#424242] uppercase tracking-wider">Variant</th>
                  <th className="text-right px-2 py-1.5 font-bold text-[#424242] uppercase tracking-wider">Exposed</th>
                  <th className="text-right px-2 py-1.5 font-bold text-[#424242] uppercase tracking-wider">Conversions</th>
                  <th className="text-right px-2 py-1.5 font-bold text-[#424242] uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody>
                {report.results.map((r, i) => (
                  <tr key={r.variantId} className="border-b border-[#E0E0E0] hover:bg-[#F8F8F8]">
                    <td className="px-2 py-1.5">
                      <span className="font-bold text-[#212121]">{r.variantName}</span>
                      {i === 0 && <span className="text-[7px] text-[#9E9E9E] ml-1">(control)</span>}
                      {sig?.winner === r.variantId && (
                        <span className="ml-1 text-[7px] font-bold border-[1px] border-black px-1">WINNER</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-right text-[#424242]">{r.exposures}</td>
                    <td className="px-2 py-1.5 text-right text-[#424242]">{r.conversions}</td>
                    <td className="px-2 py-1.5 text-right font-bold text-[#212121]">{r.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Significance result */}
          {sig && (
            <div className={`mt-3 p-2 border-[2px] ${sig.isSignificant ? "border-black bg-[#F8F8F8]" : "border-[#E0E0E0] bg-white"}`}>
              <p className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Statistical Analysis</p>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <div>
                  <p className="text-[7px] text-[#9E9E9E]">Confidence</p>
                  <p className="text-[10px] font-bold text-[#212121]">{(sig.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[7px] text-[#9E9E9E]">p-value</p>
                  <p className="text-[10px] font-bold text-[#212121]">{sig.pValue.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-[7px] text-[#9E9E9E]">Lift</p>
                  <p className="text-[10px] font-bold text-[#212121]">{sig.lift > 0 ? "+" : ""}{sig.lift.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[7px] text-[#9E9E9E]">Winner</p>
                  <p className="text-[10px] font-bold text-[#212121]">{sig.winner || "—"}</p>
                </div>
              </div>
              <p className="text-[9px] text-[#424242] leading-relaxed">{sig.recommendation}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="mt-3 flex items-center gap-4 text-[8px] text-[#9E9E9E]">
            <span>Owner: {exp.owner}</span>
            <span>Metric: {exp.primaryMetric}</span>
            <span>Min sample: {exp.minSamplePerVariant}/variant</span>
            <span>Started: {exp.startDate}</span>
            {!report.isReady && <span className="font-bold text-[#212121]">⏳ Needs more data</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feature Flag Row ────────────────────────────────────────────────────

function FlagRow({ flag }: { flag: { id: string; name: string; description: string; rolloutPercent: number; audience: string; enabled: boolean } }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dashed border-[#E0E0E0] last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 border-[2px] border-black ${flag.enabled ? "bg-[#212121]" : "bg-white"}`} />
        <div>
          <p className="text-[9px] font-bold text-[#212121]">{flag.name}</p>
          <p className="text-[8px] text-[#9E9E9E]">{flag.description}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-[9px] font-bold ${flag.enabled ? "text-[#212121]" : "text-[#9E9E9E]"}`}>
          {flag.enabled ? `${flag.rolloutPercent}%` : "OFF"}
        </p>
        <p className="text-[7px] text-[#E0E0E0]">{flag.audience}</p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────

export default function ExperimentDashboard() {
  const [filter, setFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize experiments on mount
  useEffect(() => {
    registerExperiments([...onboardingExperiments, ...pricingExperiments, ...uiExperiments]);
    initFeatureFlags();
  }, []);

  const reports = useMemo(() => getAllExperimentReports(), [refreshKey]);
  const summary = useMemo(() => getExperimentsSummary(), [refreshKey]);
  const flags = useMemo(() => getAllFlags(), [refreshKey]);

  const filtered = filter === "all"
    ? reports
    : reports.filter((r) => r.experiment.status === filter || r.experiment.tags.includes(filter));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube2 size={16} strokeWidth={3} />
            <h1 className="text-sm font-bold uppercase tracking-wider">A/B Experiments</h1>
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

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: summary.total },
            { label: "Running", value: summary.running },
            { label: "Completed", value: summary.completed },
            { label: "Significant Wins", value: summary.significantWins },
            { label: "Exposures", value: summary.totalExposures },
          ].map((s) => (
            <div key={s.label} className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-3 text-center">
              <p className="text-lg font-bold text-[#212121]">{s.value}</p>
              <p className="text-[8px] text-[#9E9E9E] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex gap-1.5 flex-wrap">
          {["all", "running", "completed", "draft", "onboarding", "pricing", "ui"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 border-[2px] text-[9px] font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? "border-black bg-[#212121] text-white shadow-[2px_2px_0px_#000]"
                  : "border-[#E0E0E0] bg-white text-[#424242] hover:border-[#9E9E9E]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Experiment list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="border-[2px] border-dashed border-[#E0E0E0] p-8 text-center">
              <TestTube2 size={24} strokeWidth={2} className="text-[#E0E0E0] mx-auto mb-2" />
              <p className="text-xs text-[#9E9E9E]">No experiments match this filter</p>
            </div>
          ) : (
            filtered.map((r) => <ExperimentCard key={r.experiment.id} report={r} />)
          )}
        </div>

        {/* Feature Flags section */}
        <section className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
          <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2 flex items-center gap-2">
            <Flag size={12} strokeWidth={3} />
            <h2 className="text-[10px] font-bold uppercase tracking-wider">Feature Flags</h2>
          </div>
          <div className="p-4">
            {flags.map((f) => <FlagRow key={f.id} flag={f} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
