// ============================================================
// 1. ESTADO DO PALCO
// A galeria escreve a cada quadro, a composição da cena lê.
// subida: 0 hero inteiro na tela, 1 folha preta já saiu por cima.
// galeriaNaTela: galeria na tela (fundo escuro atrás da folha).
// expansao: última imagem crescendo para virar a Indústria (0 a 1).
// industriaCobre: Indústria em tela cheia, cena 3D escondida.
// cidadeCobre: cidade ou beco em tela cheia, cena 3D escondida.
// ============================================================
export const estadoPalco = {
  subida: 0,
  galeriaNaTela: false,
  expansao: 0,
  industriaCobre: false,
  cidadeCobre: false,
};

export const CURVATURA_DO_PALCO = 0.37;

export const CAMADA_DA_GALERIA = 1;

export const SELETOR_QUADRO_GALERIA = "[data-quadro-galeria]";

export type RetanguloNaPagina = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type RetanguloNaTela = {
  centroX: number;
  centroY: number;
  largura: number;
  altura: number;
};

// ============================================================
// 2. SUBIDA DA FOLHA
// A folha preta do hero sobe junto com o topo da galeria: 0
// quando o topo ainda está no pé da tela, 1 quando chega ao alto.
// ============================================================
export function calcularSubidaDaFolha(topoDaGaleria: number, alturaDaTela: number) {
  if (!(alturaDaTela > 0)) {
    throw new Error(`Altura de tela "${alturaDaTela}" inválida: esperado número maior que zero`);
  }
  const subida = 1 - topoDaGaleria / alturaDaTela;
  return Math.min(1, Math.max(0, subida));
}

export function galeriaEstaNaTela(topo: number, base: number, alturaDaTela: number) {
  return topo < alturaDaTela && base > 0;
}

// ============================================================
// 3. RETÂNGULO DA PÁGINA PARA A TELA DO WEBGL
// Pixels (y para baixo) viram coordenadas de -1 a 1 (y para cima).
// ============================================================
export function converterRetanguloParaTela(
  retangulo: RetanguloNaPagina,
  larguraDaTela: number,
  alturaDaTela: number,
): RetanguloNaTela {
  const centroEmPixelsX = retangulo.left + retangulo.width / 2;
  const centroEmPixelsY = retangulo.top + retangulo.height / 2;
  return {
    centroX: (centroEmPixelsX / larguraDaTela) * 2 - 1,
    centroY: 1 - (centroEmPixelsY / alturaDaTela) * 2,
    largura: (retangulo.width / larguraDaTela) * 2,
    altura: (retangulo.height / alturaDaTela) * 2,
  };
}
