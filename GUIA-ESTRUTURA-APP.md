

## 1. Stack (linguagem e bibliotecas)

| Item | Versão / uso |
|---|---|
| Linguagem | **TypeScript** (modo `strict`) |
| Framework | **Next.js 16** (App Router) + **React 19** |
| Estilo | **Tailwind CSS 4** (via `@tailwindcss/postcss`; sem `tailwind.config`, tudo em `globals.css` com `@import "tailwindcss"`) |
| Gráficos | **Recharts 3** (precisa de `transpilePackages: ['recharts']` no `next.config.ts`) |
| Fonte | **Geist** e Geist Mono (`next/font/google`) |
| Planilhas | `xlsx` (ler/gerar Excel) |
| Screenshots / PDF | `playwright` (dev) |
| Lint | ESLint 9 + `eslint-config-next` |

> Atenção: o Next 16 tem mudanças em relação às versões anteriores. Antes de escrever código,
> o Claude deve ler os guias em `node_modules/next/dist/docs/` (regra do `AGENTS.md`).

Criar o projeto:
```bash
npx create-next-app@latest nome-do-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd nome-do-app
npm install recharts xlsx
npm install -D playwright
```

---

## 2. Estrutura de pastas

```
src/
  app/
    layout.tsx          ← layout raiz (fonte Geist + shell com sidebar)
    globals.css         ← Tailwind + variáveis de cor + animações
    page.tsx            ← página inicial
    <secao>/page.tsx    ← cada página (ex.: arvores-indicadores/painel/page.tsx)
    api/<rota>/route.ts ← rotas de API (servidor): conversam com Monday etc.
  components/           ← componentes reutilizáveis (Sidebar, Nav da seção, cards…)
  lib/                  ← regras de negócio e dados (cálculos, mapeamentos, dados manuais)
  types/                ← tipos TypeScript (ex.: types/monday.ts)
data/                   ← JSON de persistência local (classificações, validações)
.cache/                 ← cache em disco de respostas de API (no .gitignore)
externos/               ← arquivos de entrada/saída sensíveis (no .gitignore)
```

Alias de import: `@/` = `src/` (ex.: `import { x } from '@/lib/painel'`).

---



Regras usadas no projeto atual:
- **Token nunca vai para o navegador**: toda chamada à Monday passa por uma rota `/api/...`.
- **Cache em disco** (`.cache/`) com tempo de validade e `?refresh=1` para forçar atualização.
- **Dados manuais** (metas, números de planilhas) ficam em `src/lib/*.ts` como constantes,
  com comentário dizendo a fonte e a data.
- **Persistência simples** em `data/*.json` via rotas de API com `GET` e `PATCH`. O `PATCH`
  envia **só as linhas alteradas** e o servidor faz merge, para uma aba aberta não
  sobrescrever o trabalho de outra.
- Chave estável das linhas: `quadroId|grupo|nome|oferta`.


```

### Variáveis de ambiente (`.env.local`, nunca no git)




---

## 6. Padrões de código

- Componentes de página interativos começam com `'use client'`; rotas de API rodam no servidor.
- Nomes em **português** (`calcularPendencias`, `linhasPorArea`), como no projeto atual.
- Constantes de domínio em `lib/` (ex.: `STATUS_CATEGORIAS`, `AREA_CORES`, `AREA_ORDEM`).
- Comentários curtos explicando a **regra de negócio e a fonte do dado**, não o óbvio.
- Texto da interface: "**a** Monday" (sempre no feminino).
- Rodar `npx tsc --noEmit` antes de dar uma tarefa como pronta.

---

## 7. Segurança e git

- `.gitignore`: `node_modules/`, `.next/`, `.env*.local`, `.cache/`, `externos/`, `*.tsbuildinfo`.
- Nada de token, base de cursistas ou dado financeiro no repositório.
- Trabalho a dois: branch por tarefa, Pull Request para a `main` e proteção da `main` no GitHub.
- O hook de auto-commit e push do projeto atual **não** deve ser copiado: ele empurra direto para
  a branch principal.

---


