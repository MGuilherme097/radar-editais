# Radar de Editais — Instituto Ânima

Painel interno para prospectar editais, chamadas públicas e oportunidades de investimento social.
Ele mostra a grade de oportunidades, a página de cada edital, o acompanhamento por status, o histórico de descartes com motivo e o one page em PDF.

## Rodar no computador

```bash
npm run dev
```

Abra http://localhost:3000.

## Variáveis de ambiente

Ficam no `.env.local` (fora do Git) e em Vercel › Settings › Environment Variables.

| Variável | Para quê | Sem ela |
|---|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis: status, descartes, oportunidades | usa os arquivos `data/*.json` |
| `SENHA_EQUIPE` | senha única de acesso | app aberto, sem login |
| `PROSAS_CLIENT_ID` | coleta diária no Prosas | a coleta falha e avisa no app |
| `CRON_SECRET` | autoriza o cron da Vercel a chamar `/api/coleta` | a coleta automática não roda |

Depois de criar ou mudar uma variável na Vercel, faça um **Redeploy**.

## Coleta de editais (Prosas)

- **Quando roda:** o cron da Vercel (`vercel.json`) chama `/api/coleta` todo dia às 10h UTC, que são 7h em Brasília. O botão "Buscar novos editais" faz a mesma coisa na hora.
- **O que faz:**
  - Busca os editais com inscrições abertas.
  - Faz a triagem por palavras-chave em `src/lib/coletaProsas.ts`, com temas, exclusões e financiadores que aceitam qualquer tema.
  - Grava só os editais novos, com status "Nova".
  - Nos editais que já existem, atualiza o prazo.

> **Atenção:** a API do Prosas **não é oficial**. É a mesma que o site deles usa no navegador, com token público e sem login. Ela pode mudar ou ser bloqueada sem aviso. Por isso a coleta roda no máximo uma vez por dia. O caminho mais seguro é pedir ao Prosas um acesso próprio de parceiro, já que o endpoint é `third_party`.

## Dados

`scripts/migrar-upstash.mjs` copia `data/*.json` para um Upstash vazio:

```bash
node --env-file=.env.local scripts/migrar-upstash.mjs
```

Se o Upstash já tiver dados, o script se recusa a sobrescrever.
