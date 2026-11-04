// Coleta diária: busca no Prosas, tria e grava só o que é novo.
import { gravarColeta, lerOportunidades, registrarFalhaColeta, type InfoColeta } from "@/lib/armazenamento";
import { listarAbertosProsas, paraOportunidade, triar } from "@/lib/coletaProsas";
import type { Oportunidade } from "@/types/oportunidade";

export type ResultadoColeta = InfoColeta & { titulosNovos: string[]; prazosAtualizados: number };

export async function executarColeta({ simular = false } = {}): Promise<ResultadoColeta> {
  const em = new Date().toISOString();
  const clientId = process.env.PROSAS_CLIENT_ID;
  try {
    if (!clientId) throw new Error("PROSAS_CLIENT_ID não configurado.");
    const [abertos, atuais] = await Promise.all([listarAbertosProsas(clientId), lerOportunidades()]);
    const porId = new Map(atuais.map((o) => [o.id, o]));

    const novas: Oportunidade[] = [];
    const prazos: Record<string, Pick<Oportunidade, "prazo" | "inscricoesContinuas">> = {};
    let aprovados = 0;
    for (const e of abertos) {
      const id = `prosas-${e.id}`;
      const existente = porId.get(id);
      if (existente) {
        // Prorrogações: o prazo do Prosas vale mais que o guardado.
        if (e.prazo && e.prazo !== existente.prazo) prazos[id] = { prazo: e.prazo, inscricoesContinuas: false };
        continue;
      }
      const t = triar(e);
      if (!t) continue;
      aprovados++;
      novas.push(paraOportunidade(e, t, em));
    }

    const info: InfoColeta = { em, abertos: abertos.length, aprovados, novos: novas.length };
    if (!simular) await gravarColeta(novas, prazos, info);
    return { ...info, titulosNovos: novas.map((o) => o.titulo), prazosAtualizados: Object.keys(prazos).length };
  } catch (e) {
    const info: InfoColeta = { em, abertos: 0, aprovados: 0, novos: 0, erro: e instanceof Error ? e.message : String(e) };
    if (!simular) await registrarFalhaColeta(info).catch(() => undefined);
    return { ...info, titulosNovos: [], prazosAtualizados: 0 };
  }
}
