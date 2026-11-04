// Regras do radar usadas no navegador e no servidor (sem acesso a disco aqui).
import type { MapaAcompanhamento, Oportunidade, Status } from "@/types/oportunidade";

/** Propostas que o Instituto já decidiu construir: ficam numa seção própria no topo. */
export const EM_ANDAMENTO: Status[] = ["Em aprovação interna", "Vamos submeter", "Submetida"];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function statusDe(acomp: MapaAcompanhamento, id: string): Status {
  return acomp[id]?.status ?? "Nova";
}

/** Dias corridos de hoje até a data (negativo = já passou). */
export function diasAte(iso: string | null): number | null {
  if (!iso) return null;
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((new Date(a, m - 1, d).getTime() - hoje.getTime()) / 86_400_000);
}

export const dataBr = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10).split("-").reverse().join("/") : "";

export const mesCurto = (iso: string) => MESES[Number(iso.slice(5, 7)) - 1];

export const reais = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

export function textoValor(o: Oportunidade): string | null {
  if (o.valorPorProjeto && o.valorTotal)
    return `até ${reais(o.valorPorProjeto)} por projeto (total ${reais(o.valorTotal)})`;
  if (o.valorPorProjeto) return `até ${reais(o.valorPorProjeto)} por projeto`;
  if (o.valorTotal) return `${reais(o.valorTotal)} (valor citado)`;
  return null;
}

export type Urgencia = "urgente" | "breve" | "longe" | "encerrado" | "sem-data";

/** Com antecedência mínima de 15 dias na triagem, "urgente" é até 20 dias e "breve" até 30. */
export function urgencia(o: Oportunidade): Urgencia {
  const dias = diasAte(o.prazo);
  if (dias == null) return "sem-data";
  if (dias < 0) return "encerrado";
  if (dias <= 20) return "urgente";
  if (dias <= 30) return "breve";
  return "longe";
}

export function textoFaltam(o: Oportunidade): string {
  const dias = diasAte(o.prazo);
  if (dias == null) return o.inscricoesContinuas ? "Fluxo contínuo" : "Sem data";
  if (dias < 0) return "Encerrado";
  if (dias === 0) return "Encerra hoje";
  if (dias === 1) return "Falta 1 dia";
  return `Faltam ${dias} dias`;
}

export const ehEducacao = (tema: string) => /educa/i.test(tema);

export function proximoPasso(o: Oportunidade): string {
  if (o.proximoPasso) return o.proximoPasso;
  return /prosas/i.test(o.fonte)
    ? "Abrir o edital no Prosas (exige login) e ler o regulamento."
    : "Abrir a publicação e ler o edital completo.";
}

/** Prazo mais próximo primeiro; sem data vai para o fim, em ordem alfabética. */
export function ordenar(a: Oportunidade, b: Oportunidade): number {
  const da = diasAte(a.prazo);
  const db = diasAte(b.prazo);
  if (da == null && db == null) return a.titulo.localeCompare(b.titulo);
  if (da == null) return 1;
  if (db == null) return -1;
  return da - db;
}

export type Filtros = {
  busca: string;
  tema: string;
  prazo: "" | "30" | "60" | "continuo";
  status: "" | Status;
  mostrarDescartadas: boolean;
};

export const FILTROS_INICIAIS: Filtros = {
  busca: "",
  tema: "",
  prazo: "",
  status: "",
  mostrarDescartadas: false,
};

export function filtrar(lista: Oportunidade[], acomp: MapaAcompanhamento, f: Filtros) {
  const busca = f.busca.trim().toLowerCase();
  return lista.filter((o) => {
    const st = statusDe(acomp, o.id);
    if (!f.mostrarDescartadas && st === "Descartada" && f.status !== "Descartada") return false;
    if (f.status && st !== f.status) return false;
    if (f.tema && o.tema !== f.tema) return false;
    const dias = diasAte(o.prazo);
    if (f.prazo === "continuo" && dias != null) return false;
    if (f.prazo && f.prazo !== "continuo" && (dias == null || dias > Number(f.prazo))) return false;
    if (busca && ![o.titulo, o.financiador, o.local, o.objetivo].join(" ").toLowerCase().includes(busca))
      return false;
    return true;
  });
}

/** Iniciais do financiador para o "selo" no lugar do logo (não temos logos na coleta). */
export function iniciais(nome: string): string {
  const palavras = nome
    .split(/[\s/—-]+/)
    .filter((p) => p.length > 2 && !/^(de|da|do|das|dos|para)$/i.test(p));
  return (palavras[0]?.[0] ?? "?").toUpperCase() + (palavras[1]?.[0] ?? "").toUpperCase();
}
