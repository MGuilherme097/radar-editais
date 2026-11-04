import { ehEducacao } from "@/lib/radar";
import type { Oportunidade } from "@/types/oportunidade";

export default function Etiquetas({ o }: { o: Oportunidade }) {
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
      {o.tema && (
        <span
          className={`rounded-full px-2 py-0.5 ${
            ehEducacao(o.tema) ? "bg-azul text-white" : "bg-azul-claro text-azul"
          }`}
        >
          {o.tema}
        </span>
      )}
      {o.local && <span className="rounded-full bg-chip px-2 py-0.5 text-suave">{o.local}</span>}
      {o.excecaoPorte && (
        <span title={o.excecaoPorte} className="rounded-full border border-magenta px-2 py-0.5 text-magenta">
          Plano 2026–2030
        </span>
      )}
      {o.origem === "equipe" && (
        <span className="rounded-full border border-magenta px-2 py-0.5 text-magenta">Incluída pela equipe</span>
      )}
    </div>
  );
}
