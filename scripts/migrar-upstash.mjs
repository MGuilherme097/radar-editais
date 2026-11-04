// Copia data/*.json para o Upstash Redis. Rode uma vez, antes de a equipe começar a usar o app na Vercel.
//
//   node --env-file=.env.local scripts/migrar-upstash.mjs            (só grava se o Redis estiver vazio)
//   node --env-file=.env.local scripts/migrar-upstash.mjs --forcar   (substitui o que já estiver lá)
//
// O .env.local precisa de KV_REST_API_URL e KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL/_TOKEN),
// copiados da aba Storage do projeto na Vercel. Esse arquivo não vai para o Git.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error("Faltam KV_REST_API_URL e KV_REST_API_TOKEN no .env.local.");
  process.exit(1);
}

const CHAVES = {
  oportunidades: "radar:oportunidades",
  acompanhamento: "radar:acompanhamento",
  descartes: "radar:descartes",
};

async function redis(...comandos) {
  const r = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(comandos),
  });
  if (!r.ok) throw new Error(`Upstash respondeu ${r.status}: ${await r.text()}`);
  const respostas = await r.json();
  const falha = respostas.find((x) => x.error);
  if (falha) throw new Error(`Upstash: ${falha.error}`);
  return respostas.map((x) => x.result);
}

const ler = async (arquivo, padrao) => {
  try {
    return JSON.parse(await readFile(join(process.cwd(), "data", arquivo), "utf8"));
  } catch {
    return padrao;
  }
};

const forcar = process.argv.includes("--forcar");
const existentes = await redis(...Object.values(CHAVES).map((c) => ["EXISTS", c]));
if (!forcar && existentes.some(Boolean)) {
  console.error(
    "O Redis já tem dados do radar (talvez gravados pela equipe na Vercel). Nada foi alterado.\n" +
      "Use --forcar só se quiser substituí-los pelo conteúdo de data/*.json.",
  );
  process.exit(1);
}

const oportunidades = await ler("oportunidades.json", []);
const acompanhamento = await ler("acompanhamento.json", {});
const descartes = await ler("descartes.json", []);

const comandos = [
  ["DEL", CHAVES.oportunidades, CHAVES.acompanhamento, CHAVES.descartes],
  ["SET", CHAVES.oportunidades, JSON.stringify(oportunidades)],
];
const pares = Object.entries(acompanhamento).flatMap(([id, a]) => [id, JSON.stringify(a)]);
if (pares.length) comandos.push(["HSET", CHAVES.acompanhamento, ...pares]);
if (descartes.length) comandos.push(["RPUSH", CHAVES.descartes, ...descartes.map((d) => JSON.stringify(d))]);

await redis(...comandos);
console.log(
  `Migrado: ${oportunidades.length} oportunidades, ${pares.length / 2} acompanhamentos, ${descartes.length} descartes.`,
);
