"use client";

import { useState } from "react";
import StatusControle from "@/components/StatusControle";
import { dataBr } from "@/lib/radar";
import type { Acompanhamento } from "@/types/oportunidade";

/** Caixa de status da página do edital (guarda o estado localmente após salvar). */
export default function StatusDetalhe({ id, titulo, inicial }: { id: string; titulo: string; inicial?: Acompanhamento }) {
  const [acomp, setAcomp] = useState(inicial);
  return (
    <div className="grid gap-2">
      <StatusControle
        id={id}
        titulo={titulo}
        status={acomp?.status ?? "Nova"}
        onSalvo={(mapa) => setAcomp(mapa[id])}
      />
      {acomp?.em && <p className="text-xs text-suave">Atualizado em {dataBr(acomp.em)}</p>}
      {acomp?.status === "Descartada" && acomp.motivoDescarte && (
        <p className="border-l-2 border-linha pl-2 text-sm text-suave">
          <b className="text-tinta">Motivo do descarte: </b>
          {acomp.motivoDescarte}
        </p>
      )}
    </div>
  );
}
