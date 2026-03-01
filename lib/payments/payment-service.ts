/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Payment Service (UPI-First, Razorpay Integration)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Payment flow:
 *   1. User selects plan → createOrder() → Razorpay Order created server-side
 *   2. User pays via UPI QR / UPI ID / Card / Netbanking / Wallet
 *   3. Razorpay callback → verifyPayment() → server verifies signature
 *   4. On success → activateSubscription() in subscription-service.ts
 *   5. On failure → show retry screen, log error
 *
 * UPI FLOW (primary):
 *   • Generate UPI intent link → user taps → opens PhonePe/GPay/Paytm
 *   • OR generate QR code → user scans → payment confirmed
 *   • OR user enters VPA → collect payment via Razorpay
 *
 * SECURITY:
 *   • Payment verification happens server-side (never trust the client)
 *   • Razorpay webhook as backup for callback failures
 *   • Idempotent order creation (prevents duplicate charges)
 *   • All amounts in paise (₹499 = 49900 paise)
 *
 * ZERO COST UNTIL REVENUE:
 *   • Razorpay charges 2% per transaction (no monthly fee)
 *   • UPI payments: 0% gateway fee (Razorpay absorbs it)
 *   • No setup costs, no minimum volume
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  type PlanId,
  type PaymentMethod,
  PLANS,
  extractGST,
  formatINR,
} from "./pricing";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "idle"
  | "creating_order"
  | "awaiting_payment"
  | "verifying"
  | "success"
  | "failed"
  | "cancelled"
  | "refunded";

export interface PaymentOrder {
  /** Razorpay Order ID (e.g., "order_XXXXXXXXX") */
  orderId: string;
  /** Our internal order reference */
  internalRef: string;
  /** Plan being purchased */
  planId: PlanId;
  /** Amount in paise */
  amountInPaise: number;
  /** Currency */
  currency: "INR";
  /** User UID */
  userId: string;
  /** Whether this is a trial activation */
  isTrial: boolean;
  /** Order creation timestamp */
  createdAt: string;
  /** Order expiry (30 minutes) */
  expiresAt: string;
  /** UPI deep-link (for mobile UPI intent) */
  upiIntentUrl: string | null;
  /** UPI QR code data (for QR scan) */
  upiQrData: string | null;
  /** Razorpay key for checkout (public key, safe to expose) */
  razorpayKeyId: string;
}

export interface PaymentResult {
  /** Whether payment was successful */
  success: boolean;
  /** Razorpay Payment ID */
  paymentId: string | null;
  /** Razorpay Order ID */
  orderId: string;
  /** Razorpay Signature (for server-side verification) */
  signature: string | null;
  /** Payment method used */
  method: PaymentMethod | null;
  /** Error message if failed */
  error: string | null;
  errorHi: string | null;
}

export interface PaymentReceipt {
  /** Internal receipt ID */
  receiptId: string;
  /** Razorpay Payment ID */
  paymentId: string;
  /** Plan purchased */
  planId: PlanId;
  planName: string;
  /** Amount */
  amountInPaise: number;
  /** GST breakdown */
  gst: ReturnType<typeof extractGST>;
  /** Payment method */
  method: PaymentMethod;
  /** Timestamp */
  paidAt: string;
  /** User details (for invoice) */
  userName: string;
  userPhone: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const ORDER_EXPIRY_MINUTES = 30;

/** Merchant UPI VPA (displayed to users for manual payment) */
export const MERCHANT_VPA = "bandhan@razorpay"; // Replace with actual merchant VPA

/** Razorpay checkout theme */
const CHECKOUT_THEME = {
  color: "#000000",
  backdrop_color: "rgba(0,0,0,0.8)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Order Creation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique internal order reference.
 * Format: BDN-{timestamp}-{random}
 */
function generateOrderRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BDN-${ts}-${rand}`;
}

/**
 * Create a payment order.
 *
 * In production, this calls your backend API which creates a Razorpay Order
 * via the Razorpay Orders API. The backend returns the order ID.
 *
 * For demo mode, returns a mock order.
 *
 * @param planId  Which plan the user is purchasing
 * @param userId  Authenticated user's UID
 */
export async function createPaymentOrder(
  planId: PlanId,
  userId: string,
): Promise<PaymentOrder> {
  const plan = PLANS[planId];
  if (!plan || plan.priceInPaise === 0) {
    throw new Error("Cannot create order for free plan");
  }

  const internalRef = generateOrderRef();
  const now = new Date();
  const expiry = new Date(now.getTime() + ORDER_EXPIRY_MINUTES * 60 * 1000);

  // ── Production: call backend API ──
  // const response = await fetch("/api/payments/create-order", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ planId, userId, internalRef }),
  // });
  // const data = await response.json();
  // return data.order;

  // ── Demo mode: mock order ──
  const mockOrderId = `order_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  return {
    orderId: mockOrderId,
    internalRef,
    planId,
    amountInPaise: plan.priceInPaise,
    currency: "INR",
    userId,
    isTrial: plan.hasFreeTrial,
    createdAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    upiIntentUrl: `upi://pay?pa=${MERCHANT_VPA}&pn=Bandhan%20AI&am=${plan.priceInPaise / 100}&cu=INR&tn=${plan.name}%20Plan`,
    upiQrData: `upi://pay?pa=${MERCHANT_VPA}&pn=Bandhan%20AI&am=${plan.priceInPaise / 100}&cu=INR`,
    razorpayKeyId: RAZORPAY_KEY_ID,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay Checkout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Open Razorpay Checkout with the given order.
 * Returns a promise that resolves on payment success or rejects on failure.
 *
 * @param order  The payment order from createPaymentOrder()
 * @param userDetails  User info for Razorpay prefill
 */
export function openRazorpayCheckout(
  order: PaymentOrder,
  userDetails: { name: string; email?: string; phone: string },
): Promise<PaymentResult> {
  return new Promise((resolve) => {
    // Check if Razorpay SDK is loaded
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      resolve({
        success: false,
        paymentId: null,
        orderId: order.orderId,
        signature: null,
        method: null,
        error: "Payment gateway not loaded. Please refresh and try again.",
        errorHi: "भुगतान गेटवे लोड नहीं हुआ। कृपया पेज रीफ्रेश करें और पुनः प्रयास करें।",
      });
      return;
    }

    const plan = PLANS[order.planId];

    const options = {
      key: order.razorpayKeyId,
      amount: order.amountInPaise,
      currency: order.currency,
      name: "Bandhan AI",
      description: `${plan.name} Plan - ${plan.periodLabel}`,
      order_id: order.orderId,
      prefill: {
        name: userDetails.name,
        email: userDetails.email || "",
        contact: userDetails.phone,
      },
      notes: {
        internal_ref: order.internalRef,
        plan_id: order.planId,
        user_id: order.userId,
      },
      theme: CHECKOUT_THEME,
      modal: {
        ondismiss: () => {
          resolve({
            success: false,
            paymentId: null,
            orderId: order.orderId,
            signature: null,
            method: null,
            error: "Payment was cancelled.",
            errorHi: "भुगतान रद्द कर दिया गया।",
          });
        },
      },
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          method: "upi", // Razorpay doesn't expose this in the handler
          error: null,
          errorHi: null,
        });
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      resolve({
        success: false,
        paymentId: null,
        orderId: order.orderId,
        signature: null,
        method: null,
        error: response.error?.description || "Payment failed. Please try again.",
        errorHi: "भुगतान विफल। कृपया पुनः प्रयास करें।",
      });
    });

    rzp.open();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Verification (client-side trigger → server-side verification)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify a payment server-side.
 *
 * In production, this calls your backend which:
 *   1. Verifies the Razorpay signature using your secret key
 *   2. Checks the payment amount matches the order
 *   3. Activates the subscription in Firestore
 *   4. Returns a receipt
 *
 * NEVER verify payments client-side — always trust the server.
 */
export async function verifyPayment(
  result: PaymentResult,
): Promise<{ verified: boolean; receipt: PaymentReceipt | null; error: string | null }> {
  if (!result.success || !result.paymentId || !result.signature) {
    return { verified: false, receipt: null, error: result.error };
  }

  // ── Production: call backend API ──
  // const response = await fetch("/api/payments/verify", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     paymentId: result.paymentId,
  //     orderId: result.orderId,
  //     signature: result.signature,
  //   }),
  // });
  // return await response.json();

  // ── Demo mode: mock verification ──
  await new Promise((r) => setTimeout(r, 500));

  return {
    verified: true,
    receipt: {
      receiptId: `RCP-${Date.now().toString(36).toUpperCase()}`,
      paymentId: result.paymentId,
      planId: "premium_monthly", // Would come from the order
      planName: "Premium",
      amountInPaise: 49900,
      gst: extractGST(49900),
      method: result.method || "upi",
      paidAt: new Date().toISOString(),
      userName: "",
      userPhone: "",
    },
    error: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPI-Specific Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a UPI deep-link for direct payment.
 * This opens the user's UPI app (PhonePe, GPay, Paytm) directly.
 */
export function generateUPILink(
  amountInPaise: number,
  planName: string,
  orderId: string,
): string {
  const amount = amountInPaise / 100;
  const params = new URLSearchParams({
    pa: MERCHANT_VPA,
    pn: "Bandhan AI",
    am: amount.toString(),
    cu: "INR",
    tn: `${planName} Plan - ${orderId}`,
    tr: orderId,
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Check if UPI intent is supported on this device.
 * Returns true on mobile devices where UPI apps are likely installed.
 */
export function isUPIIntentSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad/i.test(ua);
}

/**
 * Validate a UPI VPA format.
 * Valid formats: username@bankhandle (e.g., john@upi, priya@okaxis)
 */
export function isValidUPIVpa(vpa: string): boolean {
  return /^[\w.-]+@[\w]+$/.test(vpa.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Messages
// ─────────────────────────────────────────────────────────────────────────────

export function getPaymentErrorMessage(
  code: string | null,
  language: "en" | "hi" = "en",
): string {
  const errors: Record<string, { en: string; hi: string }> = {
    BAD_REQUEST_ERROR: {
      en: "Invalid payment details. Please try again.",
      hi: "अमान्य भुगतान विवरण। कृपया पुनः प्रयास करें।",
    },
    GATEWAY_ERROR: {
      en: "Payment gateway issue. Please try after some time.",
      hi: "भुगतान गेटवे समस्या। कृपया कुछ समय बाद पुनः प्रयास करें।",
    },
    SERVER_ERROR: {
      en: "Server error. Your money is safe. Please contact support.",
      hi: "सर्वर त्रुटि। आपका पैसा सुरक्षित है। कृपया सहायता से संपर्क करें।",
    },
    NETWORK_ERROR: {
      en: "Network issue. Please check your internet and retry.",
      hi: "नेटवर्क समस्या। कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।",
    },
  };

  const msg = errors[code || ""] || {
    en: "Payment failed. Please try again or use a different method.",
    hi: "भुगतान विफल। कृपया पुनः प्रयास करें या कोई अन्य तरीका उपयोग करें।",
  };

  return msg[language];
}

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay Script Loader
// ─────────────────────────────────────────────────────────────────────────────

let _razorpayLoaded = false;

/**
 * Dynamically load the Razorpay Checkout script.
 * Call this before opening the checkout.
 */
export function loadRazorpayScript(): Promise<void> {
  if (_razorpayLoaded || (typeof window !== "undefined" && (window as any).Razorpay)) {
    _razorpayLoaded = true;
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Cannot load Razorpay in server context"));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      _razorpayLoaded = true;
      resolve();
    };
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}
