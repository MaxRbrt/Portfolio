import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// ============================================================
// 1. CONFIGURAÇÃO
// Imagens dos ambientes saem em duas larguras: computador e celular.
// ============================================================
const LARGURAS_AMBIENTE = [1376, 800];
const QUALIDADE_WEBP = 80;
const NOME_VALIDO = /^[a-z0-9-]+\.jpg$/;
const raizProjeto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pastaOrigem = path.join(raizProjeto, "references", "ambientes");
const pastaDestino = path.join(raizProjeto, "public", "ambientes");

// ============================================================
// 2. NOMES DE SAÍDA
// ============================================================
export function listarSaidasAmbiente(nomeArquivo) {
  if (!NOME_VALIDO.test(nomeArquivo)) {
    throw new Error(`Imagem "${nomeArquivo}" inválida: esperado nome-em-minusculas.jpg`);
  }
  const nomeBase = nomeArquivo.replace(/\.jpg$/, "");
  return LARGURAS_AMBIENTE.map((largura) => ({
    largura,
    caminho: `${nomeBase}-${largura}.webp`,
  }));
}

// ============================================================
// 3. CONVERSÃO
// ============================================================
async function converterImagemAmbiente(nomeArquivo) {
  const entrada = path.join(pastaOrigem, nomeArquivo);
  for (const saida of listarSaidasAmbiente(nomeArquivo)) {
    const destino = path.join(pastaDestino, saida.caminho);
    await sharp(entrada)
      .resize({ width: saida.largura })
      .webp({ quality: QUALIDADE_WEBP })
      .toFile(destino);
    const { size } = await stat(destino);
    console.log(`${saida.caminho}: ${Math.round(size / 1024)} KB`);
  }
}

async function converterAmbientes() {
  await mkdir(pastaDestino, { recursive: true });
  const arquivos = await readdir(pastaOrigem);
  const imagens = arquivos.filter((nome) => nome.endsWith(".jpg"));
  for (const nomeArquivo of imagens) {
    await converterImagemAmbiente(nomeArquivo);
  }
}

// ============================================================
// 4. EXECUÇÃO DIRETA
// Importado pelo teste, o módulo não converte nada.
// ============================================================
const executadoDireto = process.argv[1] === fileURLToPath(import.meta.url);

if (executadoDireto) {
  await converterAmbientes();
}
