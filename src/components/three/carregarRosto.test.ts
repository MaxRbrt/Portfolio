import { describe, expect, it } from "vitest";
import { limitePorDispositivo, recortarPontos } from "./carregarRosto";

const criarPontos = (total: number) =>
  Float32Array.from({ length: total * 4 }, (_, indice) => indice);

describe("recortarPontos", () => {
  it("devolve só o prefixo pedido", () => {
    const recorte = recortarPontos(criarPontos(10), 3);
    expect(recorte.length).toBe(12);
    expect(Array.from(recorte)).toEqual(Array.from(criarPontos(3)));
  });

  it("não passa do total disponível", () => {
    expect(recortarPontos(criarPontos(5), 100).length).toBe(20);
  });

  it("recusa arquivo com tamanho quebrado", () => {
    expect(() => recortarPontos(new Float32Array(10), 5)).toThrow();
  });

  it("recusa arquivo vazio", () => {
    expect(() => recortarPontos(new Float32Array(0), 5)).toThrow();
  });
});

describe("limitePorDispositivo", () => {
  it("celular recebe menos pontos", () => {
    expect(limitePorDispositivo(375, true)).toBe(25000);
    expect(limitePorDispositivo(1024, true)).toBe(25000);
    expect(limitePorDispositivo(700, false)).toBe(25000);
  });

  it("computador recebe a nuvem cheia", () => {
    expect(limitePorDispositivo(1440, false)).toBe(60000);
  });
});
