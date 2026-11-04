// Gera o PDF do one page imprimindo /one-page/[id] com o Edge (ou Chrome) da máquina, em modo headless.
// Não usa pacote extra; o caminho do navegador pode ser forçado com NAVEGADOR_PDF no .env.local.
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lerOportunidades } from "@/lib/armazenamento";
import { localizarNavegador } from "@/lib/navegadorPdf";
import { senhaConfigurada, tokenDaSessao } from "@/lib/sessao";

function rodar(exe: string, args: string[]) {
  return new Promise<void>((ok, falha) => {
    execFile(exe, args, { timeout: 60_000, windowsHide: true }, (erro) => (erro ? falha(erro) : ok()));
  });
}

/** Mesmo padrão dos arquivos feitos à mão: "One page - <título>.pdf". */
function nomeArquivo(titulo: string) {
  const limpo = titulo.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 120);
  return `One page - ${limpo}.pdf`;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = (await lerOportunidades()).find((x) => x.id === decodeURIComponent(id));
  if (!o) return Response.json({ erro: "Oportunidade não encontrada" }, { status: 404 });

  const navegador = localizarNavegador();
  if (!navegador) {
    return Response.json(
      { erro: "PDF no servidor indisponível aqui. Use 'Imprimir / salvar PDF' na prévia do one page." },
      { status: 501 },
    );
  }

  // O navegador headless não leva o cookie de login: o token vai na URL (aceito só em /one-page).
  const pagina = new URL(`/one-page/${encodeURIComponent(o.id)}`, req.url);
  if (senhaConfigurada()) pagina.searchParams.set("sessao", tokenDaSessao());

  const pasta = await mkdtemp(join(tmpdir(), "radar-onepage-"));
  const pdf = join(pasta, "one-page.pdf");
  try {
    await rodar(navegador, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--user-data-dir=${join(pasta, "perfil")}`, // perfil isolado: não interfere no Edge aberto
      "--no-pdf-header-footer",
      "--print-to-pdf-no-header",
      "--virtual-time-budget=8000", // espera as fontes carregarem
      `--print-to-pdf=${pdf}`,
      pagina.toString(),
    ]);
    const conteudo = await readFile(pdf);
    const nome = nomeArquivo(o.titulo);
    return new Response(new Uint8Array(conteudo), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="one-page.pdf"; filename*=UTF-8''${encodeURIComponent(nome)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ erro: "Falha ao gerar o PDF. Tente de novo ou use 'Imprimir' na prévia." }, { status: 500 });
  } finally {
    await rm(pasta, { recursive: true, force: true }).catch(() => undefined);
  }
}
