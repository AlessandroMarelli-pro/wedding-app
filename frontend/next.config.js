/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],

    //domains: [...(process.env.WHITELISTED_DOMAINS?.split(',') || [])],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  devIndicators: false, // The `serverExternalPackages` option allows you to opt-out of bundling dependencies in your Server Components.

  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
};

module.exports = nextConfig;
