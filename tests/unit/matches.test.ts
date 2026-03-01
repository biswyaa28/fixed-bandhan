/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit Tests — Matching Algorithm (lib/firebase/matches.ts)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests the pure `calculateCompatibility()` function and daily-limits logic.
 * Firebase mocks are set up for the Firestore-dependent functions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  setupFirebaseMocks,
  createMockUser,
} from "@/tests/__mocks__/firebase";

// Must call before importing the module under test
setupFirebaseMocks();

import { calculateCompatibility } from "@/lib/firebase/matches";

describe("Matching Algorithm — calculateCompatibility()", () => {
  // ─── Perfect match ─────────────────────────────────────────────────────
  it("returns high score for identical intent + location + values", () => {
    const user1 = createMockUser({
      uid: "u1",
      intent: "marriage-soon",
      city: "Mumbai",
      diet: "vegetarian",
      religion: "Hindu",
      dealbreakers: {
        smoking: "non-negotiable",
        drinking: "okay-occasionally",
        diet: "strict-veg",
        familyValues: "traditional",
        relocation: "open-discuss",
      },
    });

    const user2 = createMockUser({
      uid: "u2",
      intent: "marriage-soon",
      city: "Mumbai",
      diet: "vegetarian",
      religion: "Hindu",
      dealbreakers: {
        smoking: "non-negotiable",
        drinking: "okay-occasionally",
        diet: "strict-veg",
        familyValues: "traditional",
        relocation: "open-discuss",
      },
    });

    const { score, reasons } = calculateCompatibility(user1, user2);
    expect(score).toBeGreaterThanOrEqual(80);
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.length).toBeLessThanOrEqual(3);
  });

  // ─── Intent mismatch ──────────────────────────────────────────────────
  it("penalizes when intents conflict (marriage vs friendship)", () => {
    const user1 = createMockUser({
      uid: "u1",
      intent: "marriage-soon",
    });
    const user2 = createMockUser({
      uid: "u2",
      intent: "friendship",
    });

    const { score } = calculateCompatibility(user1, user2);
    expect(score).toBeLessThan(60);
  });

  // ─── Location mismatch ────────────────────────────────────────────────
  it("reduces score when users are in different cities", () => {
    const user1 = createMockUser({
      uid: "u1",
      city: "Mumbai",
      intent: "marriage-soon",
    });
    const user2 = createMockUser({
      uid: "u2",
      city: "Chennai",
      intent: "marriage-soon",
    });

    const sameCity = createMockUser({
      uid: "u3",
      city: "Mumbai",
      intent: "marriage-soon",
    });

    const { score: crossCity } = calculateCompatibility(user1, user2);
    const { score: sameScore } = calculateCompatibility(user1, sameCity);

    expect(sameScore).toBeGreaterThan(crossCity);
  });

  // ─── Diet compatibility ────────────────────────────────────────────────
  it("rewards matching dietary preferences", () => {
    const veg1 = createMockUser({ uid: "v1", diet: "vegetarian", intent: "marriage-soon" });
    const veg2 = createMockUser({ uid: "v2", diet: "vegetarian", intent: "marriage-soon" });
    const nonveg = createMockUser({ uid: "nv1", diet: "non-vegetarian", intent: "marriage-soon" });

    const { score: vegMatch } = calculateCompatibility(veg1, veg2);
    const { score: mixedMatch } = calculateCompatibility(veg1, nonveg);

    expect(vegMatch).toBeGreaterThanOrEqual(mixedMatch);
  });

  // ─── Score bounds ──────────────────────────────────────────────────────
  it("always returns a score between 0 and 100", () => {
    for (let i = 0; i < 10; i++) {
      const u1 = createMockUser({ uid: `r1-${i}`, intent: "healing" });
      const u2 = createMockUser({ uid: `r2-${i}`, intent: "marriage-soon" });
      const { score } = calculateCompatibility(u1, u2);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  // ─── Reasons array ─────────────────────────────────────────────────────
  it("returns at most 3 reasons", () => {
    const user1 = createMockUser({ uid: "u1" });
    const user2 = createMockUser({ uid: "u2" });
    const { reasons } = calculateCompatibility(user1, user2);
    expect(reasons.length).toBeLessThanOrEqual(3);
  });

  // ─── Deterministic ─────────────────────────────────────────────────────
  it("produces the same score for the same inputs", () => {
    const user1 = createMockUser({ uid: "det1", intent: "marriage-soon", city: "Delhi" });
    const user2 = createMockUser({ uid: "det2", intent: "serious-relationship", city: "Delhi" });

    const result1 = calculateCompatibility(user1, user2);
    const result2 = calculateCompatibility(user1, user2);

    expect(result1.score).toBe(result2.score);
    expect(result1.reasons).toEqual(result2.reasons);
  });

  // ─── Null intents ──────────────────────────────────────────────────────
  it("handles null/missing intents gracefully", () => {
    const user1 = createMockUser({ uid: "n1", intent: null as any });
    const user2 = createMockUser({ uid: "n2", intent: "marriage-soon" });

    const { score } = calculateCompatibility(user1, user2);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  // ─── Symmetry ──────────────────────────────────────────────────────────
  it("is symmetric: score(A,B) === score(B,A)", () => {
    const user1 = createMockUser({ uid: "s1", intent: "marriage-soon", city: "Pune" });
    const user2 = createMockUser({ uid: "s2", intent: "serious-relationship", city: "Mumbai" });

    const forward = calculateCompatibility(user1, user2);
    const reverse = calculateCompatibility(user2, user1);

    expect(forward.score).toBe(reverse.score);
  });
});
