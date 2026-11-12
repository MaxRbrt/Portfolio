import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

const ATRASO_DA_ROLAGEM = 0.9;
const MOUSE_SEM_MOVIMENTO_REDUZIDO = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

// ============================================================
// 1. LINKS PARA SEÇÕES DA PÁGINA
// Com o conteúdo movido por transform, o navegador não acha a
// âncora sozinho: o clique em "#secao" vira rolagem suave até
// o topo da seção. Seção dentro de bloco preso mira o começo
// do bloco, não a posição atual dela. O foco do teclado vai
// junto, como faria o link nativo.
// ============================================================
function levarFocoParaSecao(destino: Element) {
  if (!(destino instanceof HTMLElement)) {
    return;
  }
  if (!destino.hasAttribute("tabindex")) {
    destino.setAttribute("tabindex", "-1");
  }
  destino.focus({ preventScroll: true });
}

function criarNavegacaoPorAncora(suavizador: ScrollSmoother) {
  return (evento: MouseEvent) => {
    const link = (evento.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const destino = link ? document.querySelector(link.hash) : null;
    if (!link || !destino) {
      return;
    }
    const destinoForaDaPresa = destino.closest(".pin-spacer") ?? destino;
    evento.preventDefault();
    suavizador.scrollTo(destinoForaDaPresa, true, "top top");
    levarFocoParaSecao(destino);
    history.replaceState(null, "", link.hash);
  };
}

// ============================================================
// 2. ROLAGEM COM INÉRCIA
// Com mouse, a página alcança a rolagem com um pequeno atraso e
// desliza até parar. Toque e movimento reduzido ficam com a
// rolagem nativa. Precisa rodar antes dos outros ScrollTriggers.
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
      const navegarPorAncora = criarNavegacaoPorAncora(suavizador);
      document.addEventListener("click", navegarPorAncora);

      return () => {
        document.removeEventListener("click", navegarPorAncora);
        suavizador.kill();
      };
    });
  });
}
