import { describe, expect, it } from "vitest";
import { separarRosto } from "./separarRosto";

describe("separação do rosto", () => {
  it("mantém cabeça e corpo independentes e divide a transição sem perder pontos", () => {
    const pontos = new Float32Array([0, 0.2, 0, 0.8, 0, -0.01, 0, 0.5, 0, -0.2, 0, 0.3]);
    const { cabeca, corpo } = separarRosto(pontos);

    expect(cabeca.pontos.length / 4).toBe(2);
    expect(corpo.pontos.length / 4).toBe(2);
    expect(cabeca.pesos[0]).toBe(1);
    expect(corpo.pesos[1]).toBe(1);
    expect(cabeca.pesos[1] + corpo.pesos[0]).toBeCloseTo(1);
  });
});
