// Senha única da equipe. Só roda no servidor (proxy e rotas /api).
//
// A senha fica em SENHA_EQUIPE (Vercel > Settings > Environment Variables, ou .env.local).
// Sem ela, o app fica aberto — útil na máquina local.
// O cookie guarda um HMAC derivado da senha, nunca a senha. Trocar a senha desconecta todo mundo.
import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_SESSAO = "radar_sessao";
export const DURACAO_SESSAO = 60 * 60 * 24 * 30; // 30 dias, em segundos

export const senhaConfigurada = () => Boolean(process.env.SENHA_EQUIPE);

const hmac = (texto: string) => createHmac("sha256", process.env.SENHA_EQUIPE ?? "").update(texto).digest();

function iguais(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Valor gravado no cookie depois do login. */
export const tokenDaSessao = () => hmac("radar-editais:sessao:v1").toString("hex");

/** Compara pelo HMAC, para o tempo de resposta não revelar a senha. */
export const senhaConfere = (senha: string) => iguais(hmac(`senha:${senha}`), hmac(`senha:${process.env.SENHA_EQUIPE}`));

/** true se não há senha configurada ou se o token é o da sessão atual. */
export function tokenValido(token: string | null | undefined) {
  if (!senhaConfigurada()) return true;
  return Boolean(token) && iguais(Buffer.from(token!), Buffer.from(tokenDaSessao()));
}
