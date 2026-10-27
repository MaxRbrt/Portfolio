import { describe, expect, it } from "vitest";
import { calcularDispersao, calcularOpacidade, OPACIDADE_NO_CONTATO } from "./estadoCena";

describe("estado da cena", () => {
  it("no topo o rosto está inteiro e opaco", () => {
    expect(calcularDispersao(0, 0)).toBe(0);
    expect(calcularOpacidade(0, 0)).toBe(1);
  });

  it("depois do hero o rosto some espalhado", () => {
    expect(calcularDispersao(1, 0)).toBe(1);
    expect(calcularOpacidade(1, 0)).toBe(0);
  });

  it("no contato o rosto volta formado e mais apagado", () => {
    expect(calcularDispersao(1, 1)).toBe(0);
    expect(calcularOpacidade(1, 1)).toBeCloseTo(OPACIDADE_NO_CONTATO);
  });
});
