import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",

  // Redirige www → sin www con 301 (permanente, bueno para SEO)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.lucianocortez.com.ar" }],
        destination: "https://lucianocortez.com.ar/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;