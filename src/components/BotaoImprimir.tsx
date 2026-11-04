"use client";

import { useEffect } from "react";

/**
 * Abre a janela de impressão do navegador ("Salvar como PDF").
 * Com `automatico`, abre sozinha assim que as fontes da folha carregam.
 */
export default function BotaoImprimir({ automatico = false }: { automatico?: boolean }) {
  useEffect(() => {
    if (!automatico) return;
    let cancelado = false;
    document.fonts.ready.then(() => {
      if (!cancelado) window.print();
    });
    return () => {
      cancelado = true;
    };
  }, [automatico]);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-azul bg-superficie px-4 py-2 font-semibold text-azul hover:bg-azul-claro"
    >
      Imprimir / salvar PDF
    </button>
  );
}
