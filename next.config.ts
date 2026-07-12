import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [100, 25, 50, 75, 85],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
