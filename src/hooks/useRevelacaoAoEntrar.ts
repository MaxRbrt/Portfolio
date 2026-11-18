import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger, SplitText);

const midiaComMovimento = "(prefers-reduced-motion: no-preference)";
const inicioRevelacao = "top 85%";

// ============================================================
// 1. TÍTULO LETRA POR LETRA (ANIM-TITULO-01)
// Cada linha de título vira letras que sobem de dentro da
// máscara. O SplitText é desfeito no fim para o leitor de
// tela voltar a ler a linha inteira.
// ============================================================
function revelarLinhaPorLetras(linha: HTMLElement) {
  const letras = SplitText.create(linha, { type: "words,chars", aria: "none" });

  gsap.from(letras.chars, {
    yPercent: 115,
    rotation: 6,
    duration: 0.9,
    ease: "power4.out",
    stagger: 0.02,
    scrollTrigger: { trigger: linha, start: inicioRevelacao, once: true },
    onComplete: () => letras.revert(),
  });

  return letras;
}

// ============================================================
// 2. TROCA DE TOM ENTRE SEÇÕES (ANIM-TRANSICAO-01)
// A seção com data-transicao mostra a cor da anterior; o fundo
// próprio (.secao-fundo) entra como cartão arredondado e abre
// até a borda acompanhando a rolagem.
// ============================================================
function abrirFundoDaSecao(secao: HTMLElement) {
  const fundo = secao.querySelector<HTMLElement>(":scope > .secao-fundo");
  if (!fundo) return;

  gsap.fromTo(
    fundo,
    { clipPath: "inset(6% 3% 0% 3% round 2rem)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 0rem)",
      ease: "none",
      scrollTrigger: { trigger: secao, start: "top 100%", end: "top 30%", scrub: 0.6 },
    },
  );
}

// ============================================================
// 3. REVELAÇÃO AO ENTRAR NA TELA (ANIM-ABOUT-01)
// Marca no HTML o que revela:
// - data-revelar="mascara": linha de título, letra por letra;
// - data-revelar="bloco": sobe 24 px e aparece;
// - data-revelar="imagem": máscara abre de baixo para cima.
// Cada alvo dispara ao entrar na tela, uma vez só. Com
// movimento reduzido nada é animado e o conteúdo já está
// visível no DOM.
// ============================================================
function revelarAlvosDaSecao(secao: HTMLElement) {
  const linhasMascaradas = gsap.utils.toArray<HTMLElement>('[data-revelar="mascara"]', secao);
  const blocos = gsap.utils.toArray<HTMLElement>('[data-revelar="bloco"]', secao);
  const imagens = gsap.utils.toArray<HTMLElement>('[data-revelar="imagem"]', secao);
  const letrasDasLinhas = linhasMascaradas.map(revelarLinhaPorLetras);

  if (secao.hasAttribute("data-transicao")) {
    abrirFundoDaSecao(secao);
  }

  imagens.forEach((imagem) => {
    gsap.fromTo(
      imagem,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.8,
        ease: "power3.out",
        clearProps: "clipPath",
        scrollTrigger: { trigger: imagem, start: inicioRevelacao, once: true },
      },
    );
  });

  blocos.forEach((bloco) => {
    gsap.from(bloco, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: { trigger: bloco, start: inicioRevelacao, once: true },
    });
  });

  return () => letrasDasLinhas.forEach((letras) => letras.revert());
}

export function useRevelacaoAoEntrar<Elemento extends HTMLElement>() {
  const secao = useRef<Elemento>(null);

  useEffect(() => {
    const elementoSecao = secao.current;
    if (!elementoSecao) return;

    const preferencias = gsap.matchMedia(elementoSecao);
    preferencias.add(midiaComMovimento, () => revelarAlvosDaSecao(elementoSecao));

    return () => {
      preferencias.revert();
    };
  }, []);

  return secao;
}
