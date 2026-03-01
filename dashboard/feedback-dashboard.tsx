/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Admin Feedback Dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Route: /admin/feedback
 * Shows: All feedback entries, NPS score, top feature requests, sentiment.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo } from "react";
import {
  MessageCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Bug,
  Lightbulb,
  Heart,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ThumbsUp,
} from "lucide-react";

import {
  getFeedback,
  getFeedbackStats,
  updateFeedbackStatus,
  upvoteFeatureRequest,
  type FeedbackEntry,
  type FeedbackStatus,
  type FeedbackType,
} from "@/lib/feedback/feedback-service";

// ─── Helpers ─────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<FeedbackType, typeof Bug> = {
  bug_report: Bug,
  feature_request: Lightbulb,
  testimonial: Heart,
  in_app: MessageCircle,
  nps: Star,
  exit_survey: TrendingDown,
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  in_progress: "In Progress",
  shipped: "Shipped ✓",
  wont_fix: "Won't Fix",
  duplicate: "Duplicate",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-white text-[#212121] border-black",
  neutral: "bg-[#F8F8F8] text-[#9E9E9E] border-[#E0E0E0]",
  negative: "bg-[#212121] text-white border-black",
};

// ─── Feedback Row ────────────────────────────────────────────────────────

function FeedbackRow({
  entry,
  onStatusChange,
  onUpvote,
}: {
  entry: FeedbackEntry;
  onStatusChange: (id: string, status: FeedbackStatus) => void;
  onUpvote: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = TYPE_ICONS[entry.type] || MessageCircle;

  return (
    <div className="border-b-[1px] border-[#E0E0E0] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#F8F8F8] transition-colors"
      >
        <Icon size={12} strokeWidth={2.5} className="text-[#424242] shrink-0" />
        <span className={`px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider border-[1px] ${SENTIMENT_COLORS[entry.sentiment]}`}>
          {entry.sentiment}
        </span>
        {entry.rating !== null && (
          <span className="text-[8px] text-[#424242]">
            {"★".repeat(entry.rating)}{"☆".repeat(5 - entry.rating)}
          </span>
        )}
        {entry.npsScore !== null && (
          <span className="text-[8px] font-bold text-[#212121]">NPS:{entry.npsScore}</span>
        )}
        <span className="text-[9px] text-[#212121] flex-1 truncate">{entry.message}</span>
        {entry.type === "feature_request" && (
          <span className="text-[8px] font-bold text-[#424242]">▲{entry.upvotes}</span>
        )}
        <span className="text-[7px] text-[#E0E0E0]">
          {new Date(entry.createdAt).toLocaleDateString("en-IN")}
        </span>
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-dashed border-[#E0E0E0] bg-[#F8F8F8]">
          <div className="grid grid-cols-3 gap-2 mt-2 text-[8px]">
            <div>
              <span className="text-[#9E9E9E]">User:</span>{" "}
              <span className="font-bold">{entry.userName}</span>
            </div>
            <div>
              <span className="text-[#9E9E9E]">Type:</span>{" "}
              <span className="font-bold">{entry.type}</span>
            </div>
            <div>
              <span className="text-[#9E9E9E]">Screen:</span>{" "}
              <span className="font-bold">{entry.screenPath}</span>
            </div>
          </div>
          <p className="text-[9px] text-[#424242] mt-2 leading-relaxed whitespace-pre-wrap">
            {entry.message}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <select
              value={entry.status}
              onChange={(e) => onStatusChange(entry.id, e.target.value as FeedbackStatus)}
              className="border-[2px] border-black bg-white text-[8px] font-bold px-2 py-1 focus:outline-none"
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {entry.type === "feature_request" && (
              <button
                onClick={() => onUpvote(entry.id)}
                className="flex items-center gap-1 px-2 py-1 border-[1px] border-black text-[8px] font-bold hover:bg-[#212121] hover:text-white transition-colors"
              >
                <ThumbsUp size={8} strokeWidth={3} />
                Upvote ({entry.upvotes})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────

export default function FeedbackDashboard() {
  const [filter, setFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useMemo(() => getFeedbackStats(), [refreshKey]);
  const allFeedback = useMemo(() => getFeedback(), [refreshKey]);

  const filtered = useMemo(() => {
    if (filter === "all") return allFeedback;
    if (filter === "new") return allFeedback.filter((f) => f.status === "new");
    return allFeedback.filter((f) => f.type === filter);
  }, [allFeedback, filter]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleStatusChange = (id: string, status: FeedbackStatus) => {
    updateFeedbackStatus(id, status);
    refresh();
  };

  const handleUpvote = (id: string) => {
    upvoteFeatureRequest(id);
    refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} strokeWidth={3} />
            <h1 className="text-sm font-bold uppercase tracking-wider">Feedback</h1>
          </div>
          <button
            onClick={refresh}
            className="border-[2px] border-white p-1 hover:bg-white hover:text-black transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={12} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total },
            { label: "Avg Rating", value: `${stats.avgRating}/5` },
            { label: "NPS Score", value: stats.npsScore },
            { label: "Positive", value: stats.bySentiment.positive || 0 },
            { label: "New", value: stats.byStatus.new || 0 },
          ].map((s) => (
            <div key={s.label} className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white p-3 text-center">
              <p className="text-lg font-bold text-[#212121]">{s.value}</p>
              <p className="text-[8px] text-[#9E9E9E] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top Feature Requests */}
        {stats.topFeatureRequests.length > 0 && (
          <div className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
            <div className="border-b-[2px] border-black bg-[#F8F8F8] px-4 py-2">
              <p className="text-[10px] font-bold text-[#212121] uppercase tracking-wider flex items-center gap-1">
                <Lightbulb size={10} strokeWidth={3} /> Top Feature Requests
              </p>
            </div>
            <div className="p-4 space-y-2">
              {stats.topFeatureRequests.map((fr, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-[#212121] shrink-0">
                    ▲{fr.upvotes}
                  </span>
                  <p className="text-[9px] text-[#424242]">{fr.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex gap-1.5 flex-wrap">
          {["all", "new", "bug_report", "feature_request", "testimonial", "nps", "exit_survey"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 border-[2px] text-[9px] font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? "border-black bg-[#212121] text-white shadow-[2px_2px_0px_#000]"
                  : "border-[#E0E0E0] bg-white text-[#424242] hover:border-[#9E9E9E]"
              }`}
            >
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Feedback list */}
        <div className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle size={24} strokeWidth={2} className="text-[#E0E0E0] mx-auto mb-2" />
              <p className="text-xs text-[#9E9E9E]">No feedback yet</p>
            </div>
          ) : (
            filtered.map((entry) => (
              <FeedbackRow
                key={entry.id}
                entry={entry}
                onStatusChange={handleStatusChange}
                onUpvote={handleUpvote}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
