/**
 * Bandhan AI — Auth helpers (OTP, sign-out, token)
 *
 * Firebase App + Auth initialisation is handled by lib/firebase/config.ts.
 * This file only contains thin wrappers around firebase/auth methods.
 */

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  type ConfirmationResult,
  type Auth,
} from "firebase/auth";

// ── Central singleton — no duplicate initializeApp ──────────────────────────
import {
  firebaseAuth,
  firebaseAnalytics,
  type Analytics,
} from "@/lib/firebase/config";

// Expose the shared auth instance for other modules.
let auth: Auth | null = null;
try {
  if (typeof window !== "undefined") {
    auth = firebaseAuth();
  }
} catch {
  // Firebase not configured — mock layer will handle auth instead.
  console.warn("⚠️ Firebase Auth not available — using mock auth.");
}

// Initialize Analytics (client-side, non-blocking).
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  firebaseAnalytics()
    .then((a) => {
      analytics = a;
    })
    .catch(() => {});
}
export { analytics };

// ─────────────────────────────────────────────────────────────────────────────
// OTP Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send OTP to phone number using Firebase Phone Auth
 * @param phoneNumber - Phone number with country code (e.g., +919876543210)
 * @param containerId - DOM element ID for reCAPTCHA (default: 'recaptcha-container')
 * @returns ConfirmationResult for verification
 */
export async function sendOTP(
  phoneNumber: string,
  containerId: string = "recaptcha-container",
): Promise<ConfirmationResult> {
  // Check if Firebase auth is available
  if (!auth) {
    console.warn("⚠️ Firebase auth not configured. Use mock auth instead.");
    throw new Error(
      "Firebase not configured. Please use demo mode or configure Firebase credentials.",
    );
  }

  try {
    // Setup reCAPTCHA verifier (only needed once per page load)
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        containerId,
        {
          size: "invisible",
          callback: (response: any) => {
            console.log("reCAPTCHA solved:", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
            (window as any).recaptchaVerifier = null;
          },
          "error-callback": (error: any) => {
            console.error("reCAPTCHA error:", error);
            (window as any).recaptchaVerifier = null;
          },
        },
      );
    }

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      (window as any).recaptchaVerifier,
    );

    return confirmationResult;
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Verify OTP code
 * @param confirmationResult - Result from sendOTP
 * @param otp - 6-digit OTP code
 * @returns User credential on success
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  otp: string,
) {
  try {
    const result = await confirmationResult.confirm(otp);
    return result;
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Get user-friendly error messages for Firebase Auth errors
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/invalid-phone-number": "Please enter a valid phone number.",
    "auth/missing-phone-number": "Phone number is required.",
    "auth/quota-exceeded": "Too many attempts. Please try again later.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/operation-not-allowed": "Phone authentication is not enabled.",
    "auth/captcha-check-failed":
      "reCAPTCHA verification failed. Please try again.",
    "auth/invalid-verification-code": "Invalid OTP. Please try again.",
    "auth/code-expired": "OTP has expired. Please request a new one.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/requires-recent-login": "Please login again to continue.",
  };

  return errorMessages[errorCode] || "Authentication failed. Please try again.";
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    if (auth) {
      await firebaseSignOut(auth);
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error signing out:", error);
    // Still clear storage even on error
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth?.currentUser ?? null;
}

/**
 * Get Firebase ID token
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  return await user.getIdToken(forceRefresh);
}

export default auth;
