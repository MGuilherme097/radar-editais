import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { senhaConfigurada } from "@/lib/sessao";

export const metadata: Metadata = { title: "Entrar | Radar de Editais" };

type Props = { searchParams: Promise<{ de?: string; erro?: string }> };

export default async function Entrar({ searchParams }: Props) {
  const { de = "/", erro } = await searchParams;
  if (!senhaConfigurada()) redirect("/");

  return (
    <main className="pontilhado grid min-h-screen place-items-center bg-fundo px-4">
      <form
        method="post"
        action="/api/entrar"
        className="grid w-full max-w-sm gap-5 rounded-2xl border border-linha bg-superficie p-8 shadow-lg"
      >
        <div className="grid gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-azul">
            radar<span className="text-magenta">.</span>
          </span>
          <span className="text-sm font-semibold text-tinta">Radar de Editais</span>
          <span className="text-xs font-bold uppercase tracking-widest text-magenta">Instituto Ânima</span>
        </div>

        <input type="hidden" name="de" value={de} />
        <label className="grid gap-1.5 text-sm font-semibold text-tinta">
          Senha da equipe
          <input
            type="password"
            name="senha"
            required
            autoFocus
            autoComplete="current-password"
            className="rounded-lg border border-linha px-3 py-2 font-normal outline-none focus:border-azul"
          />
        </label>
        {erro && (
          <p role="alert" className="-mt-2 text-sm text-urgente">
            Senha incorreta. Tente de novo.
          </p>
        )}
        <button type="submit" className="rounded-lg bg-azul px-4 py-2.5 font-bold text-white hover:bg-azul-escuro">
          Entrar
        </button>
        <p className="text-xs text-suave">O acesso fica salvo neste navegador por 30 dias.</p>
      </form>
    </main>
  );
}
