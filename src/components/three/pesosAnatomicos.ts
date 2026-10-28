// ============================================================
// 1. PESOS DAS ARTICULAÇÕES
// Cada ponto recebe quanto segue cada articulação do pescoço:
// base cervical, meio do pescoço e base do crânio. Os pesos
// sobem em degradê de baixo para cima e somem para os lados,
// então ombro e tronco ficam parados e não há linha de corte.
// ============================================================

export type PesosAnatomicos = {
  baseCervical: number;
  meioCervical: number;
  cranio: number;
};

function suavizar(inicio: number, fim: number, valor: number) {
  const t = Math.max(0, Math.min(1, (valor - inicio) / (fim - inicio)));
  return t * t * (3 - 2 * t);
}

function calcularMascaraLateral(distanciaDoEixo: number, y: number) {
  const larguraPescoco = 0.12;
  const larguraCabeca = 0.2;
  const larguraNaAltura =
    larguraPescoco + (larguraCabeca - larguraPescoco) * suavizar(-0.02, 0.12, y);
  return 1 - suavizar(larguraNaAltura, larguraNaAltura + 0.07, distanciaDoEixo);
}

function calcularLinhaMandibula(distanciaDoEixo: number) {
  return -0.02 + 0.055 * suavizar(0.07, 0.17, distanciaDoEixo);
}

export function calcularPesosAnatomicos(x: number, y: number): PesosAnatomicos {
  const distanciaDoEixo = Math.abs(x);
  const mascara = calcularMascaraLateral(distanciaDoEixo, y);
  const mandibula = calcularLinhaMandibula(distanciaDoEixo);

  return {
    baseCervical: suavizar(-0.17, -0.07, y) * mascara,
    meioCervical: suavizar(-0.12, -0.02, y) * mascara,
    cranio: suavizar(mandibula - 0.09, mandibula + 0.03, y) * mascara,
  };
}
