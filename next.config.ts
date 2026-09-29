import type { NextConfig } from "next";

// Security headers live here rather than only in vercel.json so they also apply
// to `next start` and any non-Vercel host. vercel.json keeps the immutable cache
// rule for /assets (same as FARGO: replaced media gets a NEW filename, never the
// same path).
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // This project lives in ~/Desktop, which iCloud Drive syncs. iCloud evicts the
  // files Next writes into .next seconds after a build ("Ready" then ENOENT).
  // iCloud ignores any path ending in ".nosync", so the local build goes there.
  // Vercel's builder only looks for `.next`, so the workaround stays local-only.
  // NEXT_DIST_DIR lets a production build be measured next to a running dev server.
  distDir: process.env.VERCEL ? ".next" : (process.env.NEXT_DIST_DIR ?? ".next.nosync"),
  // The Docker image ships only the traced server bundle (see Dockerfile).
  output: process.env.NEXT_STANDALONE ? "standalone" : undefined,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [{ source: "/programs", destination: "/coaching", permanent: true }];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The review desk must never be indexed, even if a link to it leaks.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
