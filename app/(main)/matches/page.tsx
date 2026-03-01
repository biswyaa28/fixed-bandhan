/**
 * Redirect stub — the real matches page lives at app/matches/page.tsx.
 * This file exists because the (main) route group resolves to the same
 * URL path. Next.js will pick app/matches/page.tsx over this one.
 * If this causes a build conflict, delete this file.
 */
"use client";
import { redirect } from "next/navigation";
export default function MainMatchesRedirect() {
  redirect("/matches");
}
