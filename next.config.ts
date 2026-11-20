import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* OneAtlas pages read searchParams / route params and query Postgres at
     request time, so they render dynamically (no cacheComponents). */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
