/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit Tests — Mock Auth Service (lib/mock-auth.ts)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests OTP send/verify, Google sign-in, sign-out, and error handling.
 * Uses the mock auth service directly (no Firebase dependency).
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

// Speed up tests by reducing mock delays
jest.useFakeTimers();

describe("Mock Auth Service", () => {
  beforeEach(() => {
    // Reset auth state between tests
    mockSignOut();
  });

  // ─── OTP Flow ────────────────────────────────────────────────────────────
  describe("OTP Authentication", () => {
    it("sends OTP to a valid Indian phone number", async () => {
      const promise = mockSendOTP("+919876543210");
      jest.advanceTimersByTime(1500);
      const result = await promise;
      expect(result).toBeDefined();
      expect(result.confirmationResult).toBeDefined();
      expect(result.confirmationResult.confirm).toBeInstanceOf(Function);
    });

    it("rejects invalid phone numbers (missing +91)", async () => {
      const promise = mockSendOTP("+1234567890");
      jest.advanceTimersByTime(1000);
      await expect(promise).rejects.toMatchObject({
        code: "auth/invalid-phone-number",
      });
    });

    it("rejects phone numbers with wrong length", async () => {
      const promise = mockSendOTP("+9198765");
      jest.advanceTimersByTime(1000);
      await expect(promise).rejects.toMatchObject({
        code: "auth/invalid-phone-number",
      });
    });

    it("verifies correct OTP (123456)", async () => {
      const sendPromise = mockSendOTP("+919876543210");
      jest.advanceTimersByTime(1500);
      const { confirmationResult } = await sendPromise;

      const verifyPromise = confirmationResult.confirm("123456");
      jest.advanceTimersByTime(1000);
      const result = await verifyPromise;

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.phone).toBe("+919876543210");
    });

    it("rejects incorrect OTP", async () => {
      const sendPromise = mockSendOTP("+919876543210");
      jest.advanceTimersByTime(1500);
      const { confirmationResult } = await sendPromise;

      const verifyPromise = confirmationResult.confirm("000000");
      jest.advanceTimersByTime(1000);
      const result = await verifyPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("returns user with expected shape after successful OTP", async () => {
      const sendPromise = mockSendOTP("+919876543210");
      jest.advanceTimersByTime(1500);
      const { confirmationResult } = await sendPromise;

      const verifyPromise = confirmationResult.confirm("123456");
      jest.advanceTimersByTime(1000);
      const result = await verifyPromise;

      const user = result.user!;
      expect(user).toMatchObject({
        uid: expect.any(String),
        name: expect.any(String),
        phone: "+919876543210",
        isVerified: expect.any(Boolean),
        demoMode: true,
      });
    });
  });

  // ─── Google Sign-In ──────────────────────────────────────────────────────
  describe("Google Sign-In", () => {
    it("signs in successfully", async () => {
      const promise = mockSignInWithGoogle();
      jest.advanceTimersByTime(1500);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.email).toBeDefined();
      expect(result.user!.demoMode).toBe(true);
    });
  });

  // ─── Sign Out ────────────────────────────────────────────────────────────
  describe("Sign Out", () => {
    it("clears the current user", async () => {
      // Sign in first
      const signInPromise = mockSignInWithGoogle();
      jest.advanceTimersByTime(1500);
      await signInPromise;

      expect(isMockAuthenticated()).toBe(true);

      // Sign out
      const signOutPromise = mockSignOut();
      jest.advanceTimersByTime(500);
      await signOutPromise;

      expect(isMockAuthenticated()).toBe(false);
      expect(getMockCurrentUser()).toBeNull();
    });
  });

  // ─── Auth State ──────────────────────────────────────────────────────────
  describe("Auth State", () => {
    it("returns null when not authenticated", () => {
      expect(getMockCurrentUser()).toBeNull();
      expect(isMockAuthenticated()).toBe(false);
    });

    it("tracks authentication state after login", async () => {
      const sendPromise = mockSendOTP("+919876543210");
      jest.advanceTimersByTime(1500);
      const { confirmationResult } = await sendPromise;

      const verifyPromise = confirmationResult.confirm("123456");
      jest.advanceTimersByTime(1000);
      await verifyPromise;

      expect(isMockAuthenticated()).toBe(true);
      expect(getMockCurrentUser()).not.toBeNull();
    });
  });
});
