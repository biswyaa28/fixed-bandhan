/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Support Ticket System
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Firestore-backed ticketing for user support queries.
 * SLA: 24h first response, 72h resolution.
 *
 * Collection: supportTickets/{ticketId}
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ───────────────────────────────────────────────────────────────

export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type TicketCategory =
  | "account"
  | "billing"
  | "bug"
  | "safety"
  | "verification"
  | "match"
  | "chat"
  | "feature_request"
  | "other";

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  /** Optional screenshot base64 */
  attachmentUrl: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  /** Internal notes (not visible to user) */
  internalNotes: string[];
  /** User-visible responses */
  responses: TicketResponse[];
  /** Device/app info for debugging */
  metadata: {
    appVersion: string;
    platform: string;
    os: string;
    screenPath: string;
  };
}

export interface TicketResponse {
  id: string;
  authorId: string;
  authorName: string;
  isStaff: boolean;
  message: string;
  createdAt: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  assignedTo?: string;
  userId?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  avgResponseTimeHours: number;
  avgResolutionTimeHours: number;
}

// ─── Priority Rules ──────────────────────────────────────────────────────

const PRIORITY_RULES: Record<TicketCategory, TicketPriority> = {
  safety: "critical",
  billing: "high",
  bug: "high",
  account: "medium",
  verification: "medium",
  match: "medium",
  chat: "low",
  feature_request: "low",
  other: "low",
};

// ─── Storage (localStorage for demo, Firestore in production) ────────────

const TICKETS_KEY = "bandhan_support_tickets";

function loadTickets(): SupportTicket[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]");
  } catch { return []; }
}

function saveTickets(tickets: SupportTicket[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

// ─── Public API ──────────────────────────────────────────────────────────

let _counter = Date.now();
function generateId(): string {
  return `TKT-${(++_counter).toString(36).toUpperCase()}`;
}

/**
 * Create a new support ticket.
 */
export function createTicket(
  userId: string,
  data: {
    userEmail: string;
    userName: string;
    category: TicketCategory;
    subject: string;
    description: string;
    attachmentUrl?: string;
    screenPath?: string;
  },
): SupportTicket {
  const ticket: SupportTicket = {
    id: generateId(),
    userId,
    userEmail: data.userEmail,
    userName: data.userName,
    category: data.category,
    priority: PRIORITY_RULES[data.category] || "medium",
    status: "open",
    subject: data.subject,
    description: data.description,
    attachmentUrl: data.attachmentUrl || null,
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    internalNotes: [],
    responses: [],
    metadata: {
      appVersion: "1.0.0",
      platform: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      os: typeof navigator !== "undefined" ? navigator.platform : "unknown",
      screenPath: data.screenPath || "/",
    },
  };

  const tickets = loadTickets();
  tickets.unshift(ticket);
  saveTickets(tickets);
  return ticket;
}

/**
 * Get all tickets, optionally filtered.
 */
export function getTickets(filters?: TicketFilters): SupportTicket[] {
  let tickets = loadTickets();
  if (filters) {
    if (filters.status) tickets = tickets.filter((t) => t.status === filters.status);
    if (filters.category) tickets = tickets.filter((t) => t.category === filters.category);
    if (filters.priority) tickets = tickets.filter((t) => t.priority === filters.priority);
    if (filters.assignedTo) tickets = tickets.filter((t) => t.assignedTo === filters.assignedTo);
    if (filters.userId) tickets = tickets.filter((t) => t.userId === filters.userId);
  }
  return tickets;
}

/**
 * Get a single ticket by ID.
 */
export function getTicketById(ticketId: string): SupportTicket | null {
  return loadTickets().find((t) => t.id === ticketId) || null;
}

/**
 * Add a response to a ticket (staff or user).
 */
export function addResponse(
  ticketId: string,
  authorId: string,
  authorName: string,
  message: string,
  isStaff: boolean,
): SupportTicket | null {
  const tickets = loadTickets();
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  ticket.responses.push({
    id: `RSP-${Date.now().toString(36)}`,
    authorId,
    authorName,
    isStaff,
    message,
    createdAt: new Date().toISOString(),
  });
  ticket.updatedAt = new Date().toISOString();
  if (isStaff) ticket.status = "waiting_user";
  else ticket.status = "in_progress";

  saveTickets(tickets);
  return ticket;
}

/**
 * Update ticket status.
 */
export function updateTicketStatus(ticketId: string, status: TicketStatus): SupportTicket | null {
  const tickets = loadTickets();
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  if (status === "resolved" || status === "closed") {
    ticket.resolvedAt = new Date().toISOString();
  }
  saveTickets(tickets);
  return ticket;
}

/**
 * Assign ticket to a team member.
 */
export function assignTicket(ticketId: string, staffId: string): SupportTicket | null {
  const tickets = loadTickets();
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return null;

  ticket.assignedTo = staffId;
  ticket.status = "in_progress";
  ticket.updatedAt = new Date().toISOString();
  saveTickets(tickets);
  return ticket;
}

/**
 * Get ticket statistics.
 */
export function getTicketStats(): TicketStats {
  const tickets = loadTickets();
  const now = Date.now();

  const resolved = tickets.filter((t) => t.resolvedAt);
  const responseTimes = tickets
    .filter((t) => t.responses.length > 0)
    .map((t) => {
      const created = new Date(t.createdAt).getTime();
      const firstResponse = new Date(t.responses[0].createdAt).getTime();
      return (firstResponse - created) / (1000 * 60 * 60);
    });

  const resolutionTimes = resolved.map((t) => {
    const created = new Date(t.createdAt).getTime();
    const resolvedTime = new Date(t.resolvedAt!).getTime();
    return (resolvedTime - created) / (1000 * 60 * 60);
  });

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress" || t.status === "waiting_user").length,
    resolved: resolved.length,
    avgResponseTimeHours: responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10
      : 0,
    avgResolutionTimeHours: resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length * 10) / 10
      : 0,
  };
}
