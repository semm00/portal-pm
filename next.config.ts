import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseRemotePatterns = (() => {
  if (!supabaseUrl) {
    return [];
  }

  try {
    const { hostname } = new URL(supabaseUrl);
    return [
      {
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch (error) {
    console.warn(
      "NEXT_PUBLIC_SUPABASE_URL inválida para remotePatterns",
      error
    );
    return [];
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseRemotePatterns,
  },
};

export default nextConfig;
