/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Firebase Authentication Service (v9 Modular SDK)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single auth service consumed by AuthContext.
 *
 * Features
 * ────────
 *   • Phone OTP with invisible reCAPTCHA v3
 *   • Google OAuth popup flow
 *   • Auto-create Firestore user profile on first sign-in
 *   • Bilingual error messages (English + Hindi)
 *   • Indian phone validation (+91)
 *   • Retry / rate-limit tracking (max 3 OTP attempts)
 *   • Transparent demo-mode fallback via lib/mock-auth
 *
 * STRICT RULES
 * ────────────
 *   • NO hardcoded API keys
 *   • Firebase Auth v9 modular imports only
 *   • All functions fully typed
 *   • All errors return AuthError with en + hi messages
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  type ConfirmationResult,
  type UserCredential,
  type User as FirebaseUser,
  type Unsubscribe,
} from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { firebaseAuth, firebaseDb } from "@/lib/firebase/config";

import {
  mockSendOTP,
  mockVerifyOTP,
  mockSignInWithGoogle,
  mockSignOut,
  getMockCurrentUser,
  isMockAuthenticated,
  type MockUser,
  type MockConfirmationResult,
} from "@/lib/mock-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Normalised user object used across the app */
export interface BandhanUser {
  id: string;
  uid: string;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  isPremium: boolean;
  verificationLevel: "bronze" | "silver" | "gold";
  createdAt: string;
  demoMode: boolean;
}

/** Bilingual error returned by every auth function */
export interface AuthError {
  code: string;
  en: string;
  hi: string;
}

/** Result of sendOTP (real or mock) */
export interface SendOTPResult {
  /** Opaque confirmation handle — pass to verifyOTP */
  confirmationResult:
    | ConfirmationResult
    | MockConfirmationResult["confirmationResult"];
}

/** Result of phone number validation */
export interface PhoneValidation {
  valid: boolean;
  error?: AuthError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_OTP_ATTEMPTS = 3;
const OTP_LENGTH = 6;
const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

// ─────────────────────────────────────────────────────────────────────────────
// Error map — Firebase error code → bilingual user message
// ─────────────────────────────────────────────────────────────────────────────

const ERROR_MAP: Record<string, Omit<AuthError, "code">> = {
  "auth/invalid-phone-number": {
    en: "Please enter a valid Indian mobile number starting with +91.",
    hi: "कृपया +91 से शुरू होने वाला एक वैध भारतीय मोबाइल नंबर दर्ज करें।",
  },
  "auth/missing-phone-number": {
    en: "Phone number is required.",
    hi: "फ़ोन नंबर आवश्यक है।",
  },
  "auth/quota-exceeded": {
    en: "Too many OTP requests. Please wait 30 seconds and try again.",
    hi: "बहुत अधिक OTP अनुरोध। कृपया 30 सेकंड प्रतीक्षा करें और पुनः प्रयास करें।",
  },
  "auth/too-many-requests": {
    en: "Too many attempts. Please try again after 15 minutes.",
    hi: "बहुत अधिक प्रयास। कृपया 15 मिनट बाद पुनः प्रयास करें।",
  },
  "auth/invalid-verification-code": {
    en: "Invalid OTP. Please check and re-enter the 6-digit code.",
    hi: "अमान्य OTP। कृपया 6-अंकीय कोड जाँचें और पुनः दर्ज करें।",
  },
  "auth/code-expired": {
    en: "OTP has expired. Please request a new one.",
    hi: "OTP समाप्त हो गया है। कृपया नया अनुरोध करें।",
  },
  "auth/network-request-failed": {
    en: "Network error. Please check your internet connection.",
    hi: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जाँचें।",
  },
  "auth/captcha-check-failed": {
    en: "Security verification failed. Please refresh and try again.",
    hi: "सुरक्षा सत्यापन विफल। कृपया रीफ़्रेश करें और पुनः प्रयास करें।",
  },
  "auth/popup-closed-by-user": {
    en: "Sign-in popup was closed. Please try again.",
    hi: "साइन-इन पॉपअप बंद कर दिया गया। कृपया पुनः प्रयास करें।",
  },
  "auth/operation-not-allowed": {
    en: "This sign-in method is not enabled. Please contact support.",
    hi: "यह साइन-इन विधि सक्षम नहीं है। कृपया सहायता से संपर्क करें।",
  },
  "auth/account-exists-with-different-credential": {
    en: "An account already exists with this email using a different sign-in method.",
    hi: "इस ईमेल से पहले से एक अलग साइन-इन विधि का उपयोग करके खाता मौजूद है।",
  },
  "auth/credential-already-in-use": {
    en: "This phone number is already linked to another account.",
    hi: "यह फ़ोन नंबर पहले से किसी अन्य खाते से जुड़ा हुआ है।",
  },
  "auth/requires-recent-login": {
    en: "Please sign in again to continue.",
    hi: "जारी रखने के लिए कृपया पुनः साइन इन करें।",
  },
};

function toAuthError(code: string): AuthError {
  const mapped = ERROR_MAP[code];
  if (mapped) return { code, ...mapped };
  return {
    code,
    en: "Authentication failed. Please try again.",
    hi: "प्रमाणीकरण विफल। कृपया पुनः प्रयास करें।",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

/** Convert Firebase User → BandhanUser (merge Firestore profile if exists) */
async function firebaseUserToBandhan(
  fbUser: FirebaseUser,
): Promise<BandhanUser> {
  const base: BandhanUser = {
    id: fbUser.uid,
    uid: fbUser.uid,
    name: fbUser.displayName ?? "",
    email: fbUser.email ?? undefined,
    phone: fbUser.phoneNumber ?? "",
    avatarUrl: fbUser.photoURL ?? undefined,
    isVerified: false,
    isPremium: false,
    verificationLevel: "bronze",
    createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
    demoMode: false,
  };

  // Try merging extra fields from Firestore profile
  try {
    const db = firebaseDb();
    const snap = await getDoc(doc(db, "users", fbUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...base,
        name: data.name ?? base.name,
        avatarUrl: data.avatarUrl ?? base.avatarUrl,
        isVerified: data.isVerified ?? false,
        isPremium: data.isPremium ?? false,
        verificationLevel: data.verificationLevel ?? "bronze",
      };
    }
  } catch {
    // Firestore read failed (offline, rules, etc.) — use base
  }

  return base;
}

/** Create /users/{uid} document on first sign-in.
 *  Fields must satisfy the CREATE rule in firestore.rules. */
async function ensureUserProfile(user: BandhanUser): Promise<void> {
  try {
    const db = firebaseDb();
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        // Identity
        uid: user.uid,
        name: user.name || "",
        email: user.email || null,
        phone: user.phone || "",
        gender: null,
        dateOfBirth: null,
        age: null,
        // Profile
        bio: null,
        city: null,
        state: null,
        height: null,
        weight: null,
        education: null,
        occupation: null,
        annualIncome: null,
        religion: null,
        caste: null,
        gotra: null,
        manglik: null,
        motherTongue: null,
        // Family
        familyType: null,
        fatherOccupation: null,
        motherOccupation: null,
        siblings: null,
        // Lifestyle
        diet: null,
        smoking: null,
        drinking: null,
        intent: null,
        // Media
        avatarUrl: user.avatarUrl || null,
        photos: [],
        // Settings
        preferences: null,
        dealbreakers: null,
        privacy: null,
        // Verification — safe defaults enforced by firestore.rules
        isVerified: false,
        verificationLevel: "bronze",
        verifiedAt: null,
        // Premium
        isPremium: false,
        premiumExpiresAt: null,
        // Activity
        isOnline: false,
        lastSeenAt: null,
        // Internal
        profileCompletion: 0,
        reportCount: 0,
        blockedUserIds: [],
        isDeactivated: false,
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    // Non-fatal — profile creation can be retried later
    console.warn("[BandhanAuth] Failed to create user profile:", err);
  }
}

function mockUserToBandhan(m: MockUser): BandhanUser {
  return { ...m, demoMode: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// reCAPTCHA management
// ─────────────────────────────────────────────────────────────────────────────

let _recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Get or create an invisible reCAPTCHA verifier.
 * Injects the container div if it doesn't exist in the DOM.
 */
function getRecaptchaVerifier(): RecaptchaVerifier {
  // Ensure the container div exists
  if (!document.getElementById(RECAPTCHA_CONTAINER_ID)) {
    const el = document.createElement("div");
    el.id = RECAPTCHA_CONTAINER_ID;
    el.className = "sr-only"; // hidden but accessible
    document.body.appendChild(el);
  }

  if (_recaptchaVerifier) return _recaptchaVerifier;

  const auth = firebaseAuth();
  _recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: "invisible",
    callback: () => {
      /* solved */
    },
    "expired-callback": () => {
      _recaptchaVerifier = null;
    },
    "error-callback": () => {
      _recaptchaVerifier = null;
    },
  });

  return _recaptchaVerifier;
}

/** Force-clear the cached verifier (call after errors) */
function resetRecaptcha(): void {
  try {
    _recaptchaVerifier?.clear();
  } catch {
    /* ignore */
  }
  _recaptchaVerifier = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate an Indian phone number.
 * Accepts +91XXXXXXXXXX where X[0] ∈ {6,7,8,9}.
 */
export function validatePhone(phoneNumber: string): PhoneValidation {
  const cleaned = phoneNumber.replace(/[\s\-()]/g, "");

  if (!cleaned.startsWith("+91")) {
    return {
      valid: false,
      error: {
        code: "validation/missing-country-code",
        en: "Phone number must start with +91.",
        hi: "फ़ोन नंबर +91 से शुरू होना चाहिए।",
      },
    };
  }

  const digits = cleaned.slice(3);

  if (digits.length !== 10) {
    return {
      valid: false,
      error: {
        code: "validation/invalid-length",
        en: "Please enter a 10-digit mobile number after +91.",
        hi: "+91 के बाद 10 अंकों का मोबाइल नंबर दर्ज करें।",
      },
    };
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      valid: false,
      error: {
        code: "validation/invalid-prefix",
        en: "Indian mobile numbers must start with 6, 7, 8, or 9.",
        hi: "भारतीय मोबाइल नंबर 6, 7, 8, या 9 से शुरू होना चाहिए।",
      },
    };
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Send OTP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send an OTP to the given Indian phone number.
 *
 * In demo mode delegates to mock-auth. In production uses Firebase Phone Auth
 * with an invisible reCAPTCHA verifier.
 *
 * @throws {AuthError} on validation or Firebase failure
 */
export async function sendOTP(phoneNumber: string): Promise<SendOTPResult> {
  // ── Validate ──
  const validation = validatePhone(phoneNumber);
  if (!validation.valid) throw validation.error!;

  // ── Demo mode ──
  if (isDemoMode()) {
    const mock = await mockSendOTP(phoneNumber);
    return { confirmationResult: mock.confirmationResult };
  }

  // ── Real Firebase ──
  try {
    const auth = firebaseAuth();
    const verifier = getRecaptchaVerifier();
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier,
    );
    return { confirmationResult };
  } catch (err: any) {
    resetRecaptcha();
    throw toAuthError(err?.code ?? "auth/unknown");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify the 6-digit OTP.
 *
 * @param confirmationResult - handle returned by sendOTP
 * @param otp                - 6-digit string
 * @param attemptNumber      - current attempt (1-based). If >= MAX throws lockout.
 * @returns BandhanUser on success
 * @throws {AuthError} on invalid code, expiry, or lockout
 */
export async function verifyOTP(
  confirmationResult: SendOTPResult["confirmationResult"],
  otp: string,
  attemptNumber: number = 1,
): Promise<BandhanUser> {
  // ── Format check ──
  if (!/^\d{6}$/.test(otp)) {
    throw {
      code: "validation/invalid-otp-format",
      en: `Please enter a valid ${OTP_LENGTH}-digit OTP.`,
      hi: `कृपया एक वैध ${OTP_LENGTH}-अंकीय OTP दर्ज करें।`,
    } as AuthError;
  }

  // ── Lockout check ──
  if (attemptNumber > MAX_OTP_ATTEMPTS) {
    throw {
      code: "auth/max-attempts",
      en: "Too many failed attempts. Please request a new OTP.",
      hi: "बहुत सारे विफल प्रयास। कृपया नया OTP अनुरोध करें।",
    } as AuthError;
  }

  // ── Demo mode ──
  if (isDemoMode()) {
    const result = await (
      confirmationResult as MockConfirmationResult["confirmationResult"]
    ).confirm(otp);
    if (!result.success || !result.user) {
      const remaining = MAX_OTP_ATTEMPTS - attemptNumber;
      throw {
        code: "auth/invalid-verification-code",
        en: `Invalid OTP.${remaining > 0 ? ` ${remaining} attempt${remaining > 1 ? "s" : ""} remaining.` : " Please request a new OTP."}`,
        hi: `अमान्य OTP।${remaining > 0 ? ` ${remaining} प्रयास शेष।` : " कृपया नया OTP अनुरोध करें।"}`,
      } as AuthError;
    }
    return mockUserToBandhan(result.user);
  }

  // ── Real Firebase ──
  try {
    const credential: UserCredential = await (
      confirmationResult as ConfirmationResult
    ).confirm(otp);
    const user = await firebaseUserToBandhan(credential.user);
    await ensureUserProfile(user);
    return user;
  } catch (err: any) {
    const base = toAuthError(err?.code ?? "auth/invalid-verification-code");
    const remaining = MAX_OTP_ATTEMPTS - attemptNumber;
    throw {
      ...base,
      en: `${base.en}${remaining > 0 ? ` (${remaining} attempt${remaining > 1 ? "s" : ""} remaining)` : ""}`,
      hi: `${base.hi}${remaining > 0 ? ` (${remaining} प्रयास शेष)` : ""}`,
    } as AuthError;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Sign-In
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign in with Google popup.
 *
 * Auto-creates a Firestore user profile on first login.
 *
 * @returns BandhanUser on success
 * @throws {AuthError}
 */
export async function signInWithGoogle(): Promise<BandhanUser> {
  // ── Demo mode ──
  if (isDemoMode()) {
    const result = await mockSignInWithGoogle();
    if (!result.success || !result.user) {
      throw {
        code: "auth/google-failed",
        en: "Google sign-in failed. Please try again.",
        hi: "Google साइन-इन विफल। कृपया पुनः प्रयास करें।",
      } as AuthError;
    }
    return mockUserToBandhan(result.user);
  }

  // ── Real Firebase ──
  try {
    const auth = firebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    provider.addScope("email");
    provider.addScope("profile");

    const credential = await signInWithPopup(auth, provider);
    const user = await firebaseUserToBandhan(credential.user);
    await ensureUserProfile(user);
    return user;
  } catch (err: any) {
    throw toAuthError(err?.code ?? "auth/unknown");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign Out
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign out the current user (Firebase + localStorage cleanup).
 */
export async function signOut(): Promise<void> {
  try {
    if (isDemoMode()) {
      await mockSignOut();
    } else {
      const auth = firebaseAuth();
      await fbSignOut(auth);
    }
  } finally {
    // Always clean up client storage
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("mock_auth_token");
      localStorage.removeItem("mock_user");
      localStorage.removeItem("demo_mode");
    } catch {
      /* SSR guard */
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth state listener
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to auth state changes.
 *
 * In demo mode polls localStorage for mock user.
 * In production wraps `onAuthStateChanged`.
 *
 * @returns Unsubscribe function
 */
export function onAuthStateChanged(
  callback: (user: BandhanUser | null) => void,
): Unsubscribe {
  // ── Demo mode: check localStorage on mount ──
  if (isDemoMode()) {
    // Immediately fire current state
    const current = getMockCurrentUser();
    const isAuthed = isMockAuthenticated();
    if (isAuthed && current) {
      callback(mockUserToBandhan(current));
    } else {
      callback(null);
    }
    // Return no-op unsubscribe
    return () => {};
  }

  // ── Real Firebase ──
  const auth = firebaseAuth();
  return fbOnAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const user = await firebaseUserToBandhan(fbUser);
      callback(user);
    } else {
      callback(null);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Get ID token (for API calls)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a Firebase ID token for authenticated API calls.
 *
 * @param forceRefresh - force token refresh
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (isDemoMode()) {
    try {
      return localStorage.getItem("mock_auth_token");
    } catch {
      return null;
    }
  }

  try {
    const auth = firebaseAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports
// ─────────────────────────────────────────────────────────────────────────────

export { MAX_OTP_ATTEMPTS, OTP_LENGTH };
export type { FirebaseUser, ConfirmationResult };
