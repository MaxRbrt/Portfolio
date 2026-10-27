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

export async function carregarRosto(limite: number): Promise<Float32Array> {
  const resposta = await fetch(urlRosto);
  if (!resposta.ok) {
    throw new Error(`Rosto não carregou (${resposta.status}).`);
  }
  const dados = new Float32Array(await resposta.arrayBuffer());
  return recortarPontos(dados, limite);
}
