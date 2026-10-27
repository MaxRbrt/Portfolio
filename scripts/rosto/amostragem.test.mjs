import { describe, expect, it } from "vitest";
import { amostrarPontos } from "./amostragem.mjs";

// ============================================================
// 1. IMAGENS DE TESTE
// Metade esquerda lisa, metade direita listrada com o mesmo
// brilho médio: a direita tem bordas fortes.
// ============================================================
function criarImagem(largura, altura, brilhoEm) {
  const total = largura * altura;
  const brilho = new Float32Array(total);
  const profundidade = new Float32Array(total).fill(0.5);
  const mascara = new Float32Array(total).fill(1);
  for (let y = 0; y < altura; y += 1) {
    for (let x = 0; x < largura; x += 1) {
      brilho[y * largura + x] = brilhoEm(x, y);
    }
  }
  return { largura, altura, brilho, profundidade, mascara };
}

const listrada = (x) => {
  const ladoDireito = x >= 20;
  if (!ladoDireito) {
    return 0.5;
  }
  return Math.floor(x / 2) % 2 === 0 ? 0.2 : 0.8;
};

describe("amostrarPontos", () => {
  it("devolve 4 valores por ponto", () => {
    const imagem = criarImagem(40, 20, () => 0.5);
    const pontos = amostrarPontos({ ...imagem, total: 500, semente: 1 });
    expect(pontos).toBeInstanceOf(Float32Array);
    expect(pontos.length).toBe(2000);
  });

  it("não coloca ponto onde a máscara é zero", () => {
    const imagem = criarImagem(40, 20, () => 0.6);
    imagem.mascara.fill(0, 0, 40 * 10);
    const pontos = amostrarPontos({ ...imagem, total: 2000, semente: 2 });
    for (let indice = 0; indice < pontos.length; indice += 4) {
      expect(pontos[indice + 1]).toBeLessThanOrEqual(0);
    }
  });

  it("mesma semente gera o mesmo resultado", () => {
    const imagem = criarImagem(40, 20, listrada);
    const primeira = amostrarPontos({ ...imagem, total: 300, semente: 7 });
    const segunda = amostrarPontos({ ...imagem, total: 300, semente: 7 });
    expect(Array.from(primeira)).toEqual(Array.from(segunda));
  });

  it("concentra mais pontos onde há borda forte", () => {
    const imagem = criarImagem(40, 20, listrada);
    const pontos = amostrarPontos({ ...imagem, total: 4000, semente: 3 });
    let esquerda = 0;
    let direita = 0;
    for (let indice = 0; indice < pontos.length; indice += 4) {
      if (pontos[indice] < 0) {
        esquerda += 1;
      } else {
        direita += 1;
      }
    }
    expect(direita).toBeGreaterThan(esquerda * 1.5);
  });

  it("mantém coordenadas e brilho nas faixas combinadas", () => {
    const imagem = criarImagem(40, 20, listrada);
    imagem.profundidade.fill(1);
    const pontos = amostrarPontos({ ...imagem, total: 1000, semente: 4 });
    for (let indice = 0; indice < pontos.length; indice += 4) {
      expect(Math.abs(pontos[indice])).toBeLessThanOrEqual(0.5);
      expect(Math.abs(pontos[indice + 1])).toBeLessThanOrEqual(0.5);
      expect(pontos[indice + 2]).toBeCloseTo(0.15, 5);
      expect(pontos[indice + 3]).toBeGreaterThanOrEqual(0);
      expect(pontos[indice + 3]).toBeLessThanOrEqual(1);
    }
  });

  it("recusa imagem sem nenhuma área válida", () => {
    const imagem = criarImagem(10, 10, () => 0.5);
    imagem.mascara.fill(0);
    expect(() => amostrarPontos({ ...imagem, total: 10, semente: 1 })).toThrow();
  });
});
