import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { estadoCena } from "../three/estadoCena";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SUAVIZACAO_ROLAGEM = 0.6;

// ============================================================
// 1. ROSTO PRESO À ROLAGEM
// Descendo do topo, o rosto se desfaz e o texto do hero sai.
// Chegando no contato, o rosto volta a se formar. Tudo com
// scrub, então rolar de volta desfaz o caminho.
// ============================================================
export function useRolagemRosto() {
  useGSAP(() => {
    const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const subidaDoTexto = movimentoReduzido ? 0 : -60;

    gsap.fromTo(
      estadoCena,
      { saidaHero: 0 },
      {
        saidaHero: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#inicio",
          start: "top top",
          end: "bottom top",
          scrub: SUAVIZACAO_ROLAGEM,
        },
      },
    );

    gsap.fromTo(
      ".hero-texto, .hero-local, .hero-dica",
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: subidaDoTexto,
        ease: "none",
        scrollTrigger: {
          trigger: "#inicio",
          start: "top top",
          end: "60% top",
          scrub: SUAVIZACAO_ROLAGEM,
        },
      },
    );

    gsap.fromTo(
      estadoCena,
      { voltaContato: 0 },
      {
        voltaContato: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#contato",
          start: "top bottom",
          end: "top 15%",
          scrub: SUAVIZACAO_ROLAGEM,
        },
      },
    );
  });
}
