// ============================================================
// 1. PROJETOS
// "vitrine" coloca o projeto na galeria curva com imagem; os
// demais aparecem na lista de outros projetos. "site" e
// "codigo" são opcionais: repositório privado fica só com site.
// ============================================================

export type Projeto = {
  id: string;
  titulo: string;
  categoria: string;
  contexto: string;
  destaque: string;
  descricao: string;
  tecnologias: string[];
  imagem?: string;
  descricaoImagem?: string;
  site?: string;
  codigo?: string;
  vitrine: boolean;
};

const imagemDoProjeto = (arquivo: string) =>
  `${import.meta.env.BASE_URL}assets/projects/${arquivo}`;

export const projetos: Projeto[] = [
  {
    id: "edutrack",
    titulo: "EduTrack",
    categoria: "Sistema web",
    contexto: "Portaria da ETEC de Botucatu",
    destaque: "O portão fecha e a portaria registra.",
    descricao:
      "Quem chega atrasado é registrado com foto, motivo e horário. A coordenação acompanha a reincidência no painel, gera PDF e o sistema funciona até sem internet.",
    tecnologias: ["React", "TypeScript", "Fastify", "MySQL"],
    imagem: imagemDoProjeto("edutrack.webp"),
    descricaoImagem: "Página do EduTrack com o título O portão fecha às 07:00 e um relógio",
    site: "https://maxrbrt.github.io/EduTrack/",
    codigo: "https://github.com/MaxRbrt/EduTrack",
    vitrine: true,
  },
  {
    id: "ticketflow",
    titulo: "TicketFlow",
    categoria: "Sistema web",
    contexto: "Help desk em tempo real",
    destaque: "O suporte inteiro num painel.",
    descricao:
      "Chamados com chat ao vivo, metas de SLA, relatórios e base de conhecimento. Cada perfil vê só o que pode, com regras de segurança no próprio banco.",
    tecnologias: ["Vue 3", "Pinia", "Firebase", "Firestore"],
    imagem: imagemDoProjeto("ticketflow.webp"),
    descricaoImagem: "Página do TicketFlow com painel de chamados e meta de SLA",
    site: "https://projetoticketflow-c3b5c.web.app",
    codigo: "https://github.com/MaxRbrt/TicketFlow",
    vitrine: true,
  },
  {
    id: "reciclaplus",
    titulo: "ReciclaPlus",
    categoria: "App mobile",
    contexto: "App de pontos de coleta",
    destaque: "O ponto de coleta mais perto, no mapa.",
    descricao:
      "App mobile para encontrar, cadastrar e favoritar pontos de coleta de recicláveis, com foto, GPS e a comunidade de cada cidade.",
    tecnologias: ["React Native", "Expo", "Express", "MySQL"],
    imagem: imagemDoProjeto("reciclaplus.webp"),
    descricaoImagem: "Página do ReciclaPlus com floresta ao fundo e o título Pequenas atitudes",
    site: "https://maxrbrt.github.io/ReciclaPlus/",
    codigo: "https://github.com/MaxRbrt/ReciclaPlus",
    vitrine: true,
  },
  {
    id: "vinicio",
    titulo: "Vinicio Campos",
    categoria: "Landing page",
    contexto: "Landing para um personal trainer",
    destaque: "Uma página feita para um cliente de verdade.",
    descricao:
      "Landing de consultoria online de treino, pensada para levar o visitante até a conversa no WhatsApp, com rolagem animada e comparador de antes e depois.",
    tecnologias: ["React", "TypeScript", "Tailwind", "GSAP"],
    imagem: imagemDoProjeto("vinicio.webp"),
    descricaoImagem: "Landing page do personal trainer Vinicio Campos com foto dele na academia",
    site: "https://landingpage-1d1b2.firebaseapp.com/",
    vitrine: true,
  },
  {
    id: "aplicativo",
    titulo: "Aplicativo Mobile",
    categoria: "App mobile",
    contexto: "Loja com painel administrativo",
    destaque: "Loja no celular com área de administração.",
    descricao: "Loja em Expo Router com painel administrativo e login por API PHP/MySQL.",
    tecnologias: ["Expo Router", "PHP", "MySQL"],
    codigo: "https://github.com/MaxRbrt/Aplicativo",
    vitrine: false,
  },
  {
    id: "ecommerce",
    titulo: "E-commerce",
    categoria: "Sistema web",
    contexto: "Loja com MVC no servidor",
    destaque: "Loja completa renderizada no servidor.",
    descricao: "Express, EJS, MySQL e Sequelize com MVC, upload de imagens e sessões.",
    tecnologias: ["Express", "EJS", "MySQL", "Sequelize"],
    codigo: "https://github.com/MaxRbrt/ecommerce",
    vitrine: false,
  },
  {
    id: "portfolio",
    titulo: "Este portfólio",
    categoria: "Site",
    contexto: "Rosto em partículas e rolagem",
    destaque: "O site que você está vendo.",
    descricao:
      "React, TypeScript, React Three Fiber e GSAP. O rosto é uma nuvem de pontos gerada a partir de uma foto.",
    tecnologias: ["React", "TypeScript", "three.js", "GSAP"],
    codigo: "https://github.com/MaxRbrt/Portfolio",
    vitrine: false,
  },
];
