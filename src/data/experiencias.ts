// ============================================================
// 1. EXPERIÊNCIA E FORMAÇÃO
// Fonte: docs/CONTENT.md ("Experiência (publicado)" e "Sobre").
// Atividades além destas aguardam confirmação.
// ============================================================
export type Experiencia = {
  readonly periodo: string;
  readonly cargo: string;
  readonly organizacao: string;
  readonly local: string;
  readonly atividades: readonly string[];
};

export const experiencias: readonly Experiencia[] = [
  {
    periodo: "jul. 2026 — atual",
    cargo: "Estágio em desenvolvimento",
    organizacao: "Transroni",
    local: "Taquarituba, SP",
    atividades: [
      "Criação e manutenção de APIs REST em NestJS com TypeORM e MySQL.",
      "Telas em React com TypeScript.",
      "Automações no n8n, integrando APIs e webhooks.",
    ],
  },
  {
    periodo: "conclusão prevista em dez. 2026",
    cargo: "Análise e Desenvolvimento de Sistemas",
    organizacao: "UNEDUVALE",
    local: "Avaré, SP",
    atividades: ["Graduação em andamento."],
  },
];
