import { describe, expect, it } from "vitest";
import { calcularPesosAnatomicos } from "./pesosAnatomicos";

function somarInfluencia(x: number, y: number) {
  const pesos = calcularPesosAnatomicos(x, y);
  return pesos.baseCervical * 0.15 + pesos.meioCervical * 0.3 + pesos.cranio * 0.55;
}

describe("pesos anatômicos", () => {
  it("mantém cabeça inteira e ombros imóveis", () => {
    expect(calcularPesosAnatomicos(0, 0.2)).toEqual({
      baseCervical: 1,
      meioCervical: 1,
      cranio: 1,
    });
    expect(calcularPesosAnatomicos(0.16, 0.22)).toEqual({
      baseCervical: 1,
      meioCervical: 1,
      cranio: 1,
    });
    expect(calcularPesosAnatomicos(0.3, -0.1)).toEqual({
      baseCervical: 0,
      meioCervical: 0,
      cranio: 0,
    });
    expect(calcularPesosAnatomicos(0, -0.3)).toEqual({
      baseCervical: 0,
      meioCervical: 0,
      cranio: 0,
    });
  });

  it("reduz a influência aos poucos do queixo até a base do pescoço", () => {
    const alturas = [0.03, -0.02, -0.06, -0.1, -0.14];
    const influencias = alturas.map((y) => somarInfluencia(0.03, y));

    for (let indice = 1; indice < influencias.length; indice += 1) {
      expect(influencias[indice]).toBeLessThan(influencias[indice - 1]);
    }
    expect(influencias[influencias.length - 1]).toBeGreaterThan(0);
  });

  it("não tem degrau: passo pequeno na altura muda pouco o peso", () => {
    for (let y = -0.25; y < 0.2; y += 0.005) {
      const salto = Math.abs(somarInfluencia(0.05, y + 0.005) - somarInfluencia(0.05, y));
      expect(salto).toBeLessThan(0.08);
    }
  });

  it("acompanha o pescoço sem levar o ombro na mesma altura", () => {
    expect(somarInfluencia(0.04, -0.05)).toBeGreaterThan(0.3);
    expect(somarInfluencia(0.25, -0.05)).toBe(0);
  });
});
