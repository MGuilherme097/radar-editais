"use client";

import { useMemo, useState } from "react";
import CartaoEdital from "@/components/CartaoEdital";
import { EM_ANDAMENTO, FILTROS_INICIAIS, filtrar, ordenar, statusDe, type Filtros } from "@/lib/radar";
import { STATUS, type MapaAcompanhamento, type Oportunidade } from "@/types/oportunidade";

type Props = {
  oportunidades: Oportunidade[];
  acompanhamentoInicial: MapaAcompanhamento;
};

const campo = "rounded-lg border border-linha bg-superficie px-2.5 py-1.5 text-sm text-tinta";

export default function PainelEditais({ oportunidades, acompanhamentoInicial }: Props) {
  const [acomp, setAcomp] = useState(acompanhamentoInicial);
  const [f, setF] = useState<Filtros>(FILTROS_INICIAIS);

  const temas = useMemo(
    () => [...new Set(oportunidades.map((o) => o.tema).filter(Boolean))].sort(),
    [oportunidades],
  );
  const visiveis = useMemo(() => filtrar(oportunidades, acomp, f).sort(ordenar), [oportunidades, acomp, f]);
  const andamento = visiveis.filter((o) => EM_ANDAMENTO.includes(statusDe(acomp, o.id)));
  const demais = visiveis.filter((o) => !EM_ANDAMENTO.includes(statusDe(acomp, o.id)));

  const muda = <K extends keyof Filtros>(k: K, v: Filtros[K]) => setF((atual) => ({ ...atual, [k]: v }));
  const grade = (lista: Oportunidade[]) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
      {lista.map((o) => (
        <CartaoEdital key={o.id} o={o} acomp={acomp[o.id]} onSalvo={setAcomp} />
      ))}
    </div>
  );

  return (
    <div className="grid gap-6">
      <section aria-label="Filtros" className="flex flex-wrap items-end gap-3 rounded-2xl border border-linha bg-superficie p-4">
        <label className="grid flex-1 basis-60 gap-1 text-xs font-semibold text-suave">
          Buscar
          <input
            type="search"
            value={f.busca}
            onChange={(e) => muda("busca", e.target.value)}
            placeholder="Título, financiador ou cidade"
            className={campo}
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-suave">
          Tema
          <select value={f.tema} onChange={(e) => muda("tema", e.target.value)} className={campo}>
            <option value="">Todos</option>
            {temas.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-suave">
          Prazo
          <select value={f.prazo} onChange={(e) => muda("prazo", e.target.value as Filtros["prazo"])} className={campo}>
            <option value="">Qualquer prazo</option>
            <option value="30">Encerra em até 30 dias</option>
            <option value="60">Encerra em até 60 dias</option>
            <option value="continuo">Contínuas ou sem data</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-suave">
          Status da equipe
          <select value={f.status} onChange={(e) => muda("status", e.target.value as Filtros["status"])} className={campo}>
            <option value="">Todos</option>
            {STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-tinta">
          <input
            type="checkbox"
            checked={f.mostrarDescartadas}
            onChange={(e) => muda("mostrarDescartadas", e.target.checked)}
            className="size-4 accent-azul"
          />
          Mostrar descartadas
        </label>
      </section>

      <p className="text-sm text-suave" aria-live="polite">
        {visiveis.length} de {oportunidades.length} oportunidades
      </p>

      {andamento.length > 0 && (
        <section className="grid gap-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-magenta">
            Propostas em andamento ({andamento.length})
          </h2>
          {grade(andamento)}
        </section>
      )}

      <section className="grid gap-3">
        {andamento.length > 0 && (
          <h2 className="text-xs font-bold uppercase tracking-widest text-magenta">
            Oportunidades do radar ({demais.length})
          </h2>
        )}
        {demais.length ? (
          grade(demais)
        ) : (
          <div className="rounded-2xl border border-dashed border-linha bg-superficie p-8 text-center text-suave">
            Nenhuma oportunidade com esses filtros.
          </div>
        )}
      </section>
    </div>
  );
}
