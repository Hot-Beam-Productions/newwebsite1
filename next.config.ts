import type { NextConfig } from "next";

const R2_HOSTNAME = process.env.NEXT_PUBLIC_R2_DOMAIN ?? "pub-XXXX.r2.dev";
const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? process.env.NEXT_PUBLIC_WORKER_URL;

function getContactOrigin(endpoint: string | undefined): string | null {
  if (!endpoint) return null;
  try {
    return new URL(endpoint).origin;
  } catch {
    return null;
  }
}

const contactOrigin = getContactOrigin(CONTACT_ENDPOINT);
const connectSrc = [
  "'self'",
  "https://challenges.cloudflare.com",
  "https://graph.instagram.com",
  ...(contactOrigin ? [contactOrigin] : []),
].join(" ");

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://${R2_HOSTNAME} https://*.cdninstagram.com https://*.instagram.com`,
  `connect-src ${connectSrc}`,
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: R2_HOSTNAME,
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.instagram.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: ContentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
