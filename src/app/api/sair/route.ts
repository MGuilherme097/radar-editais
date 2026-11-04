import { NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/sessao";

export async function POST(req: Request) {
  const resposta = NextResponse.redirect(new URL("/entrar", req.url), 303);
  resposta.cookies.delete(COOKIE_SESSAO);
  return resposta;
}
