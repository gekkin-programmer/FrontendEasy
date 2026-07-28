import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    // Defaults to the production backend. Set NEXT_PUBLIC_API_URL in .env.local
    // (e.g. http://localhost:3000) to point this at a local backend instead —
    // that same env var already drives src/lib/api.ts and the login/signup pages.
    const backendOrigin = (process.env.NEXT_PUBLIC_API_URL || "https://backend-eazypost.mbokofit.com")
      .replace(/\/$/, "")
      .replace(/\/api$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
  images: {
    // ➤ 1. Allow SVGs
    dangerouslyAllowSVG: true,
    // ➤ 2. Set Security Policy for SVGs (Recommended)
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "api.dicebear.com" }, 
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

const hasSentryAuth = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "eazlypost",
  project: "frontend",
  // Only upload wider source maps when auth is available (CI/CD), not during Docker builds
  widenClientFileUpload: hasSentryAuth,
  tunnelRoute: "/monitoring",
});
