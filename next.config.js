/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],

  // ── Offline fallback ──────────────────────────────────────────────
  // Serves /offline.html when the user is offline and the page isn't cached.
  fallbacks: {
    document: "/offline.html",
    // Placeholder image for uncached profile photos when offline
    image: "/icons/icon-192x192.png",
  },

  // ── Don't cache the FCM worker (it has its own lifecycle) ──
  publicExcludes: ["!firebase-messaging-sw.js"],

  // ── Runtime Caching Strategies ────────────────────────────────────
  // Priority order matters: first match wins.
  runtimeCaching: [
    // ─── 1. Next.js static chunks — immutable, cache forever ────────
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static-v1",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },

    // ─── 2. Self-hosted fonts (next/font woff2) — cache forever ─────
    {
      urlPattern: /\/_next\/static\/media\/.*\.woff2$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-fonts-v1",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },

    // ─── 3. Google Fonts fallback (shouldn't fire — fonts are self-hosted)
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-v1",
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },

    // ─── 4. Profile photos (Firebase Storage) — 7 day cache ─────────
    // StaleWhileRevalidate: serve cached version instantly,
    // update in background. Perfect for profile photos that
    // change rarely but should still refresh.
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "profile-photos-v1",
        expiration: {
          maxEntries: 150, // ~150 photos cached offline
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // ─── 5. CDN images (S3, Cloudinary, avatars) — 7 day cache ──────
    {
      urlPattern:
        /^https:\/\/(cdn\.bandhan\.ai|bandhan-media\.s3.*\.amazonaws\.com|res\.cloudinary\.com|ui-avatars\.com)\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cdn-images-v1",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // ─── 6. Local images (public/*.png, *.jpg, *.svg, *.webp) ───────
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "local-images-v1",
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },

    // ─── 7. Next.js image optimization endpoint ─────────────────────
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-image-v1",
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },

    // ─── 8. Discovery feed API — 1 hour cache ──────────────────────
    // NetworkFirst: try network, fall back to cached data.
    // Short TTL because profiles change often.
    {
      urlPattern: /\/api\/(mock\/)?(matches|discover|feed)/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "discovery-feed-v1",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },

    // ─── 9. Chat messages API — NetworkFirst (real-time) ────────────
    // Always try network first for freshest messages.
    // Cache as fallback for offline viewing of recent conversations.
    {
      urlPattern: /\/api\/(mock\/)?(chat|messages|conversations)/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "chat-messages-v1",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },

    // ─── 10. Auth/health APIs — NetworkOnly (never cache) ───────────
    {
      urlPattern: /\/api\/(mock\/)?(auth|health)/i,
      handler: "NetworkOnly",
    },

    // ─── 11. Other same-origin API routes — NetworkFirst ────────────
    {
      urlPattern:
        /\/api\/(?!mock\/?(auth|health|matches|discover|feed|chat|messages|conversations)).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-misc-v1",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60,
        },
      },
    },

    // ─── 12. Same-origin page navigations — NetworkFirst ────────────
    // Serves the offline fallback page if both network and cache miss.
    {
      urlPattern: /^https?:\/\/[^/]+\/(?!api\/|_next\/).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-v1",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },

    // ─── 13. Audio/voice notes — CacheFirst ─────────────────────────
    {
      urlPattern: /\.(?:mp3|wav|ogg|webm)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "audio-v1",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },

    // ─── 14. CSS/JS bundles (non-_next) — StaleWhileRevalidate ──────
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets-v1",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },

    // ─── 15. Cross-origin catch-all — NetworkFirst with short TTL ───
    {
      urlPattern: /^https?:\/\/(?!localhost).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "cross-origin-v1",
        networkTimeoutSeconds: 8,
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});

// ── Bundle Analyzer (run with: ANALYZE=true npm run build) ──
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const isFirebaseStatic = process.env.FIREBASE_STATIC === "true";

const nextConfig = {
  // ─── Output Mode ──────────────────────────────────────────────────
  // When FIREBASE_STATIC=true, produce a fully static `out/` directory
  // for Firebase Hosting (no Node server required).
  // When unset, build normally for Vercel / Node SSR.
  ...(isFirebaseStatic && {
    output: "export",
    trailingSlash: true,
    // Static export cannot use next/image optimisation at runtime
    images: { unoptimized: true },
  }),

  // ─── TypeScript & ESLint ──────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ─── Image Optimization ───────────────────────────────────────────
  // (Skipped when FIREBASE_STATIC=true — overridden above with unoptimized)
  ...(!isFirebaseStatic && {
    images: {
      // Primary CDN + fallback origins for Indian deployments
      remotePatterns: [
        // Cloudflare R2 / Indian CDN edge
        {
          protocol: "https",
          hostname: "cdn.bandhan.ai",
          pathname: "/**",
        },
        // AWS S3 (Mumbai region – ap-south-1)
        {
          protocol: "https",
          hostname: "bandhan-media.s3.ap-south-1.amazonaws.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "bandhan-media.s3-ap-south-1.amazonaws.com",
          pathname: "/**",
        },
        // Firebase Storage
        {
          protocol: "https",
          hostname: "firebasestorage.googleapis.com",
          pathname: "/v0/b/**",
        },
        {
          protocol: "https",
          hostname: "storage.googleapis.com",
          pathname: "/**",
        },
        // DigiLocker / Aadhaar assets
        {
          protocol: "https",
          hostname: "*.digilocker.gov.in",
          pathname: "/**",
        },
        // User-generated content via Cloudinary (IN region)
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
          pathname: "/**",
        },
        // Fallback avatars
        {
          protocol: "https",
          hostname: "ui-avatars.com",
          pathname: "/**",
        },
      ],
      // Serve modern formats; AVIF first for bandwidth savings on mobile
      formats: ["image/avif", "image/webp"],
      // Aggressive caching – 30 days for profile photos
      minimumCacheTTL: 60 * 60 * 24 * 30,
      // Standard responsive breakpoints + Indian mid-range handsets
      deviceSizes: [360, 414, 480, 640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],
      // Disable dangerouslyAllowSVG for security
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
  }),

  // ─── Compiler (SWC) ────────────────────────────────────────────────
  // Next.js 14 uses SWC by default (faster than Babel).
  // These settings control SWC transforms for production.
  compiler: {
    // Remove console.log/debug/info in production (keep error/warn)
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
    // Remove React test IDs from production markup (smaller HTML)
    reactRemoveProperties:
      process.env.NODE_ENV === "production" ? { properties: ["^data-testid$"] } : false,
  },

  // ─── SWC Minification ─────────────────────────────────────────────
  // SWC is the default minifier in Next 14. These are additional opts:
  swcMinify: true,

  // ─── Experimental Features ────────────────────────────────────────
  experimental: {
    // Server Actions (stable in Next 14) — only for SSR deployments
    ...(!isFirebaseStatic && {
      serverActions: {
        allowedOrigins: [
          "bandhan.ai",
          "www.bandhan.ai",
          "app.bandhan.ai",
          "localhost:3000",
        ],
        bodySizeLimit: "10mb", // allow video-selfie uploads
      },
    }),
    // Optimise bundle for faster TTI on 2G/4G in India.
    // This tree-shakes barrel-file re-exports so only what's used ships.
    optimizePackageImports: [
      // Animation (framer-motion is 50KB+ ungated)
      "framer-motion",
      // Icons — lucide-react ships 1000+ icons; only import what you use
      "lucide-react",
      "react-icons",
      // Radix UI primitives
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-avatar",
      "@radix-ui/react-progress",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-toast",
      // Date utilities (date-fns ships 200+ functions)
      "date-fns",
      "date-fns-tz",
      // Form / validation
      "react-hook-form",
      "@hookform/resolvers",
      "zod",
      // State management
      "zustand",
      "immer",
      // Firebase (tree-shake sub-modules)
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
      "firebase/functions",
      "firebase/analytics",
      // Misc
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "react-use",
      "libphonenumber-js",
      "axios",
    ],

    // ── Granular Chunking ────────────────────────────────────────────
    // Splits vendor libs into separate chunks for better caching.
    // Firebase update doesn't re-download Radix, framer-motion, etc.
    webpackBuildWorker: true,
  },

  // ─── Module-Level Imports ──────────────────────────────────────────
  // Transforms barrel-file imports into direct-path imports at compile
  // time. This prevents webpack from pulling the entire package.
  //
  // Example: import { Heart } from 'lucide-react'
  //      →   import Heart from 'lucide-react/dist/esm/icons/heart'
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
    "date-fns": {
      transform: "date-fns/{{member}}",
    },
  },

  // ─── Redirects ────────────────────────────────────────────────────
  // NOTE: redirects/rewrites/headers are unsupported with output:"export".
  // For Firebase static hosting, these are configured in firebase.json.
  // They only apply to Vercel / Node.js SSR deployments.
  ...(!isFirebaseStatic && {
    async redirects() {
      return [
        {
          source: "/home",
          destination: "/discover",
          permanent: true,
        },
        {
          source: "/signup",
          destination: "/register",
          permanent: true,
        },
      ];
    },

    // ─── Rewrites (Mock API for Demo Mode) ───────────────────────────
    async rewrites() {
      return {
        // beforeFiles rewrites run before checking filesystem/pages
        beforeFiles: [],
        // afterFiles rewrites run after filesystem checks but before 404
        afterFiles: [
          // Rewrite all /api/* requests to mock API handlers
          // Skip /api/mock/* and /api/health to avoid infinite loops
          {
            source: "/api/:path((?!mock|health).*)",
            destination: "/api/mock/:path*",
          },
        ],
        // fallback rewrites run after both pages and filesystem
        fallback: [],
      };
    },

    // ─── Security & Performance Headers ──────────────────────────────
    // NOTE: The middleware.ts adds CSP and rate-limit headers per request.
    // These next.config.js headers serve as a safety net / fallback for
    // static assets and routes that might bypass middleware.
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-DNS-Prefetch-Control",
              value: "on",
            },
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            {
              key: "Permissions-Policy",
              value:
                "camera=(), microphone=(self), geolocation=(self), payment=(self), usb=()",
            },
            // Cross-Origin isolation
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin-allow-popups",
            },
            {
              key: "Cross-Origin-Resource-Policy",
              value: "same-site",
            },
          ],
        },
        // Cache static assets aggressively
        {
          source: "/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        // No-cache for API routes
        {
          source: "/api/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store, no-cache, must-revalidate",
            },
          ],
        },
      ];
    },
  }),

  // ─── Environment Variables ────────────────────────────────────────
  // Only variables prefixed NEXT_PUBLIC_ are exposed to the browser.
  // All others remain server-only.
  env: {
    // App
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Bandhan AI",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "https://bandhan.ai",
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",

    // Firebase (client-safe)
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

    // Razorpay (public key only)
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

    // CDN
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL ?? "https://cdn.bandhan.ai",
    NEXT_PUBLIC_MEDIA_URL:
      process.env.NEXT_PUBLIC_MEDIA_URL ??
      "https://bandhan-media.s3.ap-south-1.amazonaws.com",

    // Feature flags
    NEXT_PUBLIC_ENABLE_KUNDALI: process.env.NEXT_PUBLIC_ENABLE_KUNDALI ?? "true",
    NEXT_PUBLIC_ENABLE_VIDEO: process.env.NEXT_PUBLIC_ENABLE_VIDEO ?? "true",
    NEXT_PUBLIC_MAINTENANCE: process.env.NEXT_PUBLIC_MAINTENANCE ?? "false",
  },

  // ─── Webpack Customisation ────────────────────────────────────────
  webpack(config, { isServer, webpack }) {
    // Prevent firebase-admin from being bundled on the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      };

      // ── Granular Chunk Splitting ───────────────────────────────────
      // Split heavy vendor libraries into separate chunks so they're
      // cached independently and don't invalidate on app code changes.
      // This keeps the initial JS payload under 150KB.
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Firebase SDK — changes rarely, cache aggressively (~80KB)
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: "vendor-firebase",
              chunks: "all",
              priority: 30,
              reuseExistingChunk: true,
            },
            // Animation + UI libs: framer-motion, Radix (~60KB)
            uiLibs: {
              test: /[\\/]node_modules[\\/](framer-motion|@radix-ui)[\\/]/,
              name: "vendor-ui",
              chunks: "all",
              priority: 25,
              reuseExistingChunk: true,
            },
            // Form + validation: react-hook-form, zod (~20KB)
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              name: "vendor-forms",
              chunks: "all",
              priority: 20,
              reuseExistingChunk: true,
            },
            // Utility libs: date-fns, clsx, tailwind-merge (~15KB)
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|clsx|tailwind-merge|class-variance-authority|immer|zustand)[\\/]/,
              name: "vendor-utils",
              chunks: "all",
              priority: 15,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // ─── Output ───────────────────────────────────────────────────────
  poweredByHeader: false, // hide "X-Powered-By: Next.js"
  compress: true,
  reactStrictMode: true,
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
