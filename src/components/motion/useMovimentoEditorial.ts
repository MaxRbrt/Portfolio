import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { COM_MOVIMENTO } from "../../hooks/useMidia";
import { reordenarGatilhos } from "./palcoPreso";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const DURACAO_ENTRADA = 0.7;
const INTERVALO_LINHAS = 0.08;

// ============================================================
// 1. TÍTULOS REVELADOS LINHA A LINHA
// Cada linha sobe de dentro de uma máscara. Rolar de volta
// esconde de novo.
// ============================================================
function revelarTitulos() {
  const titulos = gsap.utils.toArray<HTMLElement>("[data-revelar]");
  titulos.forEach((titulo) => {
    SplitText.create(titulo, {
      type: "lines",
      mask: "lines",
      aria: "none",
      autoSplit: true,
      onSplit: (partes) =>
        gsap.from(partes.lines, {
          yPercent: 110,
          duration: DURACAO_ENTRADA,
          ease: "expo.out",
          stagger: INTERVALO_LINHAS,
          scrollTrigger: {
            trigger: titulo,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }),
    });
  });

  gsap.utils.toArray<HTMLElement>("[data-surgir]").forEach((elemento) => {
    gsap.from(elemento, {
      y: 40,
      opacity: 0,
      duration: DURACAO_ENTRADA,
      ease: "expo.out",
      scrollTrigger: {
        trigger: elemento,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });
  });

  reordenarGatilhos();
}

// ============================================================
// 2. GANCHO
// ============================================================
export function useMovimentoEditorial() {
  useGSAP(() => {
    const midia = gsap.matchMedia();
    midia.add(COM_MOVIMENTO, (contexto) => {
      document.fonts.ready.then(() => contexto.add(revelarTitulos));
    });
  });
}
