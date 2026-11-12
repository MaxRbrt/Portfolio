import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOVIMENTO_REDUZIDO } from "../../hooks/useMidia";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

const DURACAO_FECHAR_CORTINA = 0.35;
const DURACAO_ABRIR_CORTINA = 0.6;
const PAUSA_NO_ESCURO = 0.12;

// ============================================================
// 1. PULO ATÉ A SEÇÃO
// Seção dentro de bloco preso mira o começo do bloco, não a
// posição atual dela. Com ScrollSmoother o conteúdo anda por
// transform, então o pulo passa por ele; sem ele, rolagem
// nativa instantânea. O foco do teclado vai junto.
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

function pularParaSecao(destino: Element, hash: string) {
  const destinoForaDaPresa = destino.closest(".pin-spacer") ?? destino;
  const suavizador = ScrollSmoother.get();
  if (suavizador) {
    suavizador.scrollTo(destinoForaDaPresa, false, "top top");
  } else {
    const topo = destinoForaDaPresa.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: topo, behavior: "instant" });
  }
  ScrollTrigger.update();
  levarFocoParaSecao(destino);
  history.replaceState(null, "", hash);
}

// ============================================================
// 2. CORTINA
// A tela escurece, a página pula por baixo e a cortina abre
// revelando a seção. Um clique durante a troca é ignorado.
// ============================================================
function passarPelaCortina(cortina: HTMLElement, aoEscurecer: () => void) {
  return gsap
    .timeline()
    .to(cortina, { opacity: 1, duration: DURACAO_FECHAR_CORTINA, ease: "power2.in" })
    .call(aoEscurecer)
    .to(cortina, {
      opacity: 0,
      duration: DURACAO_ABRIR_CORTINA,
      ease: "power2.out",
      delay: PAUSA_NO_ESCURO,
    });
}

function criarNavegacaoComCortina(cortina: HTMLElement) {
  let trocaEmAndamento: gsap.core.Timeline | null = null;

  return (evento: MouseEvent) => {
    const alvo = evento.target instanceof Element ? evento.target : null;
    const link = alvo?.closest<HTMLAnchorElement>('a[href^="#"]');
    const destino = link?.hash ? document.querySelector(link.hash) : null;
    if (evento.defaultPrevented || !link || !destino) {
      return;
    }
    evento.preventDefault();
    if (trocaEmAndamento?.isActive()) {
      return;
    }
    const pular = () => pularParaSecao(destino, link.hash);
    if (window.matchMedia(MOVIMENTO_REDUZIDO).matches) {
      pular();
      return;
    }
    trocaEmAndamento = passarPelaCortina(cortina, pular);
  };
}

// ============================================================
// 3. GANCHO
// Vale para qualquer link "#secao" da página, com mouse ou
// toque. Movimento reduzido: pulo direto, sem cortina.
// ============================================================
export function useNavegacaoComCortina() {
  useGSAP(() => {
    const cortina = document.querySelector<HTMLElement>("[data-cortina]");
    if (!cortina) {
      return undefined;
    }
    const navegar = criarNavegacaoComCortina(cortina);
    document.addEventListener("click", navegar);
    return () => document.removeEventListener("click", navegar);
  });
}
