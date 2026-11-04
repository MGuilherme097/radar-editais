// Coleta de editais no Prosas.
// - GET: chamado pelo cron da Vercel (vercel.json), com "Authorization: Bearer <CRON_SECRET>".
// - POST: botão "Buscar novos editais" no app, com o cookie de login da equipe.
// ?simular=1 mostra o que entraria, sem gravar.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { executarColeta } from "@/lib/coleta";
import { COOKIE_SESSAO, tokenValido } from "@/lib/sessao";

export const maxDuration = 60;

function simular(req: Request) {
  return new URL(req.url).searchParams.get("simular") === "1";
}

export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  const r = await executarColeta({ simular: simular(req) });
  return NextResponse.json(r, { status: r.erro ? 502 : 200 });
}

export async function POST(req: Request) {
  if (!tokenValido((await cookies()).get(COOKIE_SESSAO)?.value)) {
    return NextResponse.json({ erro: "Sessão expirada. Recarregue a página e entre com a senha." }, { status: 401 });
  }
  const r = await executarColeta({ simular: simular(req) });
  return NextResponse.json(r, { status: r.erro ? 502 : 200 });
}
