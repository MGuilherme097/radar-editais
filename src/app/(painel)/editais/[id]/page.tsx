import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import BotaoOnePage from "@/components/BotaoOnePage";
import Etiquetas from "@/components/Etiquetas";
import FaixaTitulo from "@/components/FaixaTitulo";
import { IconeAlerta, IconeExterno } from "@/components/Icones";
import { TextoFaltam } from "@/components/SeloPrazo";
import StatusDetalhe from "@/components/StatusDetalhe";
import { lerAcompanhamento, lerOportunidades } from "@/lib/armazenamento";
import { dataBr, iniciais, proximoPasso, textoValor } from "@/lib/radar";

const caixa = "rounded-2xl border border-linha bg-superficie p-6";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="border-b border-linha pb-1 text-base font-bold text-tinta">{titulo}</h2>
      <div className="text-sm leading-relaxed text-tinta">{children}</div>
    </section>
  );
}

const aConfirmar = <span className="italic text-suave">A confirmar no edital.</span>;

export default async function PaginaEdital({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [oportunidades, acompanhamento] = await Promise.all([lerOportunidades(), lerAcompanhamento()]);
  const o = oportunidades.find((x) => x.id === decodeURIComponent(id));
  if (!o) notFound();

  const valor = textoValor(o);
  const semResumo = !o.objetivo && !o.quemPode;

  return (
    <>
      <FaixaTitulo titulo={o.titulo} />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-8">
        <div className="flex items-center justify-between border-b border-linha pb-2 text-xs font-semibold uppercase">
          <Link href="/" className="text-suave hover:text-azul">
            « Voltar
          </Link>
          <span className="font-extrabold normal-case tracking-tight text-linha">radar.</span>
        </div>

        {/* Cabeçalho com faixa pontilhada e selo do financiador, como no Prosas */}
        <section className="overflow-hidden rounded-2xl border border-linha bg-superficie">
          <div className="pontilhado h-24 md:h-32" />
          <div className="flex flex-wrap items-end gap-5 px-6 pb-6">
            <div
              aria-hidden
              className="-mt-14 grid size-28 shrink-0 place-items-center rounded-xl border-4 border-superficie bg-azul text-3xl font-extrabold text-white shadow-md md:-mt-20 md:size-36 md:text-4xl"
            >
              {iniciais(o.financiador || o.titulo)}
            </div>
            <div className="grid min-w-0 flex-1 basis-72 gap-2 pt-2">
              <Etiquetas o={o} />
              <p className="text-xl font-light leading-snug text-tinta text-balance md:text-2xl">{o.titulo}</p>
            </div>
            <div className="grid justify-items-end gap-2">
              <a
                href={o.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-azul px-4 py-2 text-sm font-semibold text-azul hover:bg-azul-claro"
              >
                <IconeExterno className="size-4" />
                Abrir na fonte
              </a>
              <BotaoOnePage id={o.id} />
            </div>
          </div>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-5">
            {/* Inscrições */}
            <section className={`${caixa} flex flex-wrap items-center justify-between gap-4`}>
              <div className="grid gap-0.5">
                <span className="text-sm font-bold text-magenta">Inscrições até:</span>
                <span className="text-2xl font-bold tabular-nums text-tinta">
                  {o.prazo ? dataBr(o.prazo) : o.inscricoesContinuas ? "Fluxo contínuo" : "Sem data informada"}
                </span>
                <TextoFaltam o={o} />
              </div>
              <a
                href={o.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-azul px-5 py-2.5 text-sm font-bold text-white hover:bg-azul-escuro"
              >
                <IconeExterno className="size-4" />
                Acessar
              </a>
            </section>

            <section className={`${caixa} grid gap-6`}>
              {semResumo && (
                <p className="flex items-start gap-2 rounded-lg border-l-4 border-breve bg-breve-claro px-4 py-3 text-sm text-breve">
                  <IconeAlerta className="mt-0.5 size-4 shrink-0" />
                  Resumo ainda não gerado: só temos os dados da listagem. Abra o edital na fonte para conferir objetivo,
                  público e valores.
                </p>
              )}
              <Secao titulo="Sobre">{o.objetivo || aConfirmar}</Secao>
              <Secao titulo="Valor">{valor ?? aConfirmar}</Secao>
              <Secao titulo="Quem pode participar">{o.quemPode || aConfirmar}</Secao>
              {o.contrapartida && <Secao titulo="Contrapartida">{o.contrapartida}</Secao>}
              {o.pontosAtencao.length > 0 && (
                <Secao titulo="Pontos de atenção">
                  <ul className="list-disc space-y-1 pl-5">
                    {o.pontosAtencao.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </Secao>
              )}
              {o.excecaoPorte && <Secao titulo="Exceção de porte">{o.excecaoPorte}</Secao>}
              <Secao titulo="Próximo passo">{proximoPasso(o)}</Secao>
            </section>
          </div>

          <aside className="grid gap-5">
            <section className={`${caixa} grid gap-3`}>
              <h2 className="text-lg font-bold text-azul">Financiador</h2>
              <p className="text-sm font-semibold text-magenta">{o.financiador || "Não informado"}</p>
              {o.tipo && <p className="text-sm text-suave">{o.tipo}</p>}
            </section>

            <section className={`${caixa} grid gap-3`}>
              <h2 className="text-lg font-bold text-azul">Acompanhamento</h2>
              <StatusDetalhe id={o.id} titulo={o.titulo} inicial={acompanhamento[o.id]} />
            </section>

            <section className={`${caixa} grid gap-2 text-sm`}>
              <h2 className="border-b border-azul pb-1 text-lg font-bold text-azul">Origem</h2>
              <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1.5">
                <dt className="font-semibold text-suave">Fonte</dt>
                <dd>{o.fonte}</dd>
                {o.publicado && (
                  <>
                    <dt className="font-semibold text-suave">Publicado</dt>
                    <dd>{dataBr(o.publicado)}</dd>
                  </>
                )}
                <dt className="font-semibold text-suave">Coletado</dt>
                <dd>{dataBr(o.coletadoEm)}</dd>
                {o.nota != null && (
                  <>
                    <dt className="font-semibold text-suave">Nota</dt>
                    <dd>{o.nota}/10</dd>
                  </>
                )}
                {o.motivoTriagem && (
                  <>
                    <dt className="font-semibold text-suave">Triagem</dt>
                    <dd>{o.motivoTriagem}</dd>
                  </>
                )}
                {o.fonteResumo && (
                  <>
                    <dt className="font-semibold text-suave">Resumo</dt>
                    <dd>{o.fonteResumo}</dd>
                  </>
                )}
              </dl>
              <a href={o.link} target="_blank" rel="noopener noreferrer" className="mt-1 break-all text-azul underline">
                {o.link}
              </a>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
