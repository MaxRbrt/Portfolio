import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import type { RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

const midiaDesktopComMovimento = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";
const midiaLeveComMovimento = "(max-width: 63.99rem) and (prefers-reduced-motion: no-preference)";
const seletorProjetoDestaque = ".projetos-lista > .projeto";

type PartesProjeto = {
  readonly imagem: HTMLElement;
  readonly foto: HTMLElement;
  readonly numero: HTMLElement;
  readonly detalhes: HTMLElement[];
};

// ============================================================
// 1. PARTES DE CADA PROJETO EM DESTAQUE
// ============================================================
function buscarPartesProjeto(projeto: HTMLElement): PartesProjeto | null {
  const imagem = projeto.querySelector<HTMLElement>(".projeto-imagem");
  const foto = projeto.querySelector<HTMLElement>(".projeto-imagem img");
  const numero = projeto.querySelector<HTMLElement>(".projeto-numero");
  const info = projeto.querySelector<HTMLElement>(".projeto-info");
  const faltaParte = !imagem || !foto || !numero || !info;

  if (faltaParte) return null;

  return { imagem, foto, numero, detalhes: Array.from(info.children) as HTMLElement[] };
}

function revelarDetalhes(projeto: HTMLElement, detalhes: HTMLElement[]) {
  gsap.from(detalhes, {
    y: 32,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.07,
    scrollTrigger: { trigger: projeto, start: "top 75%", once: true },
  });
}

// ============================================================
// 2. DESKTOP (ANIM-PROJ-01)
// A imagem abre do recorte até a borda e a foto desliza dentro
// dela; o número sobe mais rápido que a página.
// ============================================================
function montarProjetoDesktop(projeto: HTMLElement, partes: PartesProjeto) {
  const passagemPelaTela = {
    trigger: projeto,
    start: "top bottom",
    end: "bottom top",
    scrub: 0.6,
  };

  gsap.fromTo(
    partes.imagem,
    { clipPath: "inset(12% 8% 12% 8% round 4px)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 4px)",
      ease: "none",
      scrollTrigger: { trigger: projeto, start: "top 95%", end: "top 35%", scrub: 0.6 },
    },
  );

  gsap.fromTo(
    partes.foto,
    { scale: 1.16, yPercent: -8 },
    { scale: 1.16, yPercent: 8, ease: "none", scrollTrigger: passagemPelaTela },
  );

  gsap.fromTo(
    partes.numero,
    { yPercent: 30 },
    { yPercent: -30, ease: "none", scrollTrigger: passagemPelaTela },
  );

  revelarDetalhes(projeto, partes.detalhes);
}

// ============================================================
// 3. CELULAR E TABLET
// Sem parallax: a imagem abre de baixo e os detalhes sobem.
// ============================================================
function montarProjetoLeve(projeto: HTMLElement, partes: PartesProjeto) {
  gsap.fromTo(
    partes.imagem,
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.8,
      ease: "power3.out",
      clearProps: "clipPath",
      scrollTrigger: { trigger: partes.imagem, start: "top 85%", once: true },
    },
  );

  revelarDetalhes(projeto, partes.detalhes);
}

function montarProjetosDestaque(secao: HTMLElement, montarProjeto: typeof montarProjetoDesktop) {
  const projetos = gsap.utils.toArray<HTMLElement>(seletorProjetoDestaque, secao);

  projetos.forEach((projeto) => {
    const partes = buscarPartesProjeto(projeto);
    if (partes) montarProjeto(projeto, partes);
  });
}

export function useMovimentoProjetos(secao: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const elementoSecao = secao.current;
    if (!elementoSecao) return;

    const preferencias = gsap.matchMedia(elementoSecao);
    preferencias.add(midiaDesktopComMovimento, () =>
      montarProjetosDestaque(elementoSecao, montarProjetoDesktop),
    );
    preferencias.add(midiaLeveComMovimento, () =>
      montarProjetosDestaque(elementoSecao, montarProjetoLeve),
    );

    return () => {
      preferencias.revert();
    };
  }, [secao]);
}
