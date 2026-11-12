import { animate, type JSAnimation } from "animejs/animation";
import { stagger } from "animejs/utils";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type EntradaDoTexto = { duracao: number; intervalo: number; subida: number };

export type TextoAnimado = {
  linhas: HTMLElement[];
  animacao: JSAnimation | null;
  entrada: EntradaDoTexto;
};

const ENTRADA_PADRAO: EntradaDoTexto = { duracao: 900, intervalo: 80, subida: 16 };
const SAIDA_DO_TEXTO = 240;

// ============================================================
// 1. TEXTO QUE ENTRA LINHA A LINHA
// As linhas começam invisíveis, sobem uma a uma (anime.js) ao
// entrar e somem de uma vez ao sair. Usado pela ficha da
// galeria, pelo texto da Indústria, da cidade e do beco.
// ============================================================
export function prepararTextoAnimado(
  linhas: HTMLElement[],
  entrada: EntradaDoTexto = ENTRADA_PADRAO,
): TextoAnimado {
  linhas.forEach((linha) => {
    linha.style.opacity = "0";
  });
  return { linhas, animacao: null, entrada };
}

export function mostrarTextoAnimado(texto: TextoAnimado) {
  texto.animacao?.pause();
  texto.animacao = animate(texto.linhas, {
    opacity: [0, 1],
    translateY: [texto.entrada.subida, 0],
    duration: texto.entrada.duracao,
    delay: stagger(texto.entrada.intervalo),
    ease: "outExpo",
  });
}

export function esconderTextoAnimado(texto: TextoAnimado) {
  texto.animacao?.pause();
  texto.animacao = animate(texto.linhas, {
    opacity: 0,
    duration: SAIDA_DO_TEXTO,
    ease: "outQuad",
  });
}

export function alternarTextoAnimado(texto: TextoAnimado, visivel: boolean) {
  if (visivel) {
    mostrarTextoAnimado(texto);
    return;
  }
  esconderTextoAnimado(texto);
}

export function ligarTextoAoGatilho(texto: TextoAnimado, gatilho: ScrollTrigger.Vars) {
  ScrollTrigger.create({
    ...gatilho,
    onToggle: (atual) => alternarTextoAnimado(texto, atual.isActive),
  });
}

export function desfazerTextoAnimado(texto: TextoAnimado) {
  texto.animacao?.revert();
  texto.animacao = null;
  texto.linhas.forEach((linha) => {
    linha.style.removeProperty("opacity");
    linha.style.removeProperty("transform");
  });
}
