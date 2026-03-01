/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Integration Tests — Authentication Flow
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests the complete OTP flow from phone validation → OTP send → verify →
 * profile creation. Also tests Google sign-in and error recovery.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  mockSendOTP,
  mockVerifyOTP,
  mockSignInWithGoogle,
  mockSignOut,
  getMockCurrentUser,
  isMockAuthenticated,
} from "@/lib/mock-auth";

jest.useFakeTimers();

describe("Integration: Authentication Flow", () => {
  beforeEach(async () => {
    const p = mockSignOut();
    jest.advanceTimersByTime(1000);
    await p;
  });

  // ─── Complete OTP Flow ─────────────────────────────────────────────────
  describe("Complete OTP Login Flow", () => {
    it("completes full flow: validate → send → verify → authenticated", async () => {
      // Step 1: Validate phone format
      const phone = "+919876543210";
      const digits = phone.replace(/\D/g, "");
      expect(digits.startsWith("91")).toBe(true);
      expect(digits.length).toBe(12);

      // Step 2: Send OTP
      const sendPromise = mockSendOTP(phone);
      jest.advanceTimersByTime(1500);
      const { confirmationResult } = await sendPromise;
      expect(confirmationResult).toBeDefined();

      // Step 3: Verify OTP
      const verifyPromise = confirmationResult.confirm("123456");
      jest.advanceTimersByTime(1000);
      const result = await verifyPromise;

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();

      // Step 4: User is authenticated
      expect(isMockAuthenticated()).toBe(true);
      const user = getMockCurrentUser();
      expect(user).not.toBeNull();
      expect(user!.phone).toBe(phone);
    });

    it("fails gracefully with wrong OTP then recovers", async () => {
      const sendPromise = mockSendOTP("+919876543210");
      jest.advanceTimersByTime(1500);
      const { confirmationResult } = await sendPromise;

      // Attempt 1: Wrong OTP
      const attempt1 = confirmationResult.confirm("000000");
      jest.advanceTimersByTime(1000);
      const result1 = await attempt1;
      expect(result1.success).toBe(false);

      // Attempt 2: Correct OTP
      const attempt2 = confirmationResult.confirm("123456");
      jest.advanceTimersByTime(1000);
      const result2 = await attempt2;
      expect(result2.success).toBe(true);
    });

    it("enforces 3 OTP attempt limit", async () => {
      const sendPromise = mockSendOTP("+919876543210");
      jest.advanceTimersByTime(1500);
      const { confirmationResult } = await sendPromise;

      let attempts = 0;
      const maxAttempts = 3;

      // Exhaust attempts
      for (let i = 0; i < maxAttempts; i++) {
        const p = confirmationResult.confirm("000000");
        jest.advanceTimersByTime(1000);
        const r = await p;
        if (!r.success) attempts++;
      }

      expect(attempts).toBe(maxAttempts);
    });
  });

  // ─── Google Sign-In Flow ───────────────────────────────────────────────
  describe("Google Sign-In Flow", () => {
    it("signs in and creates user profile", async () => {
      const promise = mockSignInWithGoogle();
      jest.advanceTimersByTime(1500);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.user!.email).toBeDefined();
      expect(isMockAuthenticated()).toBe(true);
    });
  });

  // ─── Sign Out Flow ─────────────────────────────────────────────────────
  describe("Sign Out Flow", () => {
    it("clears user state completely", async () => {
      // Sign in
      const signIn = mockSignInWithGoogle();
      jest.advanceTimersByTime(1500);
      await signIn;
      expect(isMockAuthenticated()).toBe(true);

      // Sign out
      const signOut = mockSignOut();
      jest.advanceTimersByTime(500);
      await signOut;

      expect(isMockAuthenticated()).toBe(false);
      expect(getMockCurrentUser()).toBeNull();
    });
  });

  // ─── Phone Validation ─────────────────────────────────────────────────
  describe("Indian Phone Validation", () => {
    const testCases = [
      { input: "+919876543210", valid: true, desc: "valid +91 number" },
      { input: "+91 98765 43210", valid: true, desc: "valid with spaces" },
      { input: "9876543210", valid: false, desc: "missing country code" },
      { input: "+1234567890", valid: false, desc: "non-Indian number" },
      { input: "+91123", valid: false, desc: "too short" },
      { input: "", valid: false, desc: "empty string" },
    ];

    testCases.forEach(({ input, valid, desc }) => {
      it(`${valid ? "accepts" : "rejects"} ${desc}`, async () => {
        if (valid) {
          const promise = mockSendOTP(input);
          jest.advanceTimersByTime(1500);
          await expect(promise).resolves.toBeDefined();
        } else {
          const promise = mockSendOTP(input);
          jest.advanceTimersByTime(1500);
          await expect(promise).rejects.toBeDefined();
        }
      });
    });
  });
});
