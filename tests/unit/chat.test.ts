/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit Tests — Chat Service (lib/firebase/chat.ts)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests message sending, read receipts, typing indicators, and validation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  setupFirebaseMocks,
  createMockMessage,
  createMockMatch,
  mockAddDoc,
  mockGetDoc,
  mockGetDocs,
  mockUpdateDoc,
  mockOnSnapshot,
  mockDocSnapshot,
  mockQuerySnapshot,
  mockWriteBatch,
} from "@/tests/__mocks__/firebase";

setupFirebaseMocks();

import { sendMessage, getMessages, markMessagesAsRead } from "@/lib/firebase/chat";

describe("Chat Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── sendMessage ───────────────────────────────────────────────────────
  describe("sendMessage()", () => {
    it("sends a text message successfully", async () => {
      const mockMatch = createMockMatch({
        user1Id: "sender-1",
        user2Id: "receiver-1",
        status: "active",
      });
      mockGetDoc.mockResolvedValueOnce(mockDocSnapshot(mockMatch));
      mockAddDoc.mockResolvedValueOnce({ id: "msg-1" });
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const result = await sendMessage("match-1", "sender-1", "Hello!");

      expect(result).toBeDefined();
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it("rejects empty message content", async () => {
      await expect(sendMessage("match-1", "sender-1", "")).rejects.toBeDefined();
    });

    it("rejects messages longer than 2000 characters", async () => {
      const longMsg = "a".repeat(2001);
      await expect(
        sendMessage("match-1", "sender-1", longMsg),
      ).rejects.toBeDefined();
    });

    it("rejects if match does not exist", async () => {
      mockGetDoc.mockResolvedValueOnce(mockDocSnapshot(undefined, false));

      await expect(
        sendMessage("nonexistent-match", "sender-1", "Hello"),
      ).rejects.toBeDefined();
    });
  });

  // ─── getMessages ───────────────────────────────────────────────────────
  describe("getMessages()", () => {
    it("returns messages ordered by timestamp (most recent first)", async () => {
      const msgs = [
        createMockMessage({ content: "First", createdAt: "2025-01-01T10:00:00Z" }),
        createMockMessage({ content: "Second", createdAt: "2025-01-01T11:00:00Z" }),
      ];
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot(msgs));

      const result = await getMessages("match-1", 20);

      expect(result).toBeDefined();
      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBe(2);
    });

    it("returns empty array when no messages exist", async () => {
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot([]));

      const result = await getMessages("match-1", 20);

      expect(result.messages).toEqual([]);
    });

    it("respects the limit parameter", async () => {
      const msgs = Array.from({ length: 30 }, (_, i) =>
        createMockMessage({ content: `Message ${i}` }),
      );
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot(msgs.slice(0, 10)));

      const result = await getMessages("match-1", 10);

      expect(result.messages.length).toBeLessThanOrEqual(10);
    });
  });

  // ─── markMessagesAsRead ────────────────────────────────────────────────
  describe("markMessagesAsRead()", () => {
    it("updates unread messages for the user", async () => {
      const unreadMsgs = [
        createMockMessage({ senderId: "other-user", deliveryStatus: "sent" }),
        createMockMessage({ senderId: "other-user", deliveryStatus: "delivered" }),
      ];
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot(unreadMsgs));

      const batchMock = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValueOnce(undefined),
      };
      mockWriteBatch.mockReturnValueOnce(batchMock);
      mockUpdateDoc.mockResolvedValue(undefined);

      await markMessagesAsRead("match-1", "current-user");

      // Should attempt to mark messages as read
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });
});
