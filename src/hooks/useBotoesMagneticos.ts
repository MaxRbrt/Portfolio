import { gsap } from "gsap";
import { useEffect } from "react";

const midiaBotoesMagneticos =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const forcaDoIma = 0.3;

type BotaoAtraido = {
  readonly botao: HTMLElement;
  readonly centroX: number;
  readonly centroY: number;
  readonly moverX: gsap.QuickToFunc;
  readonly moverY: gsap.QuickToFunc;
};

// ============================================================
// 1. BOTÕES PÍLULA MAGNÉTICOS (ANIM-IMA-01)
// Com o ponteiro em cima, a pílula anda 30% da distância até
// ele; ao sair, volta ao lugar com um balanço curto. Escuta a
// página inteira, então vale também para botões que aparecem
// depois (Ver mais projetos).
// ============================================================
function prenderBotao(botao: HTMLElement): BotaoAtraido {
  gsap.killTweensOf(botao, "x,y");

  const caixa = botao.getBoundingClientRect();
  const deslocamentoX = Number(gsap.getProperty(botao, "x"));
  const deslocamentoY = Number(gsap.getProperty(botao, "y"));

  return {
    botao,
    centroX: caixa.left - deslocamentoX + caixa.width / 2,
    centroY: caixa.top - deslocamentoY + caixa.height / 2,
    moverX: gsap.quickTo(botao, "x", { duration: 0.4, ease: "power3.out" }),
    moverY: gsap.quickTo(botao, "y", { duration: 0.4, ease: "power3.out" }),
  };
}

function soltarBotao(botao: HTMLElement) {
  gsap.to(botao, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
}

function atrairBotoesPilula() {
  let atual: BotaoAtraido | null = null;

  function acompanharPonteiro(evento: PointerEvent) {
    const elementoSobPonteiro = evento.target instanceof Element ? evento.target : null;
    const botao = elementoSobPonteiro?.closest<HTMLElement>(".botao-pilula") ?? null;

    if (botao !== atual?.botao) {
      if (atual) soltarBotao(atual.botao);
      atual = botao ? prenderBotao(botao) : null;
    }

    if (!atual) return;

    atual.moverX((evento.clientX - atual.centroX) * forcaDoIma);
    atual.moverY((evento.clientY - atual.centroY) * forcaDoIma);
  }

  window.addEventListener("pointermove", acompanharPonteiro, { passive: true });

  return () => {
    window.removeEventListener("pointermove", acompanharPonteiro);
    if (atual) gsap.set(atual.botao, { x: 0, y: 0 });
  };
}

export function useBotoesMagneticos() {
  useEffect(() => {
    const preferencias = gsap.matchMedia();
    preferencias.add(midiaBotoesMagneticos, atrairBotoesPilula);

    return () => {
      preferencias.revert();
    };
  }, []);
}
