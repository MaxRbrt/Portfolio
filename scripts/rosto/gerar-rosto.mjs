// ============================================================
// GERAR ROSTO
// Lê a foto em references/, recorta a pessoa do fundo, estima a
// profundidade e grava a nuvem de pontos usada no site.
// Tudo roda neste computador: os modelos são baixados uma vez e
// a foto nunca sai daqui.
// Uso: npm run rosto [caminho-da-foto]
// ============================================================
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline, RawImage } from "@huggingface/transformers";
import sharp from "sharp";
import { amostrarPontos } from "./amostragem.mjs";

const TOTAL_PONTOS = 60000;
const SEMENTE = 2026;
const LADO_TRABALHO = 640;
const LADO_ESTATICO = 900;
const PASTA_SAIDA = path.resolve("public/rosto");
const FOTO_PROVISORIA = path.resolve("public/assets/profile/avatar.webp");

// ============================================================
// 1. ESCOLHA DA FOTO
// ============================================================
function escolherFoto() {
  const informada = process.argv[2];
  if (informada) {
    return { caminho: path.resolve(informada), provisoria: false };
  }
  const pastaReferencias = path.resolve("references");
  const fotos = existsSync(pastaReferencias)
    ? readdirSync(pastaReferencias).filter((nome) => /\.(jpe?g|png|webp)$/i.test(nome))
    : [];
  if (fotos.length > 0) {
    return { caminho: path.join(pastaReferencias, fotos[0]), provisoria: false };
  }
  return { caminho: FOTO_PROVISORIA, provisoria: true };
}

// ============================================================
// 2. FOTO NORMALIZADA E CANAL DE BRILHO
// ============================================================
async function prepararFoto(caminho) {
  const arquivoTemporario = path.join(tmpdir(), "rosto-trabalho.png");
  const informacao = await sharp(caminho)
    .rotate()
    .resize(LADO_TRABALHO, LADO_TRABALHO, { fit: "inside", kernel: "lanczos3" })
    .removeAlpha()
    .png()
    .toFile(arquivoTemporario);
  const { data } = await sharp(arquivoTemporario)
    .grayscale()
    .clahe({ width: 48, height: 48, maxSlope: 3 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const brilho = Float32Array.from(data, (valor) => valor / 255);
  return { arquivoTemporario, largura: informacao.width, altura: informacao.height, brilho };
}

function lerCanal(imagem, largura, altura, canal) {
  const tamanhoErrado = imagem.width !== largura || imagem.height !== altura;
  if (tamanhoErrado) {
    throw new Error(`Saída do modelo com tamanho inesperado: ${imagem.width}x${imagem.height}.`);
  }
  const valores = new Float32Array(largura * altura);
  for (let indice = 0; indice < valores.length; indice += 1) {
    valores[indice] = imagem.data[indice * imagem.channels + canal] / 255;
  }
  return valores;
}

// ============================================================
// 3. MODELOS LOCAIS: RECORTE E PROFUNDIDADE
// ============================================================
async function recortarPessoa(arquivo, largura, altura) {
  const recortar = await pipeline("background-removal", "Xenova/modnet", { dtype: "fp32" });
  const saida = await recortar(arquivo);
  const resultado = Array.isArray(saida) ? saida[0] : saida;
  const imagem = resultado.width === largura ? resultado : await resultado.resize(largura, altura);
  return lerCanal(imagem, largura, altura, imagem.channels - 1);
}

async function estimarProfundidade(arquivo, largura, altura) {
  const estimar = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", {
    dtype: "fp32",
  });
  const { depth } = await estimar(await RawImage.read(arquivo));
  const imagem = depth.width === largura ? depth : await depth.resize(largura, altura);
  return lerCanal(imagem, largura, altura, 0);
}

// ============================================================
// 4. AJUSTES: CONTRASTE DENTRO DA PESSOA E PROFUNDIDADE 0..1
// ============================================================
function esticarDentroDaMascara(valores, mascara) {
  const dentro = valores.filter((_, indice) => mascara[indice] > 0.5).sort();
  if (dentro.length === 0) {
    return valores;
  }
  const minimo = dentro[Math.floor(dentro.length * 0.02)];
  const maximo = dentro[Math.floor(dentro.length * 0.98)];
  const faixa = Math.max(maximo - minimo, 1e-3);
  return valores.map((valor) => Math.min(1, Math.max(0, (valor - minimo) / faixa)));
}

// ============================================================
// 5. ARQUIVOS DE SAÍDA
// ============================================================
async function gravarImagemEstatica(pontos) {
  const lado = LADO_ESTATICO;
  const acumulado = new Float32Array(lado * lado);
  for (let indice = 0; indice < pontos.length; indice += 4) {
    const x = Math.round((pontos[indice] * 0.92 + 0.5) * lado);
    const y = Math.round((-pontos[indice + 1] * 0.92 + 0.5) * lado);
    const dentroDaTela = x >= 0 && x < lado && y >= 0 && y < lado;
    if (dentroDaTela) {
      acumulado[y * lado + x] += 0.35 + pontos[indice + 3] * 0.65;
    }
  }
  const pixels = Buffer.alloc(lado * lado * 3);
  for (let indice = 0; indice < acumulado.length; indice += 1) {
    const intensidade = Math.min(1, acumulado[indice] * 1.5);
    pixels[indice * 3] = 8 + intensidade * 206;
    pixels[indice * 3 + 1] = 8 + intensidade * 210;
    pixels[indice * 3 + 2] = 9 + intensidade * 217;
  }
  await sharp(pixels, { raw: { width: lado, height: lado, channels: 3 } })
    .webp({ quality: 82 })
    .toFile(path.join(PASTA_SAIDA, "rosto-estatico.webp"));
}

async function main() {
  const foto = escolherFoto();
  if (foto.provisoria) {
    console.warn("PROVISÓRIO: nenhuma foto em references/. Usando o avatar de 192 px.");
  }
  console.log(`Foto: ${foto.caminho}`);

  const { arquivoTemporario, largura, altura, brilho } = await prepararFoto(foto.caminho);
  const mascara = await recortarPessoa(arquivoTemporario, largura, altura);
  const profundidadeBruta = await estimarProfundidade(arquivoTemporario, largura, altura);

  const pontos = amostrarPontos({
    largura,
    altura,
    brilho: esticarDentroDaMascara(brilho, mascara),
    profundidade: esticarDentroDaMascara(profundidadeBruta, mascara),
    mascara,
    total: TOTAL_PONTOS,
    semente: SEMENTE,
  });

  mkdirSync(PASTA_SAIDA, { recursive: true });
  writeFileSync(path.join(PASTA_SAIDA, "rosto.bin"), Buffer.from(pontos.buffer));
  await gravarImagemEstatica(pontos);
  console.log(`Gravado: ${TOTAL_PONTOS} pontos em public/rosto/rosto.bin`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
