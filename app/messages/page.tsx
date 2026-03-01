/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Messages (Chat List) Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: /messages
 *
 * Shows all conversations. Uses ChatList component with mock data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect } from "react";
import { type ConversationSummary, ChatList } from "@/components/chat/ChatList";

// ─── Mock Conversations ──────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "c1",
    name: "Priya Sharma",
    age: 26,
    city: "Mumbai",
    initials: "PS",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
    verificationLevel: "gold",
    isOnline: true,
    isTyping: true,
    lastMessage: {
      text: "Thanks for the voice note! I loved hearing about your…",
      type: "text",
      isFromMe: false,
      timestamp: "2m ago",
    },
    unreadCount: 2,
    isNewMatch: false,
  },
  {
    id: "c2",
    name: "Ananya Iyer",
    age: 25,
    city: "Chennai",
    initials: "AI",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
    verificationLevel: "silver",
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: "Would love to know more about your family values",
      type: "text",
      isFromMe: true,
      timestamp: "5h ago",
    },
    unreadCount: 0,
    isNewMatch: false,
  },
  {
    id: "c3",
    name: "Sneha Patel",
    age: 27,
    city: "Ahmedabad",
    initials: "SP",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    verificationLevel: "gold",
    isOnline: false,
    isTyping: false,
    lastMessage: {
      text: "Sent you a voice introduction",
      type: "voice",
      isFromMe: false,
      timestamp: "1d ago",
    },
    unreadCount: 1,
    isNewMatch: false,
  },
  {
    id: "c4",
    name: "Kavya Nair",
    age: 24,
    city: "Kochi",
    initials: "KN",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
    verificationLevel: "bronze",
    isOnline: false,
    isTyping: false,
    lastMessage: {
      type: "interest",
      isFromMe: true,
      timestamp: "3d ago",
    },
    unreadCount: 0,
    isNewMatch: true,
  },
  {
    id: "c5",
    name: "Riya Gupta",
    age: 26,
    city: "Delhi",
    initials: "RG",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
    verificationLevel: "silver",
    isOnline: true,
    isTyping: false,
    lastMessage: {
      type: "photo",
      isFromMe: false,
      timestamp: "5d ago",
    },
    unreadCount: 0,
    isNewMatch: true,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setConversations(MOCK_CONVERSATIONS);
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ChatList
      conversations={conversations}
      isLoading={isLoading}
      filter={filter}
      onFilterChange={setFilter}
    />
  );
}
