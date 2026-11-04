import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Recharts 3 precisa ser transpilado pelo Next (ver guia de estrutura).
  transpilePackages: ["recharts"],
};

export default nextConfig;
