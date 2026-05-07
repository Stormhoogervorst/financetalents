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
  async redirects() {
    return [
      { source: "/vacatures", destination: "/jobs", statusCode: 301 },
      { source: "/vacatures/:path*", destination: "/jobs/:path*", statusCode: 301 },
      { source: "/vacature/:slug", destination: "/jobs/:slug", statusCode: 301 },
      {
        source: "/vacature/:slug/bevestig-linkedin",
        destination: "/jobs/:slug/confirm-linkedin",
        statusCode: 301,
      },
      { source: "/stages", destination: "/internships", statusCode: 301 },
      { source: "/stages/:path*", destination: "/internships/:path*", statusCode: 301 },
      { source: "/werkgevers", destination: "/companies", statusCode: 301 },
      { source: "/werkgevers/:path*", destination: "/companies/:path*", statusCode: 301 },
      { source: "/voor-werkgevers", destination: "/for-employers", statusCode: 301 },
      { source: "/kennisbank", destination: "/insights", statusCode: 301 },
      { source: "/kennisbank/:path*", destination: "/insights/:path*", statusCode: 301 },
      { source: "/voorwaarden", destination: "/terms", statusCode: 301 },
      { source: "/update-wachtwoord", destination: "/update-password", statusCode: 301 },
      {
        source: "/dashboard/instellingen/wachtwoord",
        destination: "/dashboard/settings/password",
        statusCode: 301,
      },
      { source: "/portal/blogs/nieuw", destination: "/portal/blogs/new", statusCode: 301 },
      { source: "/admin/werkgevers", destination: "/admin/companies", statusCode: 301 },
      { source: "/admin/werkgevers/:path*", destination: "/admin/companies/:path*", statusCode: 301 },
      { source: "/admin/vacatures", destination: "/admin/jobs", statusCode: 301 },
      { source: "/admin/vacatures/:path*", destination: "/admin/jobs/:path*", statusCode: 301 },
    ];
  },
};

export default nextConfig;
