// ============================================================
// 1. CARREGAR A NUVEM DO ROSTO
// rosto.bin guarda [x, y, z, brilho] por ponto, em ordem
// sorteada: qualquer prefixo é uma amostra uniforme do rosto.
// ============================================================

const VALORES_POR_PONTO = 4;
const LIMITE_CELULAR = 25000;
const LIMITE_COMPUTADOR = 60000;
const LARGURA_MINIMA_COMPUTADOR = 768;

export const urlRosto = `${import.meta.env.BASE_URL}rosto/rosto.bin`;
export const urlCoresRosto = `${import.meta.env.BASE_URL}rosto/rosto-cor.bin`;
export const urlRostoEstatico = `${import.meta.env.BASE_URL}rosto/rosto-estatico.webp`;

export function recortarPontos(dados: Float32Array, limite: number): Float32Array {
  const tamanhoQuebrado = dados.length % VALORES_POR_PONTO !== 0;
  if (dados.length === 0 || tamanhoQuebrado) {
    throw new Error("Arquivo do rosto inválido.");
  }
  const total = Math.min(limite, dados.length / VALORES_POR_PONTO);
  return dados.subarray(0, total * VALORES_POR_PONTO);
}

export function limitePorDispositivo(largura: number, toqueGrosso: boolean): 25000 | 60000 {
  const telaPequena = largura < LARGURA_MINIMA_COMPUTADOR;
  if (toqueGrosso || telaPequena) {
    return LIMITE_CELULAR;
  }
  return LIMITE_COMPUTADOR;
}

// ============================================================
// 2. PROGRESSO DO DOWNLOAD
// Lê o arquivo por partes e avisa quantos bytes chegaram. Com gzip
// o recebido passa do anunciado: a fração para em 1.
// ============================================================
export type AvisoProgressoRosto = (recebidos: number, total: number | null) => void;

export function calcularProgressoCarga(recebidos: number, total: number | null): number | null {
  const totalValido = total !== null && Number.isFinite(total) && total > 0;
  if (!totalValido) {
    return null;
  }
  return Math.min(1, recebidos / total);
}

function lerTamanhoAnunciado(resposta: Response): number | null {
  const tamanho = Number(resposta.headers.get("Content-Length"));
  return Number.isFinite(tamanho) && tamanho > 0 ? tamanho : null;
}

function juntarPartes(partes: Uint8Array[], tamanhoTotal: number): Uint8Array {
  const bytes = new Uint8Array(tamanhoTotal);
  let posicao = 0;
  for (const parte of partes) {
    bytes.set(parte, posicao);
    posicao += parte.length;
  }
  return bytes;
}

async function lerBytesComProgresso(
  resposta: Response,
  aoProgredir?: AvisoProgressoRosto,
): Promise<Uint8Array> {
  const leitor = resposta.body?.getReader();
  if (!leitor) {
    return new Uint8Array(await resposta.arrayBuffer());
  }
  const total = lerTamanhoAnunciado(resposta);
  const partes: Uint8Array[] = [];
  let recebidos = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) {
      return juntarPartes(partes, recebidos);
    }
    partes.push(value);
    recebidos += value.length;
    aoProgredir?.(recebidos, total);
  }
}

// ============================================================
// 3. CARGA COMPLETA
// ============================================================
export async function carregarRosto(
  limite: number,
  aoProgredir?: AvisoProgressoRosto,
): Promise<Float32Array> {
  const resposta = await fetch(urlRosto);
  if (!resposta.ok) {
    throw new Error(`Rosto não carregou (${resposta.status}).`);
  }
  const bytes = await lerBytesComProgresso(resposta, aoProgredir);
  if (bytes.byteLength % Float32Array.BYTES_PER_ELEMENT !== 0) {
    throw new Error(
      `Arquivo do rosto com ${bytes.byteLength} bytes: esperado múltiplo de 4 (float32).`,
    );
  }
  return recortarPontos(new Float32Array(bytes.buffer), limite);
}

// ============================================================
// 4. COR E CONTORNO DE CADA PONTO
// rosto-cor.bin guarda [r, g, b, contorno] em bytes, na mesma
// ordem do rosto.bin. Arquivo ausente, curto ou quebrado devolve
// null e o rosto segue em cinza.
// ============================================================
export function recortarCores(bytes: Uint8Array, totalPontos: number): Uint8Array | null {
  const tamanhoPedido = totalPontos * VALORES_POR_PONTO;
  const totalValido = Number.isInteger(totalPontos) && totalPontos > 0;
  const tamanhoQuebrado = bytes.length % VALORES_POR_PONTO !== 0;
  if (!totalValido || tamanhoQuebrado || bytes.length < tamanhoPedido) {
    return null;
  }
  return bytes.subarray(0, tamanhoPedido);
}

export async function carregarCoresRosto(totalPontos: number): Promise<Uint8Array | null> {
  try {
    const resposta = await fetch(urlCoresRosto);
    if (!resposta.ok) {
      return null;
    }
    return recortarCores(new Uint8Array(await resposta.arrayBuffer()), totalPontos);
  } catch {
    return null;
  }
}
