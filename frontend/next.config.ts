import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const rewritesList: any[] = [
      {
        source: '/app/:path*',
        destination: '/:path*',
      },
    ];
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      rewritesList.push({
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      });
    }
    return rewritesList;
  },
};

export default nextConfig;
