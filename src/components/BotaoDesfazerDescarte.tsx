"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MapaAcompanhamento, Status } from "@/types/oportunidade";

type Props = {
  id: string;
  /** Status de antes do descarte; descartes antigos não têm e voltam para "Nova". */
  statusAnterior?: Status;
  /** Sem callback, recarrega os dados da página (ex.: histórico de descartes). */
  onDesfeito?: (mapa: MapaAcompanhamento) => void;
};

/** Volta a oportunidade ao status anterior e tira o descarte do histórico. */
export default function BotaoDesfazerDescarte({ id, statusAnterior = "Nova", onDesfeito }: Props) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function desfazer() {
    const ok = window.confirm(
      `Desfazer o descarte? A oportunidade volta para "${statusAnterior}" e o motivo sai do histórico de descartes.`,
    );
    if (!ok) return;
    setSalvando(true);
    setErro("");
    try {
      const r = await fetch("/api/acompanhamento", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: statusAnterior }),
      });
      if (!r.ok) throw new Error();
      const mapa = (await r.json()) as MapaAcompanhamento;
      if (onDesfeito) onDesfeito(mapa);
      else router.refresh();
    } catch {
      setErro("Não foi possível desfazer. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={desfazer}
        disabled={salvando}
        className="justify-self-start rounded-lg border border-azul px-3 py-1.5 text-sm font-semibold text-azul hover:bg-azul-claro disabled:opacity-60"
      >
        {salvando ? "Desfazendo…" : "↶ Desfazer descarte"}
      </button>
      {erro && <p className="text-xs text-urgente">{erro}</p>}
    </div>
  );
}
