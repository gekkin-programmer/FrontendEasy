import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
