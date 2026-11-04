import type { ReactNode } from "react";
import Link from "next/link";
import MenuLateral from "@/components/MenuLateral";

/** Casca do painel: barra de topo + menu lateral. */
export default function LayoutPainel({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-linha bg-superficie">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-azul">
              radar<span className="text-magenta">.</span>
            </span>
            <span className="text-sm font-semibold text-tinta max-sm:hidden">Radar de Editais</span>
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-magenta">Instituto Ânima</span>
        </div>
      </header>
      <div className="flex flex-1 max-md:flex-col">
        <MenuLateral />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
