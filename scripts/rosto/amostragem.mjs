// ============================================================
// 1. GERADOR DE NÚMEROS COM SEMENTE
// Mesma semente, mesma nuvem de pontos: o arquivo gerado só
// muda quando a foto muda.
// ============================================================
function criarSorteio(semente) {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let mistura = estado;
    mistura = Math.imul(mistura ^ (mistura >>> 15), mistura | 1);
    mistura ^= mistura + Math.imul(mistura ^ (mistura >>> 7), mistura | 61);
    return ((mistura ^ (mistura >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// 2. FORÇA DA BORDA (SOBEL)
// ============================================================
function calcularBordas(brilho, largura, altura) {
  const bordas = new Float32Array(largura * altura);
  const valorEm = (x, y) => {
    const xLimitado = Math.min(largura - 1, Math.max(0, x));
    const yLimitado = Math.min(altura - 1, Math.max(0, y));
    return brilho[yLimitado * largura + xLimitado];
  };
  for (let y = 0; y < altura; y += 1) {
    for (let x = 0; x < largura; x += 1) {
      const horizontal =
        valorEm(x + 1, y - 1) +
        2 * valorEm(x + 1, y) +
        valorEm(x + 1, y + 1) -
        valorEm(x - 1, y - 1) -
        2 * valorEm(x - 1, y) -
        valorEm(x - 1, y + 1);
      const vertical =
        valorEm(x - 1, y + 1) +
        2 * valorEm(x, y + 1) +
        valorEm(x + 1, y + 1) -
        valorEm(x - 1, y - 1) -
        2 * valorEm(x, y - 1) -
        valorEm(x + 1, y - 1);
      bordas[y * largura + x] = Math.min(1, Math.hypot(horizontal, vertical));
    }
  }
  return bordas;
}

// ============================================================
// 3. PESO ACUMULADO POR PIXEL
// Peso = (0,15 + 0,55 · brilho + 0,6 · borda) · máscara. A base de
// 0,15 garante pontos também nas áreas escuras do rosto.
// ============================================================
function acumularPesos({ brilho, mascara, largura, altura }) {
  const bordas = calcularBordas(brilho, largura, altura);
  const acumulado = new Float64Array(largura * altura);
  let soma = 0;
  for (let indice = 0; indice < acumulado.length; indice += 1) {
    soma += (0.15 + 0.55 * brilho[indice] + 0.6 * bordas[indice]) * mascara[indice];
    acumulado[indice] = soma;
  }
  if (soma <= 0) {
    throw new Error("A imagem não tem nenhuma área válida para gerar pontos.");
  }
  return acumulado;
}

function buscarPixel(acumulado, alvo) {
  let inicio = 0;
  let fim = acumulado.length - 1;
  while (inicio < fim) {
    const meio = (inicio + fim) >> 1;
    if (acumulado[meio] < alvo) {
      inicio = meio + 1;
    } else {
      fim = meio;
    }
  }
  return inicio;
}

// ============================================================
// 4. AMOSTRAGEM
// Cada ponto é sorteado de forma independente, então qualquer
// prefixo do resultado já é uma amostra uniforme da nuvem.
// Saída: [x, y, z, brilho] por ponto; x/y em -0,5..0,5 com y
// para cima, z em -0,15..0,15.
// ============================================================
export function amostrarPontos({ largura, altura, brilho, profundidade, mascara, total, semente }) {
  const acumulado = acumularPesos({ brilho, mascara, largura, altura });
  const pesoTotal = acumulado[acumulado.length - 1];
  const sortear = criarSorteio(semente);
  const maiorLado = Math.max(largura, altura);
  const pontos = new Float32Array(total * 4);

  for (let ponto = 0; ponto < total; ponto += 1) {
    const pixel = buscarPixel(acumulado, sortear() * pesoTotal);
    const pixelX = pixel % largura;
    const pixelY = Math.floor(pixel / largura);
    const deslocamentoX = sortear() - 0.5;
    const deslocamentoY = sortear() - 0.5;
    const saida = ponto * 4;
    pontos[saida] = (pixelX + 0.5 + deslocamentoX - largura / 2) / maiorLado;
    pontos[saida + 1] = -(pixelY + 0.5 + deslocamentoY - altura / 2) / maiorLado;
    pontos[saida + 2] = (profundidade[pixel] - 0.5) * 0.3;
    pontos[saida + 3] = brilho[pixel];
  }

  return pontos;
}
