import type { NextConfig } from "next"
import path from "path"

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Fix Vercel workspace-root detection when another package-lock.json exists
   * higher up the tree (e.g. /dadnoos/package-lock.json). Without this, Next.js
   * tries to trace from /vercel/path0 and fails to find .next/lock.
   */
  outputFileTracingRoot: path.join(__dirname),
  // output: "standalone",
}

export default withPWA(nextConfig)
