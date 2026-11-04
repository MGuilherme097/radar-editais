// Persistência do radar. Só pode ser importado por páginas de servidor e rotas /api.
//
// - Com as chaves do Upstash no ambiente (Vercel): grava no Redis pela API REST (fetch, sem pacote extra).
// - Sem as chaves (máquina local): lê e grava os arquivos data/*.json, como antes.
//
// Chaves no Redis (preenchidas pela primeira vez com scripts/migrar-upstash.mjs):
//   radar:oportunidades   string  JSON com a lista de oportunidades
//   radar:acompanhamento  hash    id da oportunidade -> JSON do acompanhamento
//   radar:descartes       lista   JSON de cada descarte, em ordem de registro
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Acompanhamento, Descarte, MapaAcompanhamento, Oportunidade } from "@/types/oportunidade";

const PASTA = join(process.cwd(), "data");

const CHAVES = {
  oportunidades: "radar:oportunidades",
  acompanhamento: "radar:acompanhamento",
  descartes: "radar:descartes",
} as const;

// A integração da Vercel cria KV_REST_API_*; o painel do Upstash mostra UPSTASH_REDIS_REST_*.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const usandoRedis = Boolean(REDIS_URL && REDIS_TOKEN);

/** Envia comandos ao Upstash numa única requisição e devolve o resultado de cada um. */
async function redis(...comandos: (string | number)[][]): Promise<unknown[]> {
  const r = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(comandos),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Upstash respondeu ${r.status}`);
  const respostas = (await r.json()) as { result?: unknown; error?: string }[];
  const falha = respostas.find((x) => x.error);
  if (falha) throw new Error(`Upstash: ${falha.error}`);
  return respostas.map((x) => x.result);
}

/** HGETALL chega como [campo, valor, campo, valor, ...]. */
function mapaDoHash(plano: unknown): MapaAcompanhamento {
  const lista = Array.isArray(plano) ? (plano as string[]) : [];
  const mapa: MapaAcompanhamento = {};
  for (let i = 0; i + 1 < lista.length; i += 2) mapa[lista[i]] = JSON.parse(lista[i + 1]) as Acompanhamento;
  return mapa;
}

// ---------- Arquivos locais ----------

async function lerJson<T>(arquivo: string, padrao: T): Promise<T> {
  try {
    return JSON.parse(await readFile(join(PASTA, arquivo), "utf8")) as T;
  } catch {
    return padrao;
  }
}

async function gravarJson(arquivo: string, dados: unknown) {
  await writeFile(join(PASTA, arquivo), JSON.stringify(dados, null, 2) + "\n", "utf8");
}

// Gravações locais em fila para dois PATCH simultâneos não se atropelarem.
let fila: Promise<unknown> = Promise.resolve();
function emFila<T>(tarefa: () => Promise<T>): Promise<T> {
  const p = fila.then(tarefa, tarefa);
  fila = p.catch(() => undefined);
  return p;
}

// ---------- Leitura ----------

// oportunidades: hoje é uma cópia do banco do artifact (28/10–03/11/2026); depois virá da coleta.
export async function lerOportunidades(): Promise<Oportunidade[]> {
  if (usandoRedis) {
    const [json] = await redis(["GET", CHAVES.oportunidades]);
    if (typeof json === "string") return JSON.parse(json) as Oportunidade[];
    // Redis ainda sem a lista: usa a do repositório até a migração rodar.
  }
  return lerJson<Oportunidade[]>("oportunidades.json", []);
}

export async function lerAcompanhamento(): Promise<MapaAcompanhamento> {
  if (!usandoRedis) return lerJson<MapaAcompanhamento>("acompanhamento.json", {});
  const [plano] = await redis(["HGETALL", CHAVES.acompanhamento]);
  return mapaDoHash(plano);
}

export async function lerDescartes(): Promise<Descarte[]> {
  if (!usandoRedis) return lerJson<Descarte[]>("descartes.json", []);
  const [lista] = await redis(["LRANGE", CHAVES.descartes, 0, -1]);
  return (Array.isArray(lista) ? (lista as string[]) : []).map((x) => JSON.parse(x) as Descarte);
}

// ---------- Gravação ----------

/** Grava só as linhas enviadas, para uma aba aberta não sobrescrever o trabalho de outra. Devolve o mapa completo. */
export async function mesclarAcompanhamento(alteracoes: MapaAcompanhamento): Promise<MapaAcompanhamento> {
  if (usandoRedis) {
    const pares = Object.entries(alteracoes).flatMap(([id, a]) => [id, JSON.stringify(a)]);
    const [, plano] = await redis(["HSET", CHAVES.acompanhamento, ...pares], ["HGETALL", CHAVES.acompanhamento]);
    return mapaDoHash(plano);
  }
  return emFila(async () => {
    const novo = { ...(await lerJson<MapaAcompanhamento>("acompanhamento.json", {})), ...alteracoes };
    await gravarJson("acompanhamento.json", novo);
    return novo;
  });
}

export async function registrarDescarte(d: Descarte): Promise<void> {
  if (usandoRedis) {
    await redis(["RPUSH", CHAVES.descartes, JSON.stringify(d)]);
    return;
  }
  await emFila(async () => {
    const lista = await lerJson<Descarte[]>("descartes.json", []);
    lista.push(d);
    await gravarJson("descartes.json", lista);
  });
}
