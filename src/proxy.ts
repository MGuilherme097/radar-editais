// Barra quem não entrou com a senha da equipe (ver lib/sessao.ts).
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, tokenValido } from "@/lib/sessao";

export function proxy(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;
  if (tokenValido(req.cookies.get(COOKIE_SESSAO)?.value)) return NextResponse.next();

  // O Edge headless que gera o PDF na máquina local não tem cookie: recebe o token na URL, só no one page.
  if (pathname.startsWith("/one-page/") && tokenValido(searchParams.get("sessao"))) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ erro: "Sessão expirada. Recarregue a página e entre com a senha." }, { status: 401 });
  }
  const entrar = new URL("/entrar", req.url);
  entrar.searchParams.set("de", pathname + search);
  return NextResponse.redirect(entrar);
}

export const config = {
  // Tudo, menos a tela de login, os arquivos estáticos e /api/coleta (que checa cron ou login por conta própria).
  matcher: ["/((?!entrar|api/entrar|api/sair|api/coleta|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
