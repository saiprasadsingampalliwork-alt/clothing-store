import type { NextConfig } from "next";

// Uploaded photos are stored and served by the API; keep their /uploads/... paths working on the storefront.
const apiOrigin = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1").replace(/\/v1\/?$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` }];
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
