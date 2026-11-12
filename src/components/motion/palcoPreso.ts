import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// 1. PALCO PRESO NA SEÇÃO
// O elemento fica parado do topo ao fim da seção, sem empurrar o
// conteúdo (a altura da seção já é o percurso da rolagem).
// ============================================================
export function prenderNaSecao(secao: HTMLElement, elemento: HTMLElement) {
  return ScrollTrigger.create({
    trigger: secao,
    start: "top top",
    end: "bottom bottom",
    pin: elemento,
    pinSpacing: false,
  });
}

// ============================================================
// 2. ORDEM DOS GATILHOS
// Cada seção monta os gatilhos em momentos diferentes; reordenar
// pela posição na página e remedir evita pin calculado errado.
// ============================================================
export function reordenarGatilhos() {
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}
