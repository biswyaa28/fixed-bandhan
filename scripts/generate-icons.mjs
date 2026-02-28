#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — PWA Icon Generator (ZERO cost)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Converts public/icons/icon.svg → PNG icons at every size needed by the
 * manifest.json and iOS/Android splash screens.
 *
 * Uses `sharp` which is already a dependency of Next.js.
 * No external icon generator services. No paid tools.
 *
 * Run:  node scripts/generate-icons.mjs
 *
 * Outputs to public/icons/:
 *   icon-72x72.png, icon-96x96.png, icon-128x128.png, icon-144x144.png,
 *   icon-152x152.png, icon-192x192.png, icon-384x384.png, icon-512x512.png,
 *   icon-maskable-192x192.png, icon-maskable-512x512.png,
 *   apple-touch-icon.png (180x180)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const SVG_PATH = join(ICONS_DIR, "icon.svg");

// Ensure output dir exists
mkdirSync(ICONS_DIR, { recursive: true });

const svgBuffer = readFileSync(SVG_PATH);

const STANDARD_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

async function generateIcons() {
  console.log("🎨 Generating PWA icons from icon.svg...\n");

  // Standard icons (any purpose)
  for (const size of STANDARD_SIZES) {
    const out = join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(out);
    console.log(`  ✅ icon-${size}x${size}.png`);
  }

  // Maskable icons (safe zone padding: icon at 80%, 10% padding each side)
  for (const size of MASKABLE_SIZES) {
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round(size * 0.1);
    const out = join(ICONS_DIR, `icon-maskable-${size}x${size}.png`);

    // Resize SVG to inner area, then composite onto white background
    const inner = await sharp(svgBuffer)
      .resize(innerSize, innerSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{ input: inner, top: padding, left: padding }])
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(out);

    console.log(`  ✅ icon-maskable-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  const applePath = join(ROOT, "public", "apple-touch-icon.png");
  await sharp(svgBuffer)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(applePath);
  console.log("  ✅ apple-touch-icon.png (180x180)");

  // Favicon (32x32)
  const faviconPath = join(ROOT, "public", "favicon.ico");
  await sharp(svgBuffer)
    .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ quality: 90 })
    .toFile(faviconPath);
  console.log("  ✅ favicon.ico (32x32)");

  console.log("\n🎉 All icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("❌ Icon generation failed:", err);
  process.exit(1);
});
