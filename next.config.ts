import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Necesario para que Docker genere una imagen liviana con solo lo necesario
  output: "standalone",
};

export default nextConfig;