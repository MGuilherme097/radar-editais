// Formato vindo da coleta do bot (mesmo do banco do artifact "Radar de Editais Ânima").
export type Oportunidade = {
  id: string;
  titulo: string;
  financiador: string;
  fonte: string;
  link: string;
  tema: string;
  local: string;
  tipo: string;
  /** Data-limite de inscrição (AAAA-MM-DD); null quando não há data. */
  prazo: string | null;
  inscricoesContinuas: boolean;
  publicado: string | null;
  coletadoEm: string;
  valorPorProjeto: number | null;
  valorTotal: number | null;
  objetivo: string;
  quemPode: string;
  contrapartida: string;
  pontosAtencao: string[];
  proximoPasso: string;
  fonteResumo: string;
  motivoTriagem: string;
  /** Nota de aderência dada na triagem (0 a 10). */
  nota: number | null;
  /** Texto explicando por que entra mesmo abaixo do porte mínimo (Plano 2026–2030). */
  excecaoPorte: string | null;
  /** "equipe" quando foi cadastrada à mão, não pelo bot. */
  origem?: string;
};

export const STATUS = [
  "Nova",
  "Em análise",
  "Em aprovação interna",
  "Vamos submeter",
  "Submetida",
  "Descartada",
] as const;

export type Status = (typeof STATUS)[number];

export type Acompanhamento = {
  status: Status;
  em: string;
  por?: string | null;
  nota?: string;
  motivoDescarte?: string;
  /** Status de antes do descarte, para o "Desfazer descarte" devolver. */
  statusAnterior?: Status;
};

/** Chave = id da oportunidade. */
export type MapaAcompanhamento = Record<string, Acompanhamento>;

/** Cópia da oportunidade no momento do descarte: ela some do portal quando encerra. */
export type Descarte = {
  oportunidadeId: string;
  motivo: string;
  em: string;
  titulo: string;
  financiador: string;
  fonte: string;
  link: string;
  tema: string;
  local: string;
  prazo: string | null;
  valorPorProjeto: number | null;
  valorTotal: number | null;
  nota: number | null;
  motivoTriagem: string;
  objetivo: string;
};
