import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The git root (and a stray package-lock.json) is the user's home
  // directory, several levels above this project. Pin Turbopack's root
  // here explicitly so it doesn't try to scan up past this folder.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
