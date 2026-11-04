import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_SESSAO, tokenValido } from "@/lib/sessao";
import {
  lerAcompanhamento,
  lerOportunidades,
  mesclarAcompanhamento,
  registrarDescarte,
  removerDescarte,
} from "@/lib/armazenamento";
import { STATUS, type MapaAcompanhamento, type Status } from "@/types/oportunidade";

/** Segunda checagem além do proxy: esta rota grava dados. */
async function semSessao() {
  if (tokenValido((await cookies()).get(COOKIE_SESSAO)?.value)) return null;
  return NextResponse.json({ erro: "Sessão expirada. Recarregue a página e entre com a senha." }, { status: 401 });
}

export async function GET() {
  return (await semSessao()) ?? NextResponse.json(await lerAcompanhamento());
}

type CorpoPatch = { id: string; status: Status; motivoDescarte?: string };

/** Muda o status de uma oportunidade. Descartar exige motivo, que também vai para o histórico. */
export async function PATCH(req: Request) {
  const negado = await semSessao();
  if (negado) return negado;
  let corpo: CorpoPatch;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const { id, status } = corpo;
  const motivo = corpo.motivoDescarte?.trim().slice(0, 800);
  if (!id || !STATUS.includes(status)) {
    return NextResponse.json({ erro: "id ou status inválido" }, { status: 400 });
  }
  if (status === "Descartada" && !motivo) {
    return NextResponse.json({ erro: "Informe o motivo do descarte" }, { status: 400 });
  }

  const o = (await lerOportunidades()).find((x) => x.id === id);
  if (!o) return NextResponse.json({ erro: "Oportunidade não encontrada" }, { status: 404 });

  const em = new Date().toISOString();
  const atual = (await lerAcompanhamento())[id];
  const estavaDescartada = atual?.status === "Descartada";

  // Sair de "Descartada" desfaz o descarte: ele deixa de valer como motivo no histórico.
  if (estavaDescartada && status !== "Descartada") await removerDescarte(id);

  if (status === "Descartada" && motivo) {
    if (estavaDescartada) await removerDescarte(id); // novo motivo substitui o anterior
    // Base que o Claude lê para ajustar o perfil e os critérios do radar.
    await registrarDescarte({
      oportunidadeId: id,
      motivo,
      em,
      titulo: o.titulo,
      financiador: o.financiador,
      fonte: o.fonte,
      link: o.link,
      tema: o.tema,
      local: o.local,
      prazo: o.prazo,
      valorPorProjeto: o.valorPorProjeto,
      valorTotal: o.valorTotal,
      nota: o.nota,
      motivoTriagem: o.motivoTriagem,
      objetivo: o.objetivo,
    });
  }

  const linha: MapaAcompanhamento = {
    [id]:
      status === "Descartada"
        ? {
            status,
            em,
            motivoDescarte: motivo,
            statusAnterior: estavaDescartada ? atual.statusAnterior : (atual?.status ?? "Nova"),
          }
        : { status, em },
  };
  return NextResponse.json(await mesclarAcompanhamento(linha));
}
