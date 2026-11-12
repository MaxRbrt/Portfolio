import { MathUtils } from "three";

// ============================================================
// 1. MEDIDAS DA INDÚSTRIA
// Lidas do retângulo da seção #sobre a cada quadro.
// crescimento: 0 com o topo no pé da tela, 1 com o topo no alto
// (a última imagem da galeria virou a tela cheia).
// avanco: câmera andando pela fábrica enquanto o palco está preso.
// saida: a cena sobe junto com o fim da seção.
// ============================================================
export type MedidasIndustria = {
  crescimento: number;
  avanco: number;
  saida: number;
};

const INICIO_DA_CENA_2 = 0.22;
const FIM_DA_CENA_2 = 0.42;
const INICIO_DA_CENA_3 = 0.58;
const FIM_DA_CENA_3 = 0.78;

export function medirIndustria(
  topo: number,
  base: number,
  alturaDaSecao: number,
  alturaDaTela: number,
): MedidasIndustria {
  if (!(alturaDaTela > 0)) {
    throw new Error(`Altura de tela "${alturaDaTela}" inválida: esperado número maior que zero`);
  }
  const percursoPreso = Math.max(1, alturaDaSecao - alturaDaTela);
  return {
    crescimento: MathUtils.clamp(1 - topo / alturaDaTela, 0, 1),
    avanco: MathUtils.clamp(-topo / percursoPreso, 0, 1),
    saida: MathUtils.clamp((alturaDaTela - base) / alturaDaTela, 0, 1),
  };
}

// ============================================================
// 2. TROCA CRUZADA DAS CENAS
// Peso de industrial-1, 2 e 3 conforme a câmera avança. Os três
// somam 1.
// ============================================================
export function pesosDasCenas(avanco: number): [number, number, number] {
  const entradaDaCena2 = MathUtils.smoothstep(avanco, INICIO_DA_CENA_2, FIM_DA_CENA_2);
  const entradaDaCena3 = MathUtils.smoothstep(avanco, INICIO_DA_CENA_3, FIM_DA_CENA_3);
  const restoSemCena3 = 1 - entradaDaCena3;
  return [(1 - entradaDaCena2) * restoSemCena3, entradaDaCena2 * restoSemCena3, entradaDaCena3];
}
