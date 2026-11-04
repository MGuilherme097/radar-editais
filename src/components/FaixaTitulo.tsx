/** Faixa colorida com o título da página (equivalente à faixa verde do Prosas). */
export default function FaixaTitulo({ titulo }: { titulo: string }) {
  return (
    <div className="bg-azul">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        <h1 className="text-lg font-bold uppercase tracking-wide text-white text-balance md:text-xl">
          {titulo}
        </h1>
      </div>
      <div className="h-1 bg-magenta" />
    </div>
  );
}
