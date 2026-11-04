"use client";

import Link from "next/link";
import { useState } from "react";

/** Baixa o one page em PDF (gerado no servidor) e oferece a prévia em A4. */
export default function BotaoOnePage({ id }: { id: string }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");

  async function baixar() {
    setGerando(true);
    setErro("");
    try {
      const r = await fetch(`/api/one-page/${encodeURIComponent(id)}`);
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.erro ?? "Falha ao gerar o PDF");
      const disp = r.headers.get("Content-Disposition") ?? "";
      const nome = decodeURIComponent(/filename\*=UTF-8''([^;]+)/.exec(disp)?.[1] ?? "one-page.pdf");
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao gerar o PDF");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="grid justify-items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link href={`/one-page/${id}`} className="px-2 py-2 text-sm font-semibold text-azul underline-offset-2 hover:underline">
          Ver prévia
        </Link>
        <button
          type="button"
          onClick={baixar}
          disabled={gerando}
          className="inline-flex items-center gap-2 rounded-lg bg-magenta px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4" aria-hidden>
            <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {gerando ? "Gerando PDF…" : "Gerar one page (PDF)"}
        </button>
      </div>
      {erro && <p className="text-xs text-urgente">{erro}</p>}
    </div>
  );
}
