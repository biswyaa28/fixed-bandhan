/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Moderation Dashboard (Admin)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Route: /admin/moderation
 * Shows: Pending reports, ban queue, content review, moderation stats.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  UserX,
  CheckCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  Ban,
  Undo2,
} from "lucide-react";

import {
  getTickets,
  getTicketStats,
  updateTicketStatus,
  assignTicket,
  type SupportTicket,
  type TicketStats,
} from "@/support/ticketing-system";

import {
  getModeratedUsers,
  issueStrike,
  unbanUser,
  resolveAppeal,
  type UserBanRecord,
} from "@/support/ban-system";

// ─── Helpers ─────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-[#212121] text-white",
  high: "bg-[#424242] text-white",
  medium: "bg-[#E0E0E0] text-[#212121]",
  low: "bg-[#F8F8F8] text-[#9E9E9E]",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_user: "Waiting User",
  resolved: "Resolved",
  closed: "Closed",
};

// ─── Ticket Row ──────────────────────────────────────────────────────────

function TicketRow({
  ticket,
  onResolve,
}: {
  ticket: SupportTicket;
  onResolve: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b-[1px] border-[#E0E0E0] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#F8F8F8] transition-colors"
      >
        <span className={`px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider border-[1px] border-black ${PRIORITY_COLORS[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span className="text-[9px] text-[#9E9E9E] font-mono">{ticket.id}</span>
        <span className="text-[9px] font-bold text-[#212121] flex-1 truncate">{ticket.subject}</span>
        <span className="text-[8px] text-[#9E9E9E]">{STATUS_LABELS[ticket.status]}</span>
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-dashed border-[#E0E0E0] bg-[#F8F8F8]">
          <div className="grid grid-cols-2 gap-2 mt-2 text-[8px]">
            <div>
              <span className="text-[#9E9E9E]">User:</span>{" "}
              <span className="font-bold text-[#212121]">{ticket.userName}</span>
            </div>
            <div>
              <span className="text-[#9E9E9E]">Category:</span>{" "}
              <span className="font-bold text-[#212121]">{ticket.category}</span>
            </div>
            <div>
              <span className="text-[#9E9E9E]">Created:</span>{" "}
              <span className="text-[#424242]">{new Date(ticket.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
            <div>
              <span className="text-[#9E9E9E]">Responses:</span>{" "}
              <span className="text-[#424242]">{ticket.responses.length}</span>
            </div>
          </div>
          <p className="text-[9px] text-[#424242] mt-2 leading-relaxed">{ticket.description}</p>
          <div className="flex gap-2 mt-2">
            {ticket.status !== "resolved" && ticket.status !== "closed" && (
              <button
                onClick={() => onResolve(ticket.id)}
                className="px-2 py-1 border-[2px] border-black text-[8px] font-bold bg-white hover:bg-[#212121] hover:text-white transition-colors"
              >
                ✓ Mark Resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ban Record Row ──────────────────────────────────────────────────────

function BanRow({
  record,
  onUnban,
  onApproveAppeal,
  onDenyAppeal,
}: {
  record: UserBanRecord;
  onUnban: (id: string) => void;
  onApproveAppeal: (id: string) => void;
  onDenyAppeal: (id: string) => void;
}) {
  const statusLabel = {
    active: "Active",
    warned: "Warned",
    suspended: "Suspended",
    banned: "Banned",
  }[record.status];

  return (
    <div className="border-b-[1px] border-[#E0E0E0] px-3 py-2 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 border-[1px] border-black ${record.status === "banned" ? "bg-[#212121]" : record.status === "suspended" ? "bg-[#9E9E9E]" : "bg-white"}`} />
        <span className="text-[9px] font-bold text-[#212121] flex-1">{record.userId}</span>
        <span className="text-[8px] font-bold text-[#424242]">{statusLabel}</span>
        <span className="text-[8px] text-[#9E9E9E]">{record.strikes.length} strike(s)</span>
      </div>

      {record.strikes.length > 0 && (
        <p className="text-[8px] text-[#9E9E9E] mt-1">
          Latest: {record.strikes[record.strikes.length - 1].reason} — {record.strikes[record.strikes.length - 1].description}
        </p>
      )}

      {record.appealStatus === "pending" && (
        <div className="mt-2 p-2 border-[1px] border-black bg-white">
          <p className="text-[8px] font-bold text-[#212121] mb-1">⚠️ Appeal Pending</p>
          <p className="text-[8px] text-[#424242]">{record.appealMessage}</p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onApproveAppeal(record.userId)}
              className="px-2 py-0.5 border-[1px] border-black text-[7px] font-bold hover:bg-[#212121] hover:text-white transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onDenyAppeal(record.userId)}
              className="px-2 py-0.5 border-[1px] border-[#9E9E9E] text-[7px] font-bold text-[#9E9E9E] hover:border-black hover:text-[#212121] transition-colors"
            >
              Deny
            </button>
          </div>
        </div>
      )}

      {(record.status === "banned" || record.status === "suspended") && record.appealStatus !== "pending" && (
        <button
          onClick={() => onUnban(record.userId)}
          className="mt-1 flex items-center gap-1 text-[8px] text-[#9E9E9E] hover:text-[#212121] transition-colors"
        >
          <Undo2 size={8} strokeWidth={3} /> Unban
        </button>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────

export default function ModerationDashboard() {
  const [tab, setTab] = useState<"tickets" | "bans">("tickets");
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useMemo(() => getTicketStats(), [refreshKey]);
  const safetyTickets = useMemo(
    () => getTickets({ category: "safety" }),
    [refreshKey],
  );
  const openTickets = useMemo(
    () => getTickets({ status: "open" }),
    [refreshKey],
  );
  const allTickets = useMemo(() => getTickets(), [refreshKey]);
  const bannedUsers = useMemo(() => getModeratedUsers(), [refreshKey]);
  const pendingAppeals = useMemo(
    () => bannedUsers.filter((r) => r.appealStatus === "pending"),
    [bannedUsers],
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleResolve = (id: string) => {
    updateTicketStatus(id, "resolved");
    refresh();
  };

  const handleUnban = (userId: string) => {
    unbanUser(userId);
    refresh();
  };

  const handleApproveAppeal = (userId: string) => {
    resolveAppeal(userId, true, "admin");
    refresh();
  };

  const handleDenyAppeal = (userId: string) => {
    resolveAppeal(userId, false, "admin");
    refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} strokeWidth={3} />
            <h1 className="text-sm font-bold uppercase tracking-wider">Moderation</h1>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: MessageSquare, label: "Open Tickets", value: stats.open, highlight: stats.open > 0 },
            { icon: AlertTriangle, label: "Safety Reports", value: safetyTickets.length, highlight: safetyTickets.length > 0 },
            { icon: Ban, label: "Banned Users", value: bannedUsers.filter((r) => r.status === "banned").length, highlight: false },
            { icon: Clock, label: "Pending Appeals", value: pendingAppeals.length, highlight: pendingAppeals.length > 0 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`border-[2px] border-black shadow-[4px_4px_0px_#000] p-3 text-center ${s.highlight ? "bg-[#212121] text-white" : "bg-white"}`}
              >
                <Icon size={16} strokeWidth={2.5} className={`mx-auto mb-1 ${s.highlight ? "text-white" : "text-[#424242]"}`} />
                <p className="text-lg font-bold">{s.value}</p>
                <p className={`text-[8px] uppercase tracking-wider ${s.highlight ? "text-[#9E9E9E]" : "text-[#9E9E9E]"}`}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* SLA stats */}
        <div className="border-[2px] border-[#E0E0E0] p-3 flex items-center justify-between">
          <div className="text-[9px]">
            <span className="text-[#9E9E9E]">Avg response time:</span>{" "}
            <span className="font-bold text-[#212121]">{stats.avgResponseTimeHours}h</span>
            <span className="text-[#9E9E9E] ml-3">Avg resolution:</span>{" "}
            <span className="font-bold text-[#212121]">{stats.avgResolutionTimeHours}h</span>
          </div>
          <div className="text-[9px]">
            <span className="text-[#9E9E9E]">Total tickets:</span>{" "}
            <span className="font-bold text-[#212121]">{stats.total}</span>
            <span className="text-[#9E9E9E] ml-3">Resolved:</span>{" "}
            <span className="font-bold text-[#212121]">{stats.resolved}</span>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex border-[2px] border-black">
          {(["tickets", "bans"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                tab === t ? "bg-[#212121] text-white" : "bg-white text-[#424242] hover:bg-[#F8F8F8]"
              }`}
            >
              {t === "tickets" ? `Tickets (${allTickets.length})` : `Bans (${bannedUsers.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="border-[2px] border-black shadow-[4px_4px_0px_#000]">
          {tab === "tickets" && (
            <>
              {allTickets.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle size={24} strokeWidth={2} className="text-[#E0E0E0] mx-auto mb-2" />
                  <p className="text-xs text-[#9E9E9E]">No tickets. All clear! 🎉</p>
                </div>
              ) : (
                allTickets.map((t) => (
                  <TicketRow key={t.id} ticket={t} onResolve={handleResolve} />
                ))
              )}
            </>
          )}

          {tab === "bans" && (
            <>
              {bannedUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Shield size={24} strokeWidth={2} className="text-[#E0E0E0] mx-auto mb-2" />
                  <p className="text-xs text-[#9E9E9E]">No moderated users.</p>
                </div>
              ) : (
                bannedUsers.map((r) => (
                  <BanRow
                    key={r.userId}
                    record={r}
                    onUnban={handleUnban}
                    onApproveAppeal={handleApproveAppeal}
                    onDenyAppeal={handleDenyAppeal}
                  />
                ))
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
