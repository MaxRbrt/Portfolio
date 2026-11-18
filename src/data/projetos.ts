// ============================================================
// 1. PROJETOS
// Fonte: os 18 repositórios de github.com/MaxRbrt (README,
// package.json e site publicado), varridos em 18/11/2026.
// Repositório privado não leva link de código.
// ============================================================
export type Projeto = {
  readonly nome: string;
  readonly categoria: string;
  readonly descricao: string;
  readonly stack: readonly string[];
  readonly site?: string;
  readonly codigo?: string;
};

export type ProjetoComImagem = Projeto & {
  readonly imagem: string;
};

const larguraBaseImagem = 1440;
const alturaBaseImagem = 846;
const largurasImagem = [720, 1440, 2880] as const;
const pastaImagensProjetos = `${import.meta.env.BASE_URL}images/projetos/`;
const repositorio = (nome: string) => `https://github.com/MaxRbrt/${nome}`;

export const dimensaoImagemProjeto = { largura: larguraBaseImagem, altura: alturaBaseImagem };

// ============================================================
// 2. CAMINHOS DA IMAGEM
// Cada imagem existe em 720, 1440 e 2880 px de largura.
// ============================================================
export function montarSrcImagemProjeto(imagem: string) {
  return `${pastaImagensProjetos}${imagem}-${larguraBaseImagem}.webp`;
}

export function montarSrcsetImagemProjeto(imagem: string) {
  return largurasImagem
    .map((largura) => `${pastaImagensProjetos}${imagem}-${largura}.webp ${largura}w`)
    .join(", ");
}

// ============================================================
// 3. DESTAQUES
// ============================================================
export const projetosDestaque: readonly ProjetoComImagem[] = [
  {
    nome: "Entrevia",
    categoria: "Sistema web com IA",
    descricao:
      "Triagem técnica por conversa: um modelo de linguagem entrevista o candidato sobre os " +
      "requisitos da vaga e gera a avaliação. Quem decide é sempre uma pessoa.",
    stack: ["React", "TypeScript", "NestJS", "TypeORM", "MySQL", "three.js"],
    imagem: "entrevia",
  },
  {
    nome: "Flowrise CRM",
    categoria: "CRM, TCC na UNEDUVALE",
    descricao:
      "Clientes, empresas, leads, funil de vendas e tarefas, com um assistente conversacional " +
      "que só consulta os dados da empresa.",
    stack: ["React", "TypeScript", "NestJS", "Prisma", "PostgreSQL", "Supabase"],
    imagem: "flowrise",
  },
  {
    nome: "KURIO",
    categoria: "Desafio de front-end",
    descricao:
      "Marketplace de NFTs para o desafio da Jungle Gaming. API e eventos em tempo real " +
      "simulados com MSW, testes E2E e de acessibilidade no Playwright.",
    stack: ["React", "TypeScript", "TanStack Router", "Socket.IO", "Tailwind", "Playwright"],
    site: "https://kurio-nft-marketplace-nine.vercel.app",
    codigo: repositorio("kurio-nft-marketplace"),
    imagem: "kurio",
  },
  {
    nome: "EduTrack",
    categoria: "Sistema web",
    descricao:
      "Portaria da ETEC de Botucatu: registra quem chega atrasado com foto, motivo e horário. " +
      "A coordenação acompanha a reincidência no painel e gera PDF. Funciona offline.",
    stack: ["React", "TypeScript", "Fastify", "MySQL"],
    site: "https://maxrbrt.github.io/EduTrack/",
    codigo: repositorio("EduTrack"),
    imagem: "edutrack",
  },
  {
    nome: "ReciclaPlus",
    categoria: "App mobile",
    descricao:
      "App para encontrar, cadastrar e favoritar pontos de coleta de recicláveis, com mapa, " +
      "foto e GPS.",
    stack: ["React Native", "Expo", "Express", "MySQL"],
    site: "https://maxrbrt.github.io/ReciclaPlus/",
    codigo: repositorio("ReciclaPlus"),
    imagem: "reciclaplus",
  },
];

// ============================================================
// 4. GALERIA
// ============================================================
export const projetosGaleria: readonly ProjetoComImagem[] = [
  {
    nome: "TicketFlow",
    categoria: "Sistema web",
    descricao:
      "Help desk em tempo real: chamados, chat ao vivo, metas de SLA, relatórios e base de " +
      "conhecimento, com acesso por perfil.",
    stack: ["Vue 3", "Pinia", "Firebase", "Firestore"],
    site: "https://projetoticketflow-c3b5c.web.app",
    codigo: repositorio("TicketFlow"),
    imagem: "ticketflow",
  },
  {
    nome: "Vinicio Campos",
    categoria: "Landing page",
    descricao:
      "Landing de consultoria online para um personal trainer, cliente real. Leva ao WhatsApp " +
      "e tem comparador de antes e depois.",
    stack: ["React", "Tailwind", "GSAP", "three.js"],
    site: "https://landingpage-1d1b2.firebaseapp.com/",
    codigo: repositorio("LandingPageVC"),
    imagem: "vinicio",
  },
  {
    nome: "Loja NX",
    categoria: "Loja web",
    descricao:
      "Front da loja que consome a API em NestJS, pensado para quem tem mais de 70 anos: " +
      "texto de 18 px e controles de 48 px.",
    stack: ["React", "TypeScript", "Tailwind", "GSAP", "Vitest"],
    codigo: repositorio("ProjetoNestFront"),
    imagem: "loja-nx",
  },
  {
    nome: "FinanceApp",
    categoria: "Sistema web",
    descricao:
      "Controle financeiro pessoal: painel, transações, metas e perfil, com conta de demonstração.",
    stack: ["Vue 3", "Pinia", "Vue Router", "Firebase"],
    codigo: repositorio("ProjetoFinancias"),
    imagem: "financeapp",
  },
  {
    nome: "FAST",
    categoria: "App mobile",
    descricao:
      "Loja em Expo Router com vitrine, carrinho, painel administrativo e login por API PHP.",
    stack: ["Expo Router", "React Native", "PHP", "MySQL"],
    codigo: repositorio("Aplicativo"),
    imagem: "aplicativo-fast",
  },
  {
    nome: "Tech Test Lab",
    categoria: "Estudo de interface",
    descricao:
      "Página para testar layout responsivo, animações de rolagem e componentes reutilizáveis.",
    stack: ["Next.js", "Tailwind", "GSAP", "Motion", "Lenis"],
    imagem: "tech-test-lab",
  },
  {
    nome: "Calculadora",
    categoria: "Estudo de interface",
    descricao: "Calculadora no estilo do iPhone, com teclado físico, histórico e microinterações.",
    stack: ["HTML", "CSS", "JavaScript", "GSAP"],
    imagem: "calculadora",
  },
  {
    nome: "Vue + Firebase",
    categoria: "Estudo",
    descricao: "Login com Firebase Auth, rotas protegidas e painel de despesas.",
    stack: ["Vue 3", "Pinia", "Vue Router", "Firebase"],
    codigo: repositorio("ProjetoVue"),
    imagem: "vue-firebase",
  },
  {
    nome: "Portfólio",
    categoria: "Site",
    descricao: "Este site: busto 3D que acompanha o cursor e cena presa na rolagem.",
    stack: ["React", "TypeScript", "three.js", "GSAP", "Tailwind"],
    site: "https://maxrbrt.github.io/Portfolio/",
    codigo: repositorio("Portfolio"),
    imagem: "portfolio",
  },
  {
    nome: "Perfil do GitHub",
    categoria: "Automação",
    descricao: "README do perfil com imagens geradas por script.",
    stack: ["Python", "Pillow"],
    codigo: repositorio("MaxRbrt"),
    imagem: "perfil-github",
  },
];

// ============================================================
// 5. SEM IMAGEM
// Precisam de banco para rodar; ficam só como texto.
// ============================================================
export const projetosSemImagem: readonly Projeto[] = [
  {
    nome: "API Loja NX",
    categoria: "API REST",
    descricao:
      "Catálogo e pedidos, com JWT e sessões revogáveis, senha em argon2 e documentação no " +
      "Swagger.",
    stack: ["NestJS", "TypeORM", "PostgreSQL", "Jest"],
  },
  {
    nome: "E-commerce",
    categoria: "Sistema web",
    descricao: "Loja MVC renderizada no servidor, com upload de imagens e sessões.",
    stack: ["Express", "EJS", "MySQL", "Sequelize"],
    codigo: repositorio("ecommerce"),
  },
];
