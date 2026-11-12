export type EtapaTransicao = {
  inicio: number;
  duracao: number;
};

// ============================================================
// 1. ETAPAS ENCADEADAS
// Cada etapa começa quando a anterior está pela metade. O
// resultado é normalizado: a última etapa termina em 1.
// ============================================================
export function encadearEtapas(duracoes: number[]): EtapaTransicao[] {
  if (duracoes.length === 0) {
    throw new Error("Lista de durações vazia: esperado ao menos 1 número maior que zero");
  }
  const etapas: EtapaTransicao[] = [];
  let inicio = 0;
  duracoes.forEach((duracao) => {
    if (!(duracao > 0)) {
      throw new Error(`Duração ${duracao} inválida: esperado número maior que zero`);
    }
    etapas.push({ inicio, duracao });
    inicio += duracao / 2;
  });
  const ultima = etapas[etapas.length - 1];
  const total = ultima.inicio + ultima.duracao;
  return etapas.map((etapa) => ({
    inicio: etapa.inicio / total,
    duracao: etapa.duracao / total,
  }));
}
