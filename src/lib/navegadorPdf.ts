// Procura um Edge/Chrome instalado para gerar o one page em PDF no servidor.
// Só existe na máquina local (Windows); na Vercel retorna null e o botão usa a impressão do navegador.
import { existsSync } from "node:fs";

const CANDIDATOS = [
  process.env.NAVEGADOR_PDF,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].filter((c): c is string => Boolean(c));

export function localizarNavegador(): string | null {
  if (process.env.VERCEL) return null;
  return CANDIDATOS.find((c) => existsSync(c)) ?? null;
}
