import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COM_MOVIMENTO } from "../../hooks/useMidia";
import { prenderNaSecao, reordenarGatilhos } from "./palcoPreso";
import {
  desfazerTextoAnimado,
  ligarTextoAoGatilho,
  mostrarTextoAnimado,
  prepararTextoAnimado,
} from "./textoAnimado";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FIM_DO_TEXTO_NO_CANION = 0.26;

// ============================================================
// 1. TEXTO DA SEÇÃO
// Foco do teclado dentro da seção também mostra o texto, para o
// link nunca ficar focado e invisível.
// ============================================================
function prepararTextoDaSecao(secao: HTMLElement, seletor: string) {
  const linhas = Array.from(secao.querySelectorAll<HTMLElement>(seletor));
  const texto = prepararTextoAnimado(linhas);
  const aoFocar = () => mostrarTextoAnimado(texto);
  secao.addEventListener("focusin", aoFocar);
  const desfazer = () => {
    secao.removeEventListener("focusin", aoFocar);
    desfazerTextoAnimado(texto);
  };
  return { texto, desfazer };
}

// ============================================================
// 2. PALCOS PRESOS
// Cidade: o texto fica só enquanto o cânion está na tela, antes
// da luz branca. Beco: o texto entra quando o vermelho vira beco.
// ============================================================
function prenderPalcoDaSecao(secao: HTMLElement, seletorDoPalco: string) {
  const palco = secao.querySelector<HTMLElement>(seletorDoPalco);
  if (!palco) {
    return;
  }
  prenderNaSecao(secao, palco);
}

function medirFimDoTextoNoCanion(secao: HTMLElement) {
  const percursoPreso = Math.max(1, secao.offsetHeight - window.innerHeight);
  return `top+=${Math.round(percursoPreso * FIM_DO_TEXTO_NO_CANION)} top`;
}

function montarCidadePresa(secao: HTMLElement) {
  prenderPalcoDaSecao(secao, "[data-palco-cidade]");
  const textoDaCidade = prepararTextoDaSecao(secao, "[data-linha-cidade]");
  ligarTextoAoGatilho(textoDaCidade.texto, {
    trigger: secao,
    start: "top 8%",
    end: () => medirFimDoTextoNoCanion(secao),
  });
  return textoDaCidade.desfazer;
}

function montarBecoPreso(secao: HTMLElement) {
  prenderPalcoDaSecao(secao, "[data-palco-beco]");
  const textoDoBeco = prepararTextoDaSecao(secao, "[data-linha-beco]");
  ligarTextoAoGatilho(textoDoBeco.texto, { trigger: secao, start: "top 40%", end: "bottom top" });
  return textoDoBeco.desfazer;
}

function montarCidadeEBecoPresos() {
  const cidade = document.querySelector<HTMLElement>("#trajetoria");
  const beco = document.querySelector<HTMLElement>("#contato");
  if (!cidade || !beco) {
    return undefined;
  }
  const desfazeres = [montarCidadePresa(cidade), montarBecoPreso(beco)];
  reordenarGatilhos();
  return () => desfazeres.forEach((desfazer) => desfazer());
}

// ============================================================
// 3. GANCHO
// Movimento reduzido: fotos paradas e texto sempre visível.
// ============================================================
export function useRolagemCidade() {
  useGSAP(() => {
    gsap.matchMedia().add(COM_MOVIMENTO, montarCidadeEBecoPresos);
  });
}
