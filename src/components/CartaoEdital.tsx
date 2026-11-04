"use client";

import Link from "next/link";
import Etiquetas from "@/components/Etiquetas";
import SeloPrazo, { TextoFaltam } from "@/components/SeloPrazo";
import StatusControle from "@/components/StatusControle";
import { textoValor } from "@/lib/radar";
import type { Acompanhamento, MapaAcompanhamento, Oportunidade } from "@/types/oportunidade";

type Props = {
  o: Oportunidade;
  acomp?: Acompanhamento;
  onSalvo: (mapa: MapaAcompanhamento) => void;
};

/** Card da grade: prazo, título, financiador, valor e status; o detalhe abre em /editais/[id]. */
export default function CartaoEdital({ o, acomp, onSalvo }: Props) {
  const status = acomp?.status ?? "Nova";
  const descartada = status === "Descartada";
  const valor = textoValor(o);

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-linha bg-superficie shadow-sm transition hover:-translate-y-0.5 hover:border-azul/40 hover:shadow-md ${
        descartada ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <SeloPrazo o={o} />
        <div className="grid min-w-0 gap-1">
          <TextoFaltam o={o} />
          <p className="line-clamp-2 text-xs text-suave" title={o.financiador}>
            {o.financiador || "Financiador não informado"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4">
        <h2 className="line-clamp-3 text-[15px] font-bold leading-snug text-tinta">
          {/* O link cobre o card inteiro; o seletor de status fica por cima (z-10). */}
          <Link href={`/editais/${o.id}`} className="after:absolute after:inset-0 after:rounded-2xl group-hover:text-azul">
            {o.titulo}
          </Link>
        </h2>
        <Etiquetas o={o} />
        <p className="mt-auto pt-1 text-sm">
          <span className="font-semibold text-suave">Valor: </span>
          {valor ?? <span className="italic text-suave">a confirmar no edital</span>}
        </p>
      </div>

      {descartada && acomp?.motivoDescarte && (
        <p className="mx-4 mt-2 line-clamp-2 border-l-2 border-linha pl-2 text-xs text-suave">
          <b className="text-tinta">Motivo: </b>
          {acomp.motivoDescarte}
        </p>
      )}

      <div className="relative z-10 mt-3 border-t border-linha p-4 pt-3">
        <StatusControle id={o.id} titulo={o.titulo} status={status} onSalvo={onSalvo} compacto />
        <p className="mt-1.5 text-[11px] text-suave">{o.fonte}</p>
      </div>
    </article>
  );
}
