import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
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
  org: "easypost",
  project: "frontend",
  // Only upload wider source maps when auth is available (CI/CD), not during Docker builds
  widenClientFileUpload: hasSentryAuth,
  tunnelRoute: "/monitoring",
});
