/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Authentication Context
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Provides auth state + methods to the entire app via React Context.
 *
 * Features
 * ────────
 *   • Real Firebase Auth when configured, mock auth in demo mode
 *   • Persistent auth state via Firebase onAuthStateChanged
 *   • OTP retry tracking (max 3 attempts per code)
 *   • Loading states for every async operation
 *   • Bilingual errors (en + hi) surfaced to UI
 *   • Auto-creates Firestore profile on first login
 *   • withAuth HOC for protected routes
 *
 * Usage
 * ─────
 *   const { user, sendOTP, verifyOTP, signInWithGoogle, signOut } = useAuth();
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

import {
  sendOTP as authSendOTP,
  verifyOTP as authVerifyOTP,
  signInWithGoogle as authGoogle,
  signOut as authSignOut,
  onAuthStateChanged,
  validatePhone,
  MAX_OTP_ATTEMPTS,
  type BandhanUser,
  type AuthError,
  type SendOTPResult,
} from "@/lib/firebase/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthContextType {
  /** Current user (null when unauthenticated) */
  user: BandhanUser | null;
  /** True when user is signed in */
  isAuthenticated: boolean;
  /** True during initial auth state resolution */
  isLoading: boolean;
  /** True when any auth operation is in progress */
  isSubmitting: boolean;
  /** True when running in demo mode */
  isDemoMode: boolean;
  /** Latest error (bilingual) */
  error: AuthError | null;
  /** Number of OTP verification attempts for the current code */
  otpAttempts: number;
  /** Max OTP attempts allowed */
  maxOtpAttempts: number;

  // ── Actions ──
  /** Validate + send OTP to an Indian phone number */
  sendOTP: (phoneNumber: string) => Promise<SendOTPResult>;
  /** Verify the 6-digit OTP code */
  verifyOTP: (otp: string) => Promise<void>;
  /** Resend OTP (resets attempt counter) */
  resendOTP: (phoneNumber: string) => Promise<SendOTPResult>;
  /** Sign in with Google popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Clear the current error */
  clearError: () => void;
}

// Re-export user type for convenience
export type { BandhanUser } from "@/lib/firebase/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ── State ──
  const [user, setUser] = useState<BandhanUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // initial load
  const [isSubmitting, setIsSubmitting] = useState(false); // action in flight
  const [error, setError] = useState<AuthError | null>(null);
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Store the ConfirmationResult between sendOTP and verifyOTP calls
  const confirmationRef = useRef<SendOTPResult["confirmationResult"] | null>(
    null,
  );

  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // ── Subscribe to auth state on mount ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((fbUser) => {
      setUser(fbUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Helpers ──
  const clearError = useCallback(() => setError(null), []);

  const withSubmitting = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setIsSubmitting(true);
      setError(null);
      try {
        return await fn();
      } catch (err: any) {
        // If the error is already an AuthError shape, use it; otherwise wrap.
        const authErr: AuthError =
          err && typeof err === "object" && "en" in err && "hi" in err
            ? (err as AuthError)
            : {
                code: err?.code ?? "unknown",
                en: err?.message ?? "An unexpected error occurred.",
                hi: err?.message ?? "एक अनपेक्षित त्रुटि हुई।",
              };
        setError(authErr);
        throw authErr;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  // ── Send OTP ──
  const sendOTP = useCallback(
    async (phoneNumber: string): Promise<SendOTPResult> => {
      return withSubmitting(async () => {
        // Validate first so UI can show error instantly
        const v = validatePhone(phoneNumber);
        if (!v.valid) throw v.error;

        const result = await authSendOTP(phoneNumber);
        confirmationRef.current = result.confirmationResult;
        setOtpAttempts(0); // reset on new OTP
        return result;
      });
    },
    [withSubmitting],
  );

  // ── Verify OTP ──
  const verifyOTP = useCallback(
    async (otp: string): Promise<void> => {
      return withSubmitting(async () => {
        if (!confirmationRef.current) {
          throw {
            code: "auth/no-confirmation",
            en: "No OTP was sent. Please request a new one.",
            hi: "कोई OTP नहीं भेजा गया। कृपया नया अनुरोध करें।",
          } as AuthError;
        }

        const nextAttempt = otpAttempts + 1;
        setOtpAttempts(nextAttempt);

        const verifiedUser = await authVerifyOTP(
          confirmationRef.current,
          otp,
          nextAttempt,
        );

        // On success, the onAuthStateChanged listener will update `user`
        // automatically for real Firebase. For demo mode we set it manually.
        if (verifiedUser.demoMode) {
          setUser(verifiedUser);
        }

        confirmationRef.current = null;
        setOtpAttempts(0);
      });
    },
    [withSubmitting, otpAttempts],
  );

  // ── Resend OTP (resets counter, calls sendOTP internally) ──
  const resendOTP = useCallback(
    async (phoneNumber: string): Promise<SendOTPResult> => {
      setOtpAttempts(0);
      confirmationRef.current = null;
      return sendOTP(phoneNumber);
    },
    [sendOTP],
  );

  // ── Google Sign-In ──
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    return withSubmitting(async () => {
      const googleUser = await authGoogle();
      if (googleUser.demoMode) {
        setUser(googleUser);
      }
      // For real Firebase the onAuthStateChanged listener handles user state
    });
  }, [withSubmitting]);

  // ── Sign Out ──
  const signOut = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await authSignOut();
    } finally {
      setUser(null);
      confirmationRef.current = null;
      setOtpAttempts(0);
    }
  }, []);

  // ── Context value ──
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isSubmitting,
    isDemoMode: demo || (user?.demoMode ?? false),
    error,
    otpAttempts,
    maxOtpAttempts: MAX_OTP_ATTEMPTS,

    sendOTP,
    verifyOTP,
    resendOTP,
    signInWithGoogle,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOC for protected routes
// ─────────────────────────────────────────────────────────────────────────────

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            {/* 8-bit spinner */}
            <div className="w-8 h-8 border-[3px] border-black border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">
              Loading…
            </p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // In a real app redirect to /login via Next.js middleware
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  ProtectedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return ProtectedComponent;
}

export default AuthProvider;
