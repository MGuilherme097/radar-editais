import { NextResponse } from "next/server";
import { COOKIE_SESSAO, DURACAO_SESSAO, senhaConfere, senhaConfigurada, tokenDaSessao } from "@/lib/sessao";

/** Só aceita voltar para caminhos do próprio site. */
function destinoSeguro(de: string) {
  return de.startsWith("/") && !de.startsWith("//") && !de.startsWith("/\\") && !de.startsWith("/entrar") ? de : "/";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const senha = String(form.get("senha") ?? "");
  const destino = destinoSeguro(String(form.get("de") ?? "/"));

  if (!senhaConfigurada()) return NextResponse.redirect(new URL(destino, req.url), 303);

  if (!senhaConfere(senha)) {
    await new Promise((r) => setTimeout(r, 1000)); // freia tentativas em série
    const volta = new URL("/entrar", req.url);
    volta.searchParams.set("erro", "1");
    volta.searchParams.set("de", destino);
    return NextResponse.redirect(volta, 303);
  }

  const resposta = NextResponse.redirect(new URL(destino, req.url), 303);
  resposta.cookies.set(COOKIE_SESSAO, tokenDaSessao(), {
    httpOnly: true,
    secure: new URL(req.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SESSAO,
  });
  return resposta;
}
