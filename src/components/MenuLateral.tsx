"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconeGrade, IconeLixeira } from "@/components/Icones";

const ITENS = [
  { href: "/", rotulo: "Editais", Icone: IconeGrade, ativo: (p: string) => p === "/" || p.startsWith("/editais") },
  { href: "/descartes", rotulo: "Descartes", Icone: IconeLixeira, ativo: (p: string) => p.startsWith("/descartes") },
];

export default function MenuLateral() {
  const caminho = usePathname();
  return (
    <nav
      aria-label="Menu principal"
      className="flex shrink-0 gap-1 border-linha bg-superficie max-md:border-b max-md:px-2 md:w-20 md:flex-col md:border-r md:py-4"
    >
      {ITENS.map(({ href, rotulo, Icone, ativo }) => {
        const marcado = ativo(caminho);
        return (
          <Link
            key={href}
            href={href}
            aria-current={marcado ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium transition-colors md:mx-2 md:rounded-lg ${
              marcado ? "text-azul md:bg-azul-claro" : "text-suave hover:text-azul"
            }`}
          >
            <Icone className="size-6" />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
