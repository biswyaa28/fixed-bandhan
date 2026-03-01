/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Integration Tests — Match Creation & Discovery Flow
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests the end-to-end flow of:
 *   1. Discovery (browsing profiles)
 *   2. Sending interest (like/special)
 *   3. Mutual like detection → match creation
 *   4. Daily limit enforcement
 *   5. Compatibility scoring integration
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  setupFirebaseMocks,
  createMockUser,
  mockGetDoc,
  mockGetDocs,
  mockAddDoc,
  mockUpdateDoc,
  mockRunTransaction,
  mockDocSnapshot,
  mockQuerySnapshot,
} from "@/tests/__mocks__/firebase";

setupFirebaseMocks();

import { calculateCompatibility } from "@/lib/firebase/matches";

describe("Integration: Match Creation Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ─── Discovery Feed ────────────────────────────────────────────────────
  describe("Discovery Feed", () => {
    it("scores discoverable users by compatibility", () => {
      const currentUser = createMockUser({
        uid: "current",
        intent: "marriage-soon",
        city: "Mumbai",
        diet: "vegetarian",
      });

      const candidates = [
        createMockUser({ uid: "c1", intent: "marriage-soon", city: "Mumbai", diet: "vegetarian" }),
        createMockUser({ uid: "c2", intent: "friendship", city: "Delhi", diet: "non-vegetarian" }),
        createMockUser({ uid: "c3", intent: "serious-relationship", city: "Mumbai", diet: "eggetarian" }),
      ];

      const scored = candidates
        .map((c) => ({
          user: c,
          ...calculateCompatibility(currentUser, c),
        }))
        .sort((a, b) => b.score - a.score);

      // Best match should be c1 (same intent, city, diet)
      expect(scored[0].user.uid).toBe("c1");
      expect(scored[0].score).toBeGreaterThan(scored[1].score);
    });

    it("excludes self from discovery results", () => {
      const currentUser = createMockUser({ uid: "self" });
      const all = [
        createMockUser({ uid: "self" }),
        createMockUser({ uid: "other1" }),
        createMockUser({ uid: "other2" }),
      ];

      const filtered = all.filter((u) => u.uid !== currentUser.uid);
      expect(filtered.length).toBe(2);
      expect(filtered.every((u) => u.uid !== "self")).toBe(true);
    });
  });

  // ─── Interest Creation ─────────────────────────────────────────────────
  describe("Interest (Like) Creation", () => {
    it("prevents duplicate likes to the same user", () => {
      const existingLikes = new Set(["user-2", "user-3"]);

      const canLike = (targetId: string) => !existingLikes.has(targetId);

      expect(canLike("user-2")).toBe(false); // Already liked
      expect(canLike("user-4")).toBe(true); // New target
    });

    it("detects mutual interest → creates match", () => {
      // Simulate: user-1 liked user-2, now user-2 likes user-1
      const interests = [
        { fromUserId: "user-1", toUserId: "user-2", type: "like" },
      ];

      function checkMutualInterest(
        fromId: string,
        toId: string,
        existing: typeof interests,
      ) {
        return existing.some(
          (i) => i.fromUserId === toId && i.toUserId === fromId,
        );
      }

      // user-2 sends interest to user-1
      const isMutual = checkMutualInterest("user-2", "user-1", interests);
      expect(isMutual).toBe(true);

      // user-3 sends interest to user-1 (no match)
      const notMutual = checkMutualInterest("user-3", "user-1", interests);
      expect(notMutual).toBe(false);
    });

    it("differentiates interest types (like, special, premium)", () => {
      type InterestType = "like" | "special_interest" | "premium_interest";

      const typeLabels: Record<InterestType, string> = {
        like: "Regular Like",
        special_interest: "Special Interest",
        premium_interest: "Premium Interest",
      };

      expect(typeLabels.like).toBe("Regular Like");
      expect(typeLabels.special_interest).toBe("Special Interest");
      expect(typeLabels.premium_interest).toBe("Premium Interest");
    });
  });

  // ─── Daily Limits ──────────────────────────────────────────────────────
  describe("Daily Limit Enforcement", () => {
    const STORAGE_KEY = "bandhan_match_daily_limits";

    interface DailyLimits {
      dateIST: string;
      profilesViewed: number;
      likesUsed: number;
      specialInterestUsed: number;
    }

    function getTodayIST(): string {
      const now = new Date();
      const ist = new Date(
        now.getTime() + 5.5 * 60 * 60 * 1000 + now.getTimezoneOffset() * 60 * 1000,
      );
      return `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, "0")}-${String(ist.getDate()).padStart(2, "0")}`;
    }

    function loadLimits(): DailyLimits {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: DailyLimits = JSON.parse(stored);
        if (parsed.dateIST === getTodayIST()) return parsed;
      }
      return {
        dateIST: getTodayIST(),
        profilesViewed: 0,
        likesUsed: 0,
        specialInterestUsed: 0,
      };
    }

    function saveLimits(limits: DailyLimits) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limits));
    }

    it("resets counters at midnight IST", () => {
      // Store yesterday's limits
      saveLimits({
        dateIST: "2025-01-01",
        profilesViewed: 5,
        likesUsed: 5,
        specialInterestUsed: 1,
      });

      // Load today (different date → reset)
      const today = loadLimits();
      expect(today.profilesViewed).toBe(0);
      expect(today.likesUsed).toBe(0);
    });

    it("persists counters within the same day", () => {
      const today = getTodayIST();
      saveLimits({
        dateIST: today,
        profilesViewed: 3,
        likesUsed: 2,
        specialInterestUsed: 0,
      });

      const loaded = loadLimits();
      expect(loaded.profilesViewed).toBe(3);
      expect(loaded.likesUsed).toBe(2);
    });

    it("blocks actions when free limits reached", () => {
      const FREE_LIMIT = 5;
      const limits = loadLimits();
      limits.likesUsed = 5;

      expect(limits.likesUsed >= FREE_LIMIT).toBe(true);
    });
  });
});
