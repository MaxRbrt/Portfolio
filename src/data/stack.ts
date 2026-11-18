// ============================================================
// 1. TECH STACK
// Fonte: package.json, Dockerfile e README dos 18 repositórios
// de github.com/MaxRbrt (18/11/2026) e o estágio na Transroni.
// Só entra o que aparece em código real.
// ============================================================
export type GrupoStack = {
  readonly nome: string;
  readonly tecnologias: readonly string[];
};

export const gruposStack: readonly GrupoStack[] = [
  {
    nome: "Linguagens",
    tecnologias: ["TypeScript", "JavaScript", "Python", "PHP", "HTML", "CSS"],
  },
  {
    nome: "Tela",
    tecnologias: [
      "React",
      "Next.js",
      "Vue",
      "React Native",
      "Expo",
      "Tailwind",
      "shadcn/ui",
      "three.js",
      "GSAP",
      "Motion",
    ],
  },
  {
    nome: "Estado e rotas",
    tecnologias: ["TanStack Query", "TanStack Router", "Pinia", "Vue Router", "React Router"],
  },
  {
    nome: "Servidor",
    tecnologias: ["Node.js", "NestJS", "Express", "Fastify", "Socket.IO", "Swagger", "JWT"],
  },
  {
    nome: "Banco",
    tecnologias: [
      "MySQL",
      "PostgreSQL",
      "TypeORM",
      "Prisma",
      "Sequelize",
      "Supabase",
      "Firebase",
    ],
  },
  {
    nome: "Testes",
    tecnologias: ["Vitest", "Jest", "Playwright", "Testing Library", "MSW"],
  },
  { nome: "Automação", tecnologias: ["n8n", "Webhooks", "APIs REST"] },
  { nome: "Ferramentas", tecnologias: ["Git", "GitHub", "Docker", "Vite", "pnpm"] },
];
