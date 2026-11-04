// Formatação específica do one page em PDF.
import type { Oportunidade } from "@/types/oportunidade";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Cor de destaque por tema, como os one pages feitos à mão (cada edital com seu tom). */
export function corDoTema(tema: string): { forte: string; claro: string } {
  if (/educa/i.test(tema)) return { forte: "#0b3d91", claro: "#eef2fa" };
  if (/inf[aâ]ncia|adolesc/i.test(tema)) return { forte: "#1d5f7a", claro: "#eaf2f6" };
  if (/periferi|territ/i.test(tema)) return { forte: "#5b3f8c", claro: "#f2eff8" };
  if (/idos/i.test(tema)) return { forte: "#8a4b14", claro: "#f8f1e9" };
  return { forte: "#b1197c", claro: "#fbeef6" };
}

/** "R$ 2 mi", "R$ 500 mil", "R$ 30,24 mi". */
export function valorCompacto(v: number): string {
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  if (v >= 1_000_000) return `R$ ${fmt(v / 1_000_000)} mi`;
  if (v >= 1_000) return `R$ ${fmt(v / 1_000)} mil`;
  return `R$ ${fmt(v)}`;
}

/** Destaque do prazo no canto da folha: "04 dez" + "2026". */
export function prazoPartes(o: Oportunidade): { destaque: string; complemento: string } {
  if (!o.prazo) {
    return o.inscricoesContinuas
      ? { destaque: "Contínuo", complemento: "fluxo de inscrições" }
      : { destaque: "Sem data", complemento: "confira no edital" };
  }
  const [a, m, d] = o.prazo.split("-");
  return { destaque: `${d} ${MESES[Number(m) - 1]}`, complemento: a };
}

/** Linha de apoio abaixo do título: tipo, tema e local. */
export function fraseLocalTipo(o: Oportunidade): string {
  const partes = [o.tipo, o.local && o.local !== "Nacional" ? `em ${o.local}` : o.local].filter(Boolean);
  if (partes.length) return partes.join(" · ");
  return `Oportunidade de captação encontrada em ${o.fonte}`;
}

/** Linha acima do título, como "CNPq · Petrobras · Chamada Pública nº 31/2026": até 2 órgãos + tema. */
export function sobretitulo(o: Oportunidade): string {
  const orgaos = o.financiador
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  return [...orgaos, o.tema].filter(Boolean).join(" · ");
}

/** Onde se inscrever; cadastro manual da equipe não tem "fonte" útil, então usa o financiador. */
export function fonteLegivel(o: Oportunidade): string {
  return o.origem === "equipe" ? `site do ${o.financiador || "financiador"}` : o.fonte;
}

/** Até 3 fatos curtos na linha abaixo do valor, só com o que a prospecção trouxe. */
export function fatos(o: Oportunidade): { forte: string; texto: string }[] {
  const reaisCheio = (v: number) => "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  const lista = [
    o.tema && { forte: o.tema, texto: "é o tema da chamada" },
    o.local && { forte: o.local, texto: "é a abrangência" },
    o.valorPorProjeto && o.valorTotal && { forte: reaisCheio(o.valorTotal), texto: "no total da chamada" },
    o.inscricoesContinuas && { forte: "Fluxo contínuo", texto: "de inscrições" },
    o.publicado && { forte: o.publicado.split("-").reverse().join("/"), texto: "é a data de publicação" },
  ];
  return lista.filter((f): f is { forte: string; texto: string } => Boolean(f)).slice(0, 3);
}

export function dominio(link: string): string {
  try {
    const u = new URL(link);
    const texto = u.hostname.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname : "");
    return texto.length > 60 ? texto.slice(0, 58) + "…" : texto;
  } catch {
    return link;
  }
}
