import Link from "next/link";
import { connection } from "next/server";
import BotaoDesfazerDescarte from "@/components/BotaoDesfazerDescarte";
import FaixaTitulo from "@/components/FaixaTitulo";
import { lerAcompanhamento, lerDescartes } from "@/lib/armazenamento";
import { dataBr } from "@/lib/radar";

/** Histórico dos descartes com motivo: base para ajustar o perfil e os critérios do radar. */
export default async function PaginaDescartes() {
  await connection();
  const [lista, acompanhamento] = await Promise.all([lerDescartes(), lerAcompanhamento()]);
  const descartes = lista.toSorted((a, b) => b.em.localeCompare(a.em));

  return (
    <>
      <FaixaTitulo titulo="Histórico de descartes" />
      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:px-8">
        {descartes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-linha bg-superficie p-8 text-center text-suave">
            Nenhum descarte registrado ainda. Ao marcar uma oportunidade como &quot;Descartada&quot;, o motivo aparece aqui.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
            {descartes.map((d) => (
              <article key={`${d.oportunidadeId}-${d.em}`} className="grid content-start gap-2 rounded-2xl border border-linha bg-superficie p-5">
                <span className="text-xs text-suave">Descartada em {dataBr(d.em)}</span>
                <h2 className="font-bold leading-snug">
                  <Link href={`/editais/${d.oportunidadeId}`} className="hover:text-azul">
                    {d.titulo}
                  </Link>
                </h2>
                <p className="text-xs text-suave">{d.financiador}</p>
                <p className="border-l-2 border-magenta pl-3 text-sm">{d.motivo}</p>
                {acompanhamento[d.oportunidadeId]?.status === "Descartada" && (
                  <div className="mt-1">
                    <BotaoDesfazerDescarte
                      id={d.oportunidadeId}
                      statusAnterior={acompanhamento[d.oportunidadeId].statusAnterior}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
