// Persistência simples em data/*.json. Só pode ser importado por páginas de servidor e rotas /api.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Descarte, MapaAcompanhamento, Oportunidade } from "@/types/oportunidade";

const PASTA = join(process.cwd(), "data");

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

// oportunidades.json: hoje é uma cópia do banco do artifact (28/10–03/11/2026); depois virá da coleta.
export const lerOportunidades = () => lerJson<Oportunidade[]>("oportunidades.json", []);
export const lerAcompanhamento = () => lerJson<MapaAcompanhamento>("acompanhamento.json", {});
export const lerDescartes = () => lerJson<Descarte[]>("descartes.json", []);

// Gravações em fila para dois PATCH simultâneos não se atropelarem.
let fila: Promise<unknown> = Promise.resolve();
function emFila<T>(tarefa: () => Promise<T>): Promise<T> {
  const p = fila.then(tarefa, tarefa);
  fila = p.catch(() => undefined);
  return p;
}

/** Faz merge só das linhas enviadas, para uma aba aberta não sobrescrever o trabalho de outra. */
export function mesclarAcompanhamento(alteracoes: MapaAcompanhamento) {
  return emFila(async () => {
    const atual = await lerAcompanhamento();
    const novo = { ...atual, ...alteracoes };
    await gravarJson("acompanhamento.json", novo);
    return novo;
  });
}

export function registrarDescarte(d: Descarte) {
  return emFila(async () => {
    const lista = await lerDescartes();
    lista.push(d);
    await gravarJson("descartes.json", lista);
  });
}
