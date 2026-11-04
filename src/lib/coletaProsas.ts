// Coleta de editais abertos no Prosas e triagem por palavras-chave (sem IA).
//
// API NÃO OFICIAL: é a mesma que o site do Prosas usa no navegador (token "public",
// sem login). Pode mudar ou ser bloqueada sem aviso. Consultar no máximo uma vez por dia.
// O client_id fica em PROSAS_CLIENT_ID (.env.local e Vercel), fora do Git.
//
// Este arquivo não importa nada do Next, para também rodar direto no Node (testes e scripts).
import type { Oportunidade } from "../types/oportunidade";

const TOKEN_URL = "https://prosas.com.br/auth/oauth2/token";
const LISTA_URL =
  "https://prosas.com.br/selecao/api/v2/third_party/oportunidades/inscricoes_abertas?include=area_interesses,incentivador";

type ItemProsas = {
  id: string;
  attributes: {
    nome?: string;
    nome_empresa?: string;
    encerramento_das_inscricoes?: string | null;
    inicio_inscricoes?: string | null;
    prazo?: string;
  };
  relationships?: { area_interesses?: { data?: { id: string }[] } };
};

export type EditalProsas = {
  id: string;
  titulo: string;
  financiador: string;
  prazo: string | null;
  inicio: string | null;
  prazoDefinido: boolean;
  areas: string[];
};

/** Áreas do Prosas: 1 Educação, 2 Formação para o trabalho. */
const AREAS_EDUCACAO = ["1", "2"];

async function obterToken(clientId: string) {
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, scope: "public" }),
    cache: "no-store",
  });
  const j = (await r.json().catch(() => ({}))) as { access_token?: string };
  if (!j.access_token) throw new Error(`Prosas não liberou o token (HTTP ${r.status}). O client_id pode ter mudado.`);
  return j.access_token;
}

/** Todos os editais com inscrições abertas (hoje ~400, em páginas de 100). */
export async function listarAbertosProsas(clientId: string): Promise<EditalProsas[]> {
  const token = await obterToken(clientId);
  const editais: EditalProsas[] = [];
  let pagina = 1;
  let ultima = 1;
  do {
    const r = await fetch(`${LISTA_URL}&page[page]=${pagina}&page[size]=100`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`Prosas respondeu ${r.status} na página ${pagina}`);
    const j = (await r.json()) as { data?: ItemProsas[]; links?: { last?: number | string } };
    ultima = Math.min(Number(j.links?.last ?? 1) || 1, 20); // trava de segurança
    for (const item of j.data ?? []) {
      const a = item.attributes;
      if (!a.nome) continue;
      editais.push({
        id: String(item.id),
        titulo: a.nome.replace(/\s+/g, " ").trim(),
        financiador: (a.nome_empresa ?? "").replace(/\s+/g, " ").trim(),
        prazo: a.encerramento_das_inscricoes ? a.encerramento_das_inscricoes.slice(0, 10) : null,
        inicio: a.inicio_inscricoes ? a.inicio_inscricoes.slice(0, 10) : null,
        prazoDefinido: a.prazo === "definido",
        areas: (item.relationships?.area_interesses?.data ?? []).map((x) => x.id),
      });
    }
    pagina++;
  } while (pagina <= ultima);
  return editais;
}

// ---------- Triagem ----------

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Em ordem de prioridade: o primeiro tema que casar é o do edital. */
const TEMAS: { tema: string; nota: number; termos: RegExp }[] = [
  {
    tema: "Educação básica",
    nota: 8,
    termos:
      /\b(educacao basica|escolas?|escolar|alfabetiza\w*|professor\w*|docente|gestao escolar|ensino (fundamental|medio)|educacao infantil|eja|pedagogic\w*|letramento)\b/,
  },
  {
    tema: "Infância e adolescência",
    nota: 7,
    termos: /\b(crianca\w*|adolescen\w*|infancia|infantojuvenil|juventude|jovens?|fia|cmdca|primeira infancia)\b/,
  },
  { tema: "Educação", nota: 7, termos: /\b(educa\w*|formacao|capacitacao|qualificacao profissional|aprendiz\w*|leitura)\b/ },
  {
    tema: "Periferias e territórios",
    nota: 6,
    termos: /\b(periferi\w*|territori\w*|favelas?|comunidades?|comunitari\w*|quilombo\w*|vulnerab\w*)\b/,
  },
  { tema: "Pessoa idosa", nota: 5, termos: /\b(idos[oa]s?|envelhec\w*)\b/ },
];

/** Fora do perfil mesmo quando citam educação (bolsas acadêmicas, pesquisa de laboratório etc.). */
const EXCLUIR =
  /\b(bolsas? de (extensao|iniciacao|pos|mestrado|doutorado|pesquisa)|extensao (tecnologica|universitaria)|professor visitante|iniciacao cientifica|pos-?graduacao|mestrado|doutorado|bioterio\w*|residencia (medica|multiprofissional)|intercambio|startups?|fapesp|pipe|eficiencia energetica|carnaval|registro de entidades)\b/;

/** Financiadores que aceitam projeto de qualquer tema (crescer conforme aparecerem casos). */
const TEMA_LIVRE =
  /\b(edp|petrobras|itau|bndes|cemig|kinross|vale|crianca esperanca|votorantim|bradesco|santander|natura|gerdau|usiminas|arcelor\w*|neoenergia|energisa|enel|copel|sabesp|projetos incentivados|incentivad[oa]s)\b/;

export type Triagem = { tema: string; nota: number; motivo: string } | null;

/** null = fora do perfil. */
export function triar(e: EditalProsas): Triagem {
  const texto = semAcento(`${e.titulo} ${e.financiador}`);
  if (EXCLUIR.test(texto)) return null;
  const areaEducacao = e.areas.some((a) => AREAS_EDUCACAO.includes(a));

  for (const t of TEMAS) {
    const achado = texto.match(t.termos);
    if (achado) {
      const nota = Math.min(9, t.nota + (areaEducacao ? 1 : 0));
      return { tema: t.tema, nota, motivo: `triagem por palavras-chave (sem IA): "${achado[0]}"` };
    }
  }
  const livre = texto.match(TEMA_LIVRE);
  if (livre) return { tema: "Outros", nota: 5, motivo: `financiador aceita temas variados (sem IA): "${livre[0]}"` };
  return null;
}

// ---------- Conversão para o formato do radar ----------

const TIPOS = /^(chamamento publico|chamada publica|edital|fomento|bolsa|premiacao|premio|credenciamento|selecao)$/;

/** "POMERODE  SC - CHAMAMENTO PÚBLICO - ..." -> local "Pomerode SC", tipo "Chamamento público". */
function localETipo(titulo: string) {
  const partes = titulo.split(" - ").map((p) => p.trim());
  if (partes.length < 3 || !TIPOS.test(semAcento(partes[1]).toLowerCase())) return { local: "", tipo: "" };
  const capitalizar = (s: string) =>
    s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, esp: string, l: string) => esp + l.toUpperCase()).replace(/\b(Sc|Sp|Rj|Mg|Rs|Pr|Ba|Pe|Ce|Go|Df|Es|Pa|Am|Ma|Pb|Rn|Al|Se|Pi|Mt|Ms|To|Ro|Ac|Ap|Rr)\b/g, (uf) => uf.toUpperCase());
  const tipo = partes[1].charAt(0).toUpperCase() + partes[1].slice(1).toLowerCase();
  return { local: partes[0] === "BRASIL" ? "Nacional" : capitalizar(partes[0]), tipo };
}

export function paraOportunidade(e: EditalProsas, t: NonNullable<Triagem>, agora: string): Oportunidade {
  const { local, tipo } = localETipo(e.titulo);
  return {
    id: `prosas-${e.id}`,
    titulo: e.titulo,
    financiador: e.financiador,
    fonte: "Prosas — Central de Editais",
    link: `https://produtos.prosas.com.br/editais/edital?edital_id=${e.id}`,
    tema: t.tema,
    local,
    tipo,
    prazo: e.prazo,
    inscricoesContinuas: !e.prazo && !e.prazoDefinido,
    publicado: e.inicio,
    coletadoEm: agora,
    valorPorProjeto: null,
    valorTotal: null,
    objetivo: "",
    quemPode: "",
    contrapartida: "",
    pontosAtencao: [],
    proximoPasso: "",
    fonteResumo: "",
    motivoTriagem: t.motivo,
    nota: t.nota,
    excecaoPorte: null,
  };
}
