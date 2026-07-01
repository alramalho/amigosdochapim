import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  webpack: (config, { dev }) => {
    if (!dev) {
      return config;
    }

    const existingIgnored = config.watchOptions?.ignored;
    const ignored = (
      Array.isArray(existingIgnored)
        ? existingIgnored
        : existingIgnored
          ? [existingIgnored]
          : []
    ).filter(
      (pattern): pattern is string =>
        typeof pattern === "string" && pattern.length > 0,
    );

    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...ignored,
        "**/.git/**",
        "**/.next/**",
        "**/.pnpm-store/**",
        "**/.vercel/**",
        "**/node_modules/**",
        "**/src/generated/prisma/**",
      ],
    };

    return config;
  },
};

export default nextConfig;
