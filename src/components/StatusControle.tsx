"use client";

import { useId, useRef, useState } from "react";
import { STATUS, type MapaAcompanhamento, type Status } from "@/types/oportunidade";

type Props = {
  id: string;
  titulo: string;
  status: Status;
  /** Recebe o mapa completo de acompanhamento devolvido pelo servidor. */
  onSalvo: (mapa: MapaAcompanhamento) => void;
  compacto?: boolean;
};

const LIMITE = 800;

export default function StatusControle({ id, titulo, status, onSalvo, compacto }: Props) {
  const idCampo = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [motivo, setMotivo] = useState("");

  async function salvar(novo: Status, motivoDescarte?: string) {
    setSalvando(true);
    setErro("");
    try {
      const r = await fetch("/api/acompanhamento", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: novo, motivoDescarte }),
      });
      if (!r.ok) throw new Error((await r.json()).erro ?? "Falha ao salvar");
      onSalvo(await r.json());
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  function aoMudar(novo: Status) {
    if (novo === status) return;
    if (novo === "Descartada") {
      setMotivo("");
      dialogo.current?.showModal();
      return;
    }
    salvar(novo);
  }

  async function confirmarDescarte(e: React.FormEvent) {
    e.preventDefault();
    if (!motivo.trim()) return;
    dialogo.current?.close();
    await salvar("Descartada", motivo.trim());
  }

  return (
    <div className="grid gap-1">
      <label htmlFor={idCampo} className={`text-xs font-semibold text-suave ${compacto ? "sr-only" : ""}`}>
        Status da equipe
      </label>
      <select
        id={idCampo}
        value={status}
        disabled={salvando}
        onChange={(e) => aoMudar(e.target.value as Status)}
        className="w-full rounded-lg border border-linha bg-superficie px-2.5 py-1.5 text-sm text-tinta disabled:opacity-60"
      >
        {STATUS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {erro && <p className="text-xs text-urgente">{erro}</p>}

      <dialog
        ref={dialogo}
        aria-labelledby={`${idCampo}-titulo`}
        className="m-auto w-[min(560px,calc(100vw-32px))] rounded-2xl border border-linha bg-superficie p-6 text-tinta shadow-2xl"
      >
        <form onSubmit={confirmarDescarte} className="grid gap-3">
          <h2 id={`${idCampo}-titulo`} className="text-lg font-bold text-azul text-balance">
            Quais os motivos que levaram ao descarte dessa proposta?
          </h2>
          <p className="text-sm text-suave">{titulo}</p>
          <textarea
            required
            autoFocus
            rows={7}
            maxLength={LIMITE}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: não é educação básica (é ensino superior); exige registro prévio no conselho municipal; valor por projeto baixo; público fora das cidades onde atuamos…"
            className="w-full resize-y rounded-xl border border-linha bg-fundo px-3 py-2.5 text-[15px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-suave tabular-nums">
            <span>
              {motivo.length}/{LIMITE} caracteres
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => dialogo.current?.close()}
                className="rounded-lg border border-linha px-4 py-2 text-sm font-semibold text-tinta"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!motivo.trim()}
                className="rounded-lg bg-azul px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Registrar descarte
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </div>
  );
}
