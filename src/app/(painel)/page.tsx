import { connection } from "next/server";
import BotaoColetar from "@/components/BotaoColetar";
import FaixaTitulo from "@/components/FaixaTitulo";
import PainelEditais from "@/components/PainelEditais";
import { lerAcompanhamento, lerOportunidades, lerUltimaColeta } from "@/lib/armazenamento";

export default async function PaginaInicial() {
  await connection(); // lê os dados a cada acesso, não no build
  const [oportunidades, acompanhamento, ultimaColeta] = await Promise.all([
    lerOportunidades(),
    lerAcompanhamento(),
    lerUltimaColeta(),
  ]);

  return (
    <>
      <FaixaTitulo titulo="Central de editais" />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <BotaoColetar ultima={ultimaColeta} />
        <PainelEditais oportunidades={oportunidades} acompanhamentoInicial={acompanhamento} />
      </main>
    </>
  );
}
