import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/photo-*",
  },
  {
    protocol: "https",
    hostname: "res.cloudinary.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "upload-services.limgrow.com",
    pathname: "/uploads/**",
  },
  {
    protocol: "https",
    hostname: "qr.sepay.vn",
    pathname: "/img",
  },
];

if (supabaseHostname) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseHostname,
    pathname: "/storage/v1/object/public/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
