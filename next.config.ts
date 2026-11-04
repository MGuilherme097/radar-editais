import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Recharts 3 precisa ser transpilado pelo Next (ver guia de estrutura).
  transpilePackages: ["recharts"],
  // Na Vercel, data/*.json só serve de reserva enquanto o Upstash não tem os dados (ver lib/armazenamento.ts).
  outputFileTracingIncludes: { "/**": ["./data/*.json"] },
};

export default nextConfig;
