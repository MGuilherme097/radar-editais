import { connection } from "next/server";
import FaixaTitulo from "@/components/FaixaTitulo";
import PainelEditais from "@/components/PainelEditais";
import { lerAcompanhamento, lerOportunidades } from "@/lib/armazenamento";

export default async function PaginaInicial() {
  await connection(); // lê data/*.json a cada acesso, não no build
  const [oportunidades, acompanhamento] = await Promise.all([lerOportunidades(), lerAcompanhamento()]);

  return (
    <>
      <FaixaTitulo titulo="Central de editais" />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <PainelEditais oportunidades={oportunidades} acompanhamentoInicial={acompanhamento} />
      </main>
    </>
  );
}
