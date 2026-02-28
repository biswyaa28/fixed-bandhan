/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Health Check Endpoint
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/health
 *
 * Returns service status for uptime monitoring and post-deploy verification.
 *
 * NOTE: In static export mode (Firebase Hosting), this route is NOT included
 * in the `out/` bundle. The `/api/health` path is rewritten to a Cloud
 * Function via firebase.json → rewrites. This file only runs on Vercel /
 * Node.js SSR deployments.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";

export async function GET() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const isProduction = process.env.NODE_ENV === "production";

  return NextResponse.json(
    {
      status: "healthy",
      demoMode,
      production: isProduction,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      region: process.env.VERCEL_REGION || "unknown",
      services: {
        auth: demoMode ? "mock" : "firebase",
        firestore: demoMode ? "mock" : "firebase",
        storage: demoMode ? "mock" : "firebase",
        functions: demoMode ? "mock" : "firebase",
        hosting: process.env.FIREBASE_STATIC === "true" ? "firebase" : "vercel",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Bandhan-Health": "ok",
      },
    },
  );
}
