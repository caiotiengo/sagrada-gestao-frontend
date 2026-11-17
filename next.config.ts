import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  // Universal links (iOS) e App Links (Android): os dois arquivos precisam
  // sair como JSON. O AASA não tem extensão e sairia como octet-stream.
  async headers() {
    const json = [
      { key: "Content-Type", value: "application/json" },
      { key: "Cache-Control", value: "public, max-age=3600" },
    ];
    return [
      { source: "/.well-known/apple-app-site-association", headers: json },
      { source: "/.well-known/assetlinks.json", headers: json },
    ];
  },
};

export default nextConfig;
