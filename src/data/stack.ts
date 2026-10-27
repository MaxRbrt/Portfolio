// ============================================================
// 1. STACK
// Tecnologias agrupadas pelo papel que cumprem no sistema.
// ============================================================

export type GrupoStack = {
  id: string;
  titulo: string;
  resumo: string;
  itens: string[];
};

export const gruposStack: GrupoStack[] = [
  {
    id: "tela",
    titulo: "Tela",
    resumo: "Interfaces em React e Vue, com animação quando ela ajuda a entender.",
    itens: ["React", "TypeScript", "Vue", "React Native", "Tailwind", "three.js", "GSAP"],
  },
  {
    id: "servidor",
    titulo: "Servidor",
    resumo: "APIs REST com regras claras, validação e autenticação.",
    itens: ["Node.js", "NestJS", "Express", "Fastify"],
  },
  {
    id: "banco",
    titulo: "Banco",
    resumo: "Modelagem relacional e consultas que aguentam o dia a dia.",
    itens: ["MySQL", "TypeORM", "Sequelize", "Firestore"],
  },
  {
    id: "automacao",
    titulo: "Automação",
    resumo: "Fluxos no n8n ligando sistemas, APIs e webhooks.",
    itens: ["n8n", "Webhooks", "APIs REST"],
  },
];
