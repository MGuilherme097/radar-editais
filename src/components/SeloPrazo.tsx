import { dataBr, mesCurto, textoFaltam, urgencia, type Urgencia } from "@/lib/radar";
import type { Oportunidade } from "@/types/oportunidade";

const CORES: Record<Urgencia, string> = {
  urgente: "bg-urgente-claro text-urgente",
  breve: "bg-breve-claro text-breve",
  longe: "bg-ok-claro text-ok",
  encerrado: "bg-chip text-suave",
  "sem-data": "bg-chip text-azul",
};

/** "Agenda" do prazo: dia grande, mês e quanto falta, na cor da urgência. */
export default function SeloPrazo({ o }: { o: Oportunidade }) {
  const u = urgencia(o);
  if (!o.prazo) {
    return (
      <div className={`grid h-16 w-[4.5rem] shrink-0 place-items-center rounded-xl px-1 text-center text-xs font-bold leading-tight ${CORES[u]}`}>
        {textoFaltam(o)}
      </div>
    );
  }
  return (
    <div
      title={`Inscrições até ${dataBr(o.prazo)}`}
      className={`grid h-16 w-[4.5rem] shrink-0 content-center rounded-xl text-center ${CORES[u]}`}
    >
      <span className="text-2xl font-extrabold leading-none tabular-nums">{o.prazo.slice(8, 10)}</span>
      <span className="text-[11px] font-bold uppercase tracking-widest">
        {mesCurto(o.prazo)}/{o.prazo.slice(2, 4)}
      </span>
    </div>
  );
}

export function TextoFaltam({ o }: { o: Oportunidade }) {
  const u = urgencia(o);
  const cor = u === "urgente" ? "text-urgente" : u === "breve" ? "text-breve" : "text-suave";
  return <span className={`text-xs font-semibold ${cor}`}>{textoFaltam(o)}</span>;
}
