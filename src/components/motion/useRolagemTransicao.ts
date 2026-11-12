import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { estadoCena } from "../three/estadoCena";
import { COM_MOVIMENTO, MOVIMENTO_REDUZIDO } from "../../hooks/useMidia";
import { encadearEtapas } from "./etapasTransicao";
import { reordenarGatilhos } from "./palcoPreso";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SUAVIZACAO_ROLAGEM = 0.6;
const COMPRIMENTO_DA_PRESA = "+=110%";
const SUBIDA_DO_TEXTO = -60;
const TEXTOS_DO_HERO = ".hero-topo, .hero-base";
const [RECUO, CURVA, LASCAS] = encadearEtapas([0.35, 0.45, 0.6]);
const [RECUO_SOLTO, GRADE_SOLTA, DISSOLUCAO_SOLTA] = encadearEtapas([0.3, 0.25, 0.375]);

// ============================================================
// 1. TEXTOS E CÂMERA
// O texto do hero sobe e some enquanto a câmera se afasta.
// ============================================================
function adicionarSaidaDosTextos(
  linhaDoTempo: gsap.core.Timeline,
  subidaDoTexto: number,
  etapa: { inicio: number; duracao: number },
) {
  linhaDoTempo
    .fromTo(
      TEXTOS_DO_HERO,
      { autoAlpha: 1, y: 0 },
      { autoAlpha: 0, y: subidaDoTexto, duration: etapa.duracao * 0.7 },
      etapa.inicio,
    )
    .fromTo(
      estadoCena,
      { recuo: 0 },
      { recuo: 1, duration: etapa.duracao, ease: "power1.inOut" },
      etapa.inicio,
    );
}

// ============================================================
// 2. TRANSIÇÃO PRESA
// O hero fica preso por pouco mais de uma tela: textos saem, a
// grade se curva e o rosto quebra em lascas. Depois a galeria
// sobe e leva o hero junto, como uma folha (ComposicaoCena). A
// grade só apaga quando a galeria já cobre a tela.
// ============================================================
function montarTransicaoPresa() {
  const hero = document.querySelector<HTMLElement>("#inicio");
  const galeria = document.querySelector<HTMLElement>("#projetos");
  if (!hero || !galeria) {
    return;
  }
  const linhaDoTempo = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: COMPRIMENTO_DA_PRESA,
      pin: true,
      scrub: SUAVIZACAO_ROLAGEM,
    },
  });
  adicionarSaidaDosTextos(linhaDoTempo, SUBIDA_DO_TEXTO, RECUO);
  linhaDoTempo
    .fromTo(
      estadoCena,
      { curvaGrade: 0 },
      { curvaGrade: 1, duration: CURVA.duracao, ease: "power2.in" },
      CURVA.inicio,
    )
    .fromTo(
      estadoCena,
      { saidaHero: 0 },
      { saidaHero: 1, duration: LASCAS.duracao },
      LASCAS.inicio,
    );

  gsap.fromTo(
    estadoCena,
    { apagarGrade: 0 },
    {
      apagarGrade: 1,
      ease: "none",
      scrollTrigger: { trigger: galeria, start: "top top", end: "+=60", scrub: true },
    },
  );
  reordenarGatilhos();
}

// ============================================================
// 3. TRANSIÇÃO SOLTA (MOVIMENTO REDUZIDO)
// Sem prender a rolagem: textos somem sem subir e a cena
// acompanha a saída do hero.
// ============================================================
function montarTransicaoSolta() {
  const linhaDoTempo = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: "#inicio",
      start: "top top",
      end: "bottom top",
      scrub: SUAVIZACAO_ROLAGEM,
    },
  });
  adicionarSaidaDosTextos(linhaDoTempo, 0, RECUO_SOLTO);
  linhaDoTempo
    .fromTo(
      estadoCena,
      { apagarGrade: 0 },
      { apagarGrade: 1, duration: GRADE_SOLTA.duracao },
      GRADE_SOLTA.inicio,
    )
    .fromTo(
      estadoCena,
      { saidaHero: 0 },
      { saidaHero: 1, duration: DISSOLUCAO_SOLTA.duracao },
      DISSOLUCAO_SOLTA.inicio,
    );
}

// ============================================================
// 4. GANCHO
// ============================================================
export function useRolagemTransicao() {
  useGSAP(() => {
    const midia = gsap.matchMedia();
    midia.add(COM_MOVIMENTO, montarTransicaoPresa);
    midia.add(MOVIMENTO_REDUZIDO, montarTransicaoSolta);
  });
}
