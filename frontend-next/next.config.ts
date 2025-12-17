import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 1. Add '90' to the list of allowed qualities to fix the error
    qualities: [25, 50, 75, 90], 

    // 2. Ensure you allow external images (Clerk, Unsplash) which you use in the app
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

export default nextConfig;
