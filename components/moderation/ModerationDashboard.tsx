/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Moderation Dashboard (Admin Panel)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Admin-only interface for reviewing reports, managing strikes, and
 * monitoring the moderation queue.
 *
 * SECTIONS:
 *   1. Queue Overview — Pending reports sorted by priority
 *   2. Report Detail — Full report with evidence & user context
 *   3. Action Panel — Dismiss, warn, restrict, suspend, ban
 *   4. Appeal Queue — Pending appeals from banned/restricted users
 *   5. Stats Dashboard — Moderation volume, resolution times, categories
 *
 * ACCESS: Requires admin role (checked in parent layout).
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Eye,
  Ban,
  Undo2,
  Filter,
  BarChart3,
  MessageSquare,
  User,
} from "lucide-react";
import type { ReportReason, ReportStatus } from "@/lib/firebase/schema";
import {
  type EnforcementAction,
  type Appeal,
  getReportReasonLabel,
  getEnforcementMessage,
} from "@/lib/moderation/report-handler";

// ─── Types ───────────────────────────────────────────────────────────────

interface ReportItem {
  id: string;
  reporterName: string;
  reportedUserName: string;
  reportedUserId: string;
  reason: ReportReason;
  comment: string | null;
  status: ReportStatus;
  priority: number;
  reportedUserStrikeCount: number;
  createdAt: string;
}

interface DashboardStats {
  pending: number;
  reviewingToday: number;
  resolvedToday: number;
  dismissedToday: number;
  avgResolutionHours: number;
  topReason: ReportReason;
  appealsCount: number;
}

type Tab = "queue" | "appeals" | "stats";

// ─── Mock data (replace with Firestore queries in production) ────────────

const MOCK_REPORTS: ReportItem[] = [
  {
    id: "RPT_001",
    reporterName: "Priya",
    reportedUserName: "Unknown User",
    reportedUserId: "uid_001",
    reason: "harassment",
    comment: "Sending repeated threatening messages after I unmatched",
    status: "pending",
    priority: 90,
    reportedUserStrikeCount: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "RPT_002",
    reporterName: "Anjali",
    reportedUserName: "Suspicious Account",
    reportedUserId: "uid_002",
    reason: "fake-profile",
    comment: "Photos are from a Bollywood actor",
    status: "pending",
    priority: 60,
    reportedUserStrikeCount: 0,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "RPT_003",
    reporterName: "Rohan",
    reportedUserName: "Scam Account",
    reportedUserId: "uid_003",
    reason: "scam",
    comment: "Asking for money transfer to help with 'medical emergency'",
    status: "pending",
    priority: 70,
    reportedUserStrikeCount: 2,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "RPT_004",
    reporterName: "Vikram",
    reportedUserName: "User456",
    reportedUserId: "uid_004",
    reason: "inappropriate-content",
    comment: null,
    status: "reviewing",
    priority: 50,
    reportedUserStrikeCount: 0,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_APPEALS: Appeal[] = [
  {
    id: "APL_001",
    userId: "uid_005",
    strikeId: "STR_001",
    message:
      "I was banned for using the word 'die' but I said 'die-hard fan of Shah Rukh Khan'. This was a false positive. Please review my message history.",
    status: "pending",
    moderatorResponse: null,
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    resolvedBy: null,
  },
];

const MOCK_STATS: DashboardStats = {
  pending: 12,
  reviewingToday: 5,
  resolvedToday: 23,
  dismissedToday: 8,
  avgResolutionHours: 14,
  topReason: "harassment",
  appealsCount: 3,
};

// ─── Component ───────────────────────────────────────────────────────────

export function ModerationDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("queue");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("pending");
  const [actionConfirm, setActionConfirm] = useState<EnforcementAction | null>(null);

  const filteredReports = useMemo(() => {
    const reports =
      filterStatus === "all"
        ? MOCK_REPORTS
        : MOCK_REPORTS.filter((r) => r.status === filterStatus);
    return reports.sort((a, b) => b.priority - a.priority);
  }, [filterStatus]);

  const stats = MOCK_STATS;

  function formatTimeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(ms / (1000 * 60))}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function handleResolveReport(action: EnforcementAction) {
    if (!selectedReport) return;
    // In production: update Firestore report status, apply strike/ban, log action
    setActionConfirm(action);
    setTimeout(() => {
      setActionConfirm(null);
      setSelectedReport(null);
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-white text-[#212121]">
      {/* ── Header ── */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield size={24} strokeWidth={3} />
            <div>
              <h1 className="text-base font-bold uppercase tracking-wider">
                Moderation Dashboard
              </h1>
              <p className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">
                Bandhan AI Admin Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="border-[2px] border-white px-3 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {stats.pending} Pending
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Pending", value: stats.pending, icon: Clock },
            { label: "Resolved Today", value: stats.resolvedToday, icon: CheckCircle2 },
            { label: "Avg Resolution", value: `${stats.avgResolutionHours}h`, icon: BarChart3 },
            { label: "Appeals", value: stats.appealsCount, icon: MessageSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="border-[2px] border-black shadow-[4px_4px_0px_#000] p-4 bg-[#F8F8F8]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} strokeWidth={3} className="text-[#9E9E9E]" />
                <span className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p className="text-2xl font-bold text-black">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b-[3px] border-black mb-6">
          {(
            [
              { id: "queue", label: "Report Queue", count: stats.pending },
              { id: "appeals", label: "Appeals", count: stats.appealsCount },
              { id: "stats", label: "Statistics", count: null },
            ] as { id: Tab; label: string; count: number | null }[]
          ).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-[2px] border-b-0 border-black -mb-[3px] ${
                activeTab === id ? "bg-black text-white" : "bg-white text-black hover:bg-[#F8F8F8]"
              }`}
            >
              {label}
              {count !== null && (
                <span className="ml-2 inline-block min-w-[16px] text-center border-[1px] border-current px-1 text-[8px]">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Queue Tab ── */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report List */}
            <div className="lg:col-span-2 space-y-3">
              {/* Filter */}
              <div className="flex items-center gap-2 mb-4">
                <Filter size={14} strokeWidth={3} className="text-[#9E9E9E]" />
                {(["all", "pending", "reviewing", "resolved", "dismissed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 border-[2px] border-black ${
                      filterStatus === s ? "bg-black text-white" : "hover:bg-[#F8F8F8]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {filteredReports.length === 0 ? (
                <div className="border-[2px] border-dashed border-[#E0E0E0] p-8 text-center">
                  <CheckCircle2 size={32} strokeWidth={2} className="text-[#E0E0E0] mx-auto mb-2" />
                  <p className="text-xs text-[#9E9E9E]">No reports in this category</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left border-[2px] border-black p-4 shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all ${
                      selectedReport?.id === report.id ? "bg-[#212121] text-white" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 border-[1px] ${
                            selectedReport?.id === report.id ? "border-white" : "border-black"
                          }`}
                        >
                          P{report.priority}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {getReportReasonLabel(report.reason)}
                        </span>
                      </div>
                      <span className={`text-[9px] ${selectedReport?.id === report.id ? "text-[#9E9E9E]" : "text-[#9E9E9E]"}`}>
                        {formatTimeAgo(report.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-70 truncate">
                      {report.comment || "No details provided"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] opacity-50">
                        Reported by {report.reporterName} · {report.reportedUserStrikeCount} prior strikes
                      </span>
                      <ChevronRight size={12} strokeWidth={3} className="opacity-50" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Report Detail */}
            <div className="lg:col-span-1">
              {selectedReport ? (
                <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-[#F8F8F8] sticky top-6">
                  {/* Detail Header */}
                  <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Report Detail
                    </h3>
                    <p className="text-[9px] text-[#9E9E9E]">{selectedReport.id}</p>
                  </div>

                  {/* Detail Content */}
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                        Reported User
                      </p>
                      <div className="flex items-center gap-2">
                        <User size={14} strokeWidth={2.5} />
                        <span className="text-xs font-bold">{selectedReport.reportedUserName}</span>
                        {selectedReport.reportedUserStrikeCount > 0 && (
                          <span className="text-[8px] font-bold bg-black text-white px-1.5 py-0.5">
                            {selectedReport.reportedUserStrikeCount} strikes
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                        Reason
                      </p>
                      <p className="text-xs font-bold">
                        {getReportReasonLabel(selectedReport.reason)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                        Details
                      </p>
                      <p className="text-[11px] text-[#424242]">
                        {selectedReport.comment || "No details provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                        Reported By
                      </p>
                      <p className="text-xs">{selectedReport.reporterName}</p>
                    </div>

                    {/* Action Confirmation */}
                    {actionConfirm && (
                      <div className="border-[2px] border-black bg-white p-3 text-center">
                        <CheckCircle2 size={20} strokeWidth={3} className="text-black mx-auto mb-1" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">
                          {getEnforcementMessage(actionConfirm).title} Applied
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!actionConfirm && (
                      <div className="space-y-2 pt-2 border-t-[2px] border-dashed border-black">
                        <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
                          Take Action
                        </p>

                        <button
                          onClick={() => handleResolveReport("none")}
                          className="w-full text-left flex items-center gap-2 border-[2px] border-black p-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                        >
                          <XCircle size={12} strokeWidth={3} />
                          Dismiss (No Violation)
                        </button>

                        <button
                          onClick={() => handleResolveReport("warn")}
                          className="w-full text-left flex items-center gap-2 border-[2px] border-black p-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                        >
                          <AlertTriangle size={12} strokeWidth={3} />
                          Warn User (+1 Strike)
                        </button>

                        <button
                          onClick={() => handleResolveReport("content_removed")}
                          className="w-full text-left flex items-center gap-2 border-[2px] border-black p-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                        >
                          <Eye size={12} strokeWidth={3} />
                          Remove Content
                        </button>

                        <button
                          onClick={() => handleResolveReport("restrict_48h")}
                          className="w-full text-left flex items-center gap-2 border-[2px] border-black bg-[#212121] text-white p-2 text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors"
                        >
                          <Clock size={12} strokeWidth={3} />
                          Restrict 48h (+1 Strike)
                        </button>

                        <button
                          onClick={() => handleResolveReport("permanent_ban")}
                          className="w-full text-left flex items-center gap-2 border-[3px] border-black bg-black text-white p-2 text-[10px] font-bold uppercase tracking-wider shadow-[4px_4px_0px_#424242] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#424242] transition-all"
                        >
                          <Ban size={12} strokeWidth={3} />
                          Permanent Ban
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-[2px] border-dashed border-[#E0E0E0] p-8 text-center">
                  <Eye size={24} strokeWidth={2} className="text-[#E0E0E0] mx-auto mb-2" />
                  <p className="text-[10px] text-[#9E9E9E]">
                    Select a report to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Appeals Tab ── */}
        {activeTab === "appeals" && (
          <div className="space-y-4">
            {MOCK_APPEALS.length === 0 ? (
              <div className="border-[2px] border-dashed border-[#E0E0E0] p-12 text-center">
                <CheckCircle2 size={32} strokeWidth={2} className="text-[#E0E0E0] mx-auto mb-2" />
                <p className="text-xs text-[#9E9E9E]">No pending appeals</p>
              </div>
            ) : (
              MOCK_APPEALS.map((appeal) => (
                <div
                  key={appeal.id}
                  className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
                        {appeal.id} · {formatTimeAgo(appeal.submittedAt)}
                      </span>
                      <h3 className="text-xs font-bold text-black mt-1">
                        Appeal for Strike {appeal.strikeId}
                      </h3>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 border-[2px] border-black">
                      {appeal.status}
                    </span>
                  </div>

                  <div className="border-[2px] border-dashed border-[#E0E0E0] p-3 mb-4">
                    <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                      User&apos;s Appeal
                    </p>
                    <p className="text-xs text-[#424242] leading-relaxed">{appeal.message}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 border-[2px] border-black px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors">
                      <Undo2 size={10} strokeWidth={3} className="inline mr-1" />
                      Approve (Remove Strike)
                    </button>
                    <button className="flex-1 border-[2px] border-black bg-[#212121] text-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors">
                      <XCircle size={10} strokeWidth={3} className="inline mr-1" />
                      Deny Appeal
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Stats Tab ── */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Reports This Week", value: "47", change: "+12%" },
                { label: "Resolution Rate", value: "94%", change: "+3%" },
                { label: "Avg Resolution Time", value: "14h", change: "-2h" },
                { label: "False Positive Rate", value: "8%", change: "-1%" },
                { label: "Repeat Offenders", value: "6", change: "same" },
                { label: "Active Bans", value: "3", change: "+1" },
              ].map(({ label, value, change }) => (
                <div
                  key={label}
                  className="border-[2px] border-black shadow-[4px_4px_0px_#000] p-4 bg-[#F8F8F8]"
                >
                  <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-black mt-1">{value}</p>
                  <p className="text-[9px] text-[#9E9E9E] mt-1">{change} vs last week</p>
                </div>
              ))}
            </div>

            {/* Reason breakdown */}
            <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b-[2px] border-black pb-2 mb-4">
                Reports by Category (This Week)
              </h3>
              <div className="space-y-3">
                {[
                  { reason: "Harassment", count: 15, pct: 32 },
                  { reason: "Fake Profile", count: 11, pct: 23 },
                  { reason: "Scam / Fraud", count: 8, pct: 17 },
                  { reason: "Inappropriate", count: 7, pct: 15 },
                  { reason: "Spam", count: 4, pct: 8 },
                  { reason: "Other", count: 2, pct: 5 },
                ].map(({ reason, count, pct }) => (
                  <div key={reason} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold w-28 text-right">{reason}</span>
                    <div className="flex-1 h-4 border-[2px] border-black">
                      <div
                        className="h-full bg-black"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold w-10">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModerationDashboard;
