const INICIO_TRANSICAO = -0.025;
const FIM_TRANSICAO = 0.005;

export const PIVO_CABECA_Y = -0.03;

export type ParteRosto = {
  pontos: Float32Array;
  pesos: Float32Array;
};

export function separarRosto(pontos: Float32Array): { cabeca: ParteRosto; corpo: ParteRosto } {
  const cabeca: number[] = [];
  const corpo: number[] = [];
  const pesosCabeca: number[] = [];
  const pesosCorpo: number[] = [];

  for (let indice = 0; indice < pontos.length; indice += 4) {
    const y = pontos[indice + 1];
    const pesoCabeca = Math.max(
      0,
      Math.min(1, (y - INICIO_TRANSICAO) / (FIM_TRANSICAO - INICIO_TRANSICAO)),
    );
    if (pesoCabeca > 0) {
      cabeca.push(...pontos.subarray(indice, indice + 4));
      pesosCabeca.push(pesoCabeca);
    }
    if (pesoCabeca < 1) {
      corpo.push(...pontos.subarray(indice, indice + 4));
      pesosCorpo.push(1 - pesoCabeca);
    }
  }

  return {
    cabeca: { pontos: Float32Array.from(cabeca), pesos: Float32Array.from(pesosCabeca) },
    corpo: { pontos: Float32Array.from(corpo), pesos: Float32Array.from(pesosCorpo) },
  };
}
