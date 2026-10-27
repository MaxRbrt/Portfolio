// ============================================================
// 1. TRAJETÓRIA
// Só fatos confirmados. Novas etapas entram no topo da lista.
// ============================================================

export type EtapaTrajetoria = {
  periodo: string;
  titulo: string;
  lugar: string;
  descricao: string;
};

export const trajetoria: EtapaTrajetoria[] = [
  {
    periodo: "Jul 2026 — hoje",
    titulo: "Estágio em desenvolvimento",
    lugar: "Transroni · Taquarituba, SP",
    descricao:
      "APIs REST em NestJS com TypeORM e MySQL, telas em React com TypeScript e automações no n8n integrando APIs e webhooks.",
  },
  {
    periodo: "Conclusão em dez 2026",
    titulo: "Análise e Desenvolvimento de Sistemas",
    lugar: "UNEDUVALE",
    descricao: "Graduação tecnológica em desenvolvimento de sistemas.",
  },
];
