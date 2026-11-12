import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COM_MOVIMENTO } from "../../hooks/useMidia";
import { prenderNaSecao, reordenarGatilhos } from "./palcoPreso";
import { desfazerTextoAnimado, ligarTextoAoGatilho, prepararTextoAnimado } from "./textoAnimado";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SOBREPOSTOS_DA_GALERIA = "#projetos .projetos-lateral-miolo";

// ============================================================
// 1. INDÚSTRIA PRESA
// O palco fica parado enquanto a seção passa; a lista da galeria
// some enquanto a última imagem cresce (a ficha sai pelo
// carrossel). O texto entra linha a linha quando a fábrica toma a
// tela e some antes da luz abrir para a cidade.
// ============================================================
function montarIndustriaPresa() {
  const secao = document.querySelector<HTMLElement>("#sobre");
  const palco = secao?.querySelector<HTMLElement>("[data-palco-industria]");
  if (!secao || !palco) {
    return undefined;
  }
  prenderNaSecao(secao, palco);
  gsap.to(SOBREPOSTOS_DA_GALERIA, {
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: secao, start: "top bottom", end: "top 65%", scrub: true },
  });

  const linhas = Array.from(secao.querySelectorAll<HTMLElement>("[data-linha-sobre]"));
  const texto = prepararTextoAnimado(linhas);
  ligarTextoAoGatilho(texto, { trigger: secao, start: "top 8%", end: "bottom bottom" });
  reordenarGatilhos();

  return () => desfazerTextoAnimado(texto);
}

// ============================================================
// 2. GANCHO
// Movimento reduzido: foto parada e texto sempre visível.
// ============================================================
export function useRolagemIndustria() {
  useGSAP(() => {
    gsap.matchMedia().add(COM_MOVIMENTO, montarIndustriaPresa);
  });
}
