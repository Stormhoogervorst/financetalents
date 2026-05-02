import type { NextConfig } from "next";

// CORS allow-list voor /api/*. De canonieke productie-URL komt uit
// NEXT_PUBLIC_SITE_URL (zie .env.example). De apex-variant
// (legal-talents.nl zonder www) wordt op DNS-niveau geredirect naar www en
// hoeft hier niet expliciet toegevoegd te worden.
const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL].filter(
  Boolean,
) as string[];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigins.join(", "),
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
