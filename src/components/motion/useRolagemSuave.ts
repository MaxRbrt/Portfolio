import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

const ATRASO_DA_ROLAGEM = 0.9;
const MOUSE_SEM_MOVIMENTO_REDUZIDO = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

// ============================================================
// 1. ROLAGEM COM INÉRCIA
// Com mouse, a página alcança a rolagem com um pequeno atraso e
// desliza até parar. Toque e movimento reduzido ficam com a
// rolagem nativa. Precisa rodar antes dos outros ScrollTriggers.
// Links "#secao" ficam com useNavegacaoComCortina.
// ============================================================
export function useRolagemSuave() {
  useGSAP(() => {
    const midia = gsap.matchMedia();
    midia.add(MOUSE_SEM_MOVIMENTO_REDUZIDO, () => {
      const suavizador = ScrollSmoother.create({
        wrapper: "#rolagem-moldura",
        content: "#rolagem-conteudo",
        smooth: ATRASO_DA_ROLAGEM,
        effects: false,
      });
      return () => suavizador.kill();
    });
  });
}
