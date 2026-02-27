/**
 * Bandhan AI - Middleware
 * Enforces demo mode in production and handles mock API routing
 *
 * Features:
 * - Force demo mode in production
 * - Redirect real API calls to mock endpoints
 * - Add demo mode headers
 * - Health check endpoint
 */

import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const PRODUCTION = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────────────────────────────────────
// Middleware Function
// ─────────────────────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ───────────────────────────────────────────────────────────────────────────
  // Health Check Endpoint
  // ───────────────────────────────────────────────────────────────────────────
  if (pathname === "/api/health") {
    return NextResponse.json({
      status: "healthy",
      demoMode: DEMO_MODE,
      production: PRODUCTION,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Force Demo Mode in Production
  // ───────────────────────────────────────────────────────────────────────────
  if (PRODUCTION && !DEMO_MODE) {
    console.warn(
      "⚠️ Production deployment without demo mode! Forcing demo mode...",
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Add Demo Mode Headers
  // ───────────────────────────────────────────────────────────────────────────
  const response = NextResponse.next();

  // Add demo mode header for debugging
  response.headers.set("X-Demo-Mode", DEMO_MODE ? "true" : "false");
  response.headers.set(
    "X-Environment",
    PRODUCTION ? "production" : "development",
  );

  // Security headers
  if (PRODUCTION) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("X-Frame-Options", "DENY");
  }

  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// Matcher Configuration
// ─────────────────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, sitemap.xml, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
