"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InfoColeta } from "@/lib/armazenamento";

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Mostra a última coleta automática e permite rodar uma agora. */
export default function BotaoColetar({ ultima }: { ultima: InfoColeta | null }) {
  const router = useRouter();
  const [rodando, setRodando] = useState(false);
  const [aviso, setAviso] = useState("");

  async function coletar() {
    setRodando(true);
    setAviso("");
    try {
      const r = await fetch("/api/coleta", { method: "POST" });
      const j = (await r.json()) as InfoColeta;
      if (!r.ok || j.erro) throw new Error(j.erro ?? "Falha na busca");
      setAviso(j.novos ? `${j.novos} edital(is) novo(s) no radar.` : "Nenhum edital novo desde a última busca.");
      router.refresh();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Falha na busca");
    } finally {
      setRodando(false);
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-linha bg-superficie px-4 py-3 text-sm">
      <p className="text-suave">
        {ultima ? (
          <>
            Última busca no Prosas: <b className="text-tinta">{dataHora(ultima.em)}</b>
            {ultima.erro ? (
              <span className="text-urgente"> · falhou ({ultima.erro})</span>
            ) : (
              <> · {ultima.novos} novo(s) entre {ultima.abertos} editais abertos</>
            )}
          </>
        ) : (
          "Busca automática no Prosas: todo dia pela manhã."
        )}
        {aviso && <span className="ml-2 font-semibold text-azul">{aviso}</span>}
      </p>
      <button
        type="button"
        onClick={coletar}
        disabled={rodando}
        className="rounded-lg border border-azul px-3 py-1.5 font-semibold text-azul hover:bg-azul-claro disabled:opacity-60"
      >
        {rodando ? "Buscando…" : "Buscar novos editais"}
      </button>
    </div>
  );
}
