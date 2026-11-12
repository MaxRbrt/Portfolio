// ============================================================
// 1. FORMA DA GRADE CILÍNDRICA
// Parede de dentro de um cilindro em pé, com quem olha lá
// dentro: linhas verticais retas e anéis horizontais que curvam
// para as bordas da tela. lateral: 0 no meio da tela, 1 na
// borda.
// ============================================================
export const RAIO_CILINDRO = 6;
export const Z_EIXO_CILINDRO = 1.6;
const ALTURA_CILINDRO = 7;
const ABERTURA_MAXIMA = (78 * Math.PI) / 180;

export type LinhasGrade = {
  posicoes: Float32Array;
  laterais: Float32Array;
};

function validarDivisao(nome: string, valor: number) {
  const divisaoValida = Number.isInteger(valor) && valor >= 1;
  if (!divisaoValida) {
    throw new Error(`Grade com ${nome} "${valor}" inválida: esperado inteiro maior ou igual a 1`);
  }
}

// ============================================================
// 2. VÉRTICES
// Linhas verticais: um trecho reto por coluna. Anéis: vários
// trechos por fileira, para acompanhar a curva da parede.
// ============================================================
export function criarLinhasGrade(
  colunas: number,
  fileiras: number,
  segmentos: number,
): LinhasGrade {
  validarDivisao("colunas", colunas);
  validarDivisao("fileiras", fileiras);
  validarDivisao("segmentos", segmentos);
  const posicoes: number[] = [];
  const laterais: number[] = [];

  const adicionarVertice = (fracaoAngulo: number, fracaoAltura: number) => {
    const angulo = (fracaoAngulo - 0.5) * 2 * ABERTURA_MAXIMA;
    const x = RAIO_CILINDRO * Math.sin(angulo);
    const y = (fracaoAltura - 0.5) * ALTURA_CILINDRO;
    const z = Z_EIXO_CILINDRO - RAIO_CILINDRO * Math.cos(angulo);
    posicoes.push(x, y, z);
    laterais.push(Math.abs(fracaoAngulo - 0.5) * 2);
  };

  for (let coluna = 0; coluna <= colunas; coluna += 1) {
    adicionarVertice(coluna / colunas, 0);
    adicionarVertice(coluna / colunas, 1);
  }

  for (let fileira = 0; fileira <= fileiras; fileira += 1) {
    for (let segmento = 0; segmento < segmentos; segmento += 1) {
      adicionarVertice(segmento / segmentos, fileira / fileiras);
      adicionarVertice((segmento + 1) / segmentos, fileira / fileiras);
    }
  }

  return {
    posicoes: new Float32Array(posicoes),
    laterais: new Float32Array(laterais),
  };
}
