import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { CSSProperties, ReactNode } from "react";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { lerAcompanhamento, lerOportunidades } from "@/lib/armazenamento";
import {
  corDoTema,
  dominio,
  fatos,
  fonteLegivel,
  fraseLocalTipo,
  prazoPartes,
  sobretitulo,
  valorCompacto,
} from "@/lib/onePage";
import { dataBr, diasAte, proximoPasso, statusDe } from "@/lib/radar";
import "../one-page.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-plex-sans" });
const plexSerif = IBM_Plex_Serif({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-serif" });

/** Tamanho do título conforme o comprimento, para caber no topo da folha. */
function tamanhoTitulo(t: string) {
  const caixaAlta = t === t.toUpperCase();
  const base = t.length <= 40 ? 30 : t.length <= 75 ? 24 : t.length <= 110 ? 20 : 17;
  return `${caixaAlta ? base - 3 : base}pt`;
}

function Fato({ forte, texto }: { forte: string; texto: string }) {
  return (
    <p className="m-0">
      <b className="sans">{forte}</b> {texto}
    </p>
  );
}

function Vazio({ children }: { children: ReactNode }) {
  return <p className="m-0 italic text-[#6b7186]">{children}</p>;
}

export default async function OnePage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [oportunidades, acomp] = await Promise.all([lerOportunidades(), lerAcompanhamento()]);
  const o = oportunidades.find((x) => x.id === decodeURIComponent(id));
  if (!o) notFound();

  const cor = corDoTema(o.tema);
  const prazo = prazoPartes(o);
  const dias = diasAte(o.prazo);
  const valor = o.valorPorProjeto ?? o.valorTotal;
  const semResumo = !o.objetivo && !o.quemPode;
  const estilo = { "--acento": cor.forte, "--acento-claro": cor.claro } as CSSProperties;

  return (
    <div className={`${plexSans.variable} ${plexSerif.variable} min-h-full bg-[#e6e8ef] print:bg-white`}>
      {/* Barra só de tela: some na impressão e no PDF */}
      <div className="mx-auto flex w-[210mm] max-w-full items-center justify-between py-4 text-sm print:hidden">
        <Link href={`/editais/${o.id}`} className="font-semibold text-azul">
          « Voltar ao edital
        </Link>
        <a href={`/api/one-page/${o.id}`} className="rounded-lg bg-azul px-4 py-2 font-semibold text-white">
          Baixar PDF
        </a>
      </div>

      <article style={estilo} className="folha mx-auto mb-8 flex flex-col shadow-xl print:mb-0">
        {/* Topo */}
        <header className="grid grid-cols-[1fr_auto] gap-x-8">
          <div>
            <p className="sans m-0 text-[9.5pt] font-bold text-[var(--acento)]">
              {sobretitulo(o)}
            </p>
            <h1
              className="sans mt-1.5 mb-2 font-bold leading-[1.12] tracking-tight text-[#141826] text-balance"
              style={{ fontSize: tamanhoTitulo(o.titulo) }}
            >
              {o.titulo}
            </h1>
            <p className="sans m-0 text-[12pt] leading-snug text-[#5d6377]">{fraseLocalTipo(o)}</p>
          </div>
          <div className="sans self-start border-l border-[#c9ccd6] pl-6 text-right">
            <p className="m-0 text-[8.5pt] text-[#6b7186]">{o.prazo ? "Inscrições até" : "Inscrições"}</p>
            <p className="m-0 text-[24pt] font-bold leading-tight text-[#b9381c]">{prazo.destaque}</p>
            <p className="m-0 text-[8.5pt] text-[#6b7186]">{prazo.complemento}</p>
          </div>
        </header>

        {/* Valor */}
        <section className="mt-7">
          <h2 className="secao">Quanto dá para pedir</h2>
          <div className="grid grid-cols-[52mm_1fr] gap-8">
            <div>
              {valor ? (
                <>
                  <p className="sans m-0 text-[22pt] font-bold leading-tight text-[var(--acento)]">
                    {valorCompacto(valor)}
                  </p>
                  <p className="m-0 text-[9.5pt] text-[#5d6377]">
                    {o.valorPorProjeto ? "por projeto, valor máximo citado na prospecção." : "valor total citado no edital."}
                  </p>
                </>
              ) : (
                <>
                  <p className="sans m-0 text-[18pt] font-bold leading-tight text-[#8a8fa3]">A confirmar</p>
                  <p className="m-0 text-[9.5pt] text-[#5d6377]">O valor não veio na listagem. Confira no edital.</p>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-5 self-end border-t border-[#c9ccd6] pt-3 text-[9.5pt]">
              {fatos(o).map((f) => (
                <Fato key={f.forte} forte={f.forte} texto={f.texto} />
              ))}
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section className="mt-6">
          <h2 className="secao">Sobre a oportunidade</h2>
          {o.objetivo ? (
            <p className="m-0 line-clamp-[8] text-justify">{o.objetivo}</p>
          ) : (
            <div className="border-l-[1.2mm] border-[var(--acento)] bg-[var(--acento-claro)] px-4 py-3">
              <p className="m-0">
                O resumo desta oportunidade ainda não foi gerado: a prospecção trouxe só os dados da listagem
                (título, financiador, prazo e tema). Leia o edital completo antes de decidir.
              </p>
            </div>
          )}
        </section>

        {/* Duas colunas */}
        <section className="mt-6 grid grid-cols-2 gap-8">
          <div>
            <h3 className="subsecao">Quem pode se inscrever</h3>
            {o.quemPode ? <p className="m-0 line-clamp-[9]">{o.quemPode}</p> : <Vazio>A confirmar no edital.</Vazio>}
            {o.contrapartida && (
              <p className="mt-2 mb-0 line-clamp-5">
                <b className="text-[var(--acento)]">Contrapartida:</b> {o.contrapartida}
              </p>
            )}
          </div>
          <div>
            <h3 className="subsecao">Pontos de atenção</h3>
            {o.pontosAtencao.length ? (
              <ul className="m-0 grid list-disc gap-1 pl-4 marker:text-[var(--acento)]">
                {o.pontosAtencao.slice(0, 5).map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            ) : (
              <Vazio>
                Nenhum ponto registrado na triagem{semResumo ? ", que foi feita só por palavras-chave" : ""}.
              </Vazio>
            )}
            {o.excecaoPorte && (
              <p className="mt-2 mb-0">
                <b className="text-[var(--acento)]">Exceção de porte:</b> {o.excecaoPorte}
              </p>
            )}
          </div>
        </section>

        {/* Próximo passo + destaque */}
        <section className="mt-6 grid grid-cols-[1fr_66mm] gap-8 border-t border-[#c9ccd6] pt-5">
          <div>
            <h2 className="secao">Próximo passo</h2>
            <p className="m-0">{proximoPasso(o)}</p>
            <p className="mt-3 mb-0 text-[9pt] text-[#5d6377]">
              <b className="sans text-[#1f2433]">Status da equipe:</b> {statusDe(acomp, o.id)}
              {o.nota != null && (
                <>
                  {" · "}
                  <b className="sans text-[#1f2433]">Nota da triagem:</b> {o.nota}/10
                </>
              )}
            </p>
          </div>
          <div className="border-l-[1.2mm] border-[var(--acento)] bg-[var(--acento-claro)] px-5 py-4">
            {dias != null && dias >= 0 ? (
              <>
                <p className="sans m-0 text-[22pt] font-bold leading-tight text-[var(--acento)]">
                  {dias === 1 ? "1 dia" : `${dias} dias`}
                </p>
                <p className="m-0 text-[9.5pt] text-[#5d6377]">
                  até o fim das inscrições, contados em {dataBr(new Date().toISOString())}.
                </p>
              </>
            ) : (
              <>
                <p className="sans m-0 text-[20pt] font-bold leading-tight text-[var(--acento)]">
                  {dias != null ? "Encerrado" : o.inscricoesContinuas ? "Fluxo contínuo" : "Sem data"}
                </p>
                <p className="m-0 text-[9.5pt] text-[#5d6377]">
                  {dias != null
                    ? "O prazo de inscrição já passou."
                    : "A listagem não traz data-limite. Confira no edital se há prazo."}
                </p>
              </>
            )}
          </div>
        </section>

        {/* Rodapé */}
        <footer className="mt-auto grid grid-cols-[1fr_78mm] items-end gap-8 border-t-[0.6mm] border-[#1f2433] pt-3">
          <div className="sans text-[10pt] font-bold leading-snug">
            <p className="m-0">Inscrição e edital completo: {fonteLegivel(o)}</p>
            <a href={o.link} className="text-[#1f2433] underline underline-offset-2">
              {dominio(o.link)}
            </a>
          </div>
          <p className="m-0 text-right text-[8pt] leading-snug text-[#6b7186]">
            Informações compiladas pelo Radar de Editais do Instituto Ânima a partir de{" "}
            {o.origem === "equipe" ? o.fonteResumo || "dados reunidos pela equipe" : o.fonte}
            {o.publicado ? `, publicação de ${dataBr(o.publicado)}` : ""}. Confirme os detalhes no edital oficial.
          </p>
        </footer>
      </article>
    </div>
  );
}
