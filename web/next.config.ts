import type { NextConfig } from "next";

// Set when building for GitHub Pages, which serves the site from a sub-path as plain files.
const pagesPath = process.env.PAGES_BASE_PATH;

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  env: { NEXT_PUBLIC_BASE_PATH: pagesPath ?? "" },
  ...(pagesPath !== undefined
    ? { output: "export" as const, basePath: pagesPath, images: { unoptimized: true } }
    : { cacheComponents: true, partialPrefetching: true }),
};

export default nextConfig;
