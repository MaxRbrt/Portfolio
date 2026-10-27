import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const DURACAO_ENTRADA = 0.7;
const INTERVALO_LINHAS = 0.08;
const GIRO_MAXIMO_PAINEL = 18;
const RECUO_MAXIMO_PAINEL = 220;
const TELA_COM_GALERIA_CURVA = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const SEM_MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: no-preference)";

// ============================================================
// 1. ENTRADA DO HERO
// ============================================================
function animarEntradaHero() {
  gsap.from(".hero-nome .linha, .hero-apoio", {
    yPercent: 40,
    opacity: 0,
    duration: DURACAO_ENTRADA,
    ease: "expo.out",
    stagger: INTERVALO_LINHAS,
    delay: 0.3,
  });
}

// ============================================================
// 2. TÍTULOS REVELADOS LINHA A LINHA
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

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}

// ============================================================
// 3. GALERIA CURVA
// A seção fica presa enquanto os painéis passam na horizontal.
// Cada painel gira e recua conforme se afasta do centro da
// tela, formando um arco. Foco pelo teclado leva a rolagem
// até o painel focado.
// ============================================================
function curvarPaineis(paineis: HTMLElement[]) {
  const centroTela = window.innerWidth / 2;
  paineis.forEach((painel) => {
    const caixa = painel.getBoundingClientRect();
    const distancia = (caixa.left + caixa.width / 2 - centroTela) / centroTela;
    const limitada = gsap.utils.clamp(-1.4, 1.4, distancia);
    gsap.set(painel, {
      rotateY: -limitada * GIRO_MAXIMO_PAINEL,
      z: -Math.abs(limitada) * RECUO_MAXIMO_PAINEL,
    });
  });
}

function montarGaleriaCurva() {
  const galeria = document.querySelector<HTMLElement>("[data-galeria]");
  const trilho = document.querySelector<HTMLElement>("[data-trilho]");
  if (!galeria || !trilho) {
    return undefined;
  }
  const paineis = gsap.utils.toArray<HTMLElement>(".painel", trilho);
  const distanciaHorizontal = () => trilho.scrollWidth - window.innerWidth;
  galeria.dataset.curva = "ativa";

  const animacao = gsap.to(trilho, {
    x: () => -distanciaHorizontal(),
    ease: "none",
    scrollTrigger: {
      trigger: galeria,
      start: "center center",
      end: () => `+=${distanciaHorizontal()}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: () => curvarPaineis(paineis),
      onRefresh: () => curvarPaineis(paineis),
    },
  });

  const levarAoFoco = (evento: FocusEvent) => {
    const painel = (evento.target as HTMLElement).closest<HTMLElement>(".painel");
    const gatilho = animacao.scrollTrigger;
    if (!painel || !gatilho) {
      return;
    }
    const posicao = paineis.indexOf(painel) / Math.max(1, paineis.length - 1);
    window.scrollTo({ top: gatilho.start + posicao * (gatilho.end - gatilho.start) });
  };
  trilho.addEventListener("focusin", levarAoFoco);

  return () => {
    trilho.removeEventListener("focusin", levarAoFoco);
    delete galeria.dataset.curva;
    gsap.set(paineis, { clearProps: "transform" });
  };
}

// ============================================================
// 4. GANCHO
// ============================================================
export function useMovimentoEditorial() {
  useGSAP(() => {
    const midia = gsap.matchMedia();
    midia.add(SEM_MOVIMENTO_REDUZIDO, (contexto) => {
      animarEntradaHero();
      document.fonts.ready.then(() => contexto.add(revelarTitulos));
    });
    midia.add(TELA_COM_GALERIA_CURVA, montarGaleriaCurva);
  });
}
