import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { atualizarProgressoCinematica } from "../../animation/progressoCinematica";
import { Hero } from "./Hero";

gsap.registerPlugin(ScrollTrigger, SplitText);

const midiaCinematicaCompleta = "(min-width: 64rem) and (prefers-reduced-motion: no-preference)";
const midiaCinematicaLeve = "(max-width: 63.99rem) and (prefers-reduced-motion: no-preference)";

const seletorTitulo = ".hero-titulo";
const seletorLinhasFrase = ".cinematica-frase .cinematica-linha";

// ============================================================
// 1. LETRAS DO TÍTULO E DA FRASE
// No título (heading), SplitText guarda o texto em aria-label e
// esconde as letras soltas. A frase é um <p>, onde aria-label é
// proibido: o leitor de tela lê a cópia em .texto-leitor e as
// linhas visíveis já ficam com aria-hidden no JSX.
// ============================================================
function separarLetras(palco: HTMLElement, seletor: string, aria: "auto" | "none") {
  const alvos = Array.from(palco.querySelectorAll<HTMLElement>(seletor));
  if (alvos.length === 0) {
    throw new Error(`Elemento "${seletor}" não encontrado no palco da cinemática`);
  }

  return SplitText.create(alvos, { type: "words,chars", charsClass: "letra", aria });
}

// ============================================================
// 2. ORIGEM DA CORTINA
// O círculo nasce do ponto final de "PURPOSE.", já com a frase
// na escala do fim do ato 3 (origem à esquerda).
// ============================================================
const escalaFinalFrase = 1.1;

function medirPosicaoNoPalco(palco: HTMLElement, elemento: HTMLElement) {
  let esquerda = 0;
  let topo = 0;
  let atual: HTMLElement | null = elemento;

  while (atual && atual !== palco) {
    esquerda += atual.offsetLeft;
    topo += atual.offsetTop;
    atual = atual.offsetParent instanceof HTMLElement ? atual.offsetParent : null;
  }

  return { esquerda, topo };
}

function calcularOrigemCortina(palco: HTMLElement, frase: HTMLElement, ponto: HTMLElement) {
  const posicaoFrase = medirPosicaoNoPalco(palco, frase);
  const posicaoPonto = medirPosicaoNoPalco(palco, ponto);
  const centroPontoX = posicaoPonto.esquerda + ponto.offsetWidth / 2;
  const centroPontoY = posicaoPonto.topo + ponto.offsetHeight * 0.72;
  const deslocamentoNaFrase = (centroPontoX - posicaoFrase.esquerda) * escalaFinalFrase;
  const alturaFrase = frase.offsetHeight;
  const deslocamentoVertical =
    (centroPontoY - posicaoFrase.topo - alturaFrase / 2) * escalaFinalFrase;
  const origemX = posicaoFrase.esquerda + deslocamentoNaFrase;
  const origemY = posicaoFrase.topo + alturaFrase / 2 + deslocamentoVertical;

  return `${Math.round(origemX)}px ${Math.round(origemY)}px`;
}

// ============================================================
// 3. LINHA DO TEMPO PRESA À ROLAGEM (DESKTOP)
// Ato 1 (0–30%): letras do título voam, busto aproxima.
// Ato 2 (30–65%): busto vai de perfil para a direita, a frase
// entra letra por letra.
// Ato 3 (65–100%): frase cresce, busto recua e um círculo
// claro cobre o palco, emendando no Sobre.
// ============================================================
function montarCinematicaCompleta(palco: HTMLElement) {
  palco.dataset.cinematica = "ativa";
  const letrasTitulo = separarLetras(palco, seletorTitulo, "auto");
  const letrasFrase = separarLetras(palco, seletorLinhasFrase, "none");
  const frase = palco.querySelector<HTMLElement>(".cinematica-frase");
  const pontoFinal = letrasFrase.chars.at(-1);
  const origemCortina = () =>
    frase && pontoFinal instanceof HTMLElement
      ? calcularOrigemCortina(palco, frase, pontoFinal)
      : "50% 55%";

  const linhaDoTempo = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: palco,
      start: "top top",
      end: "+=300%",
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      refreshPriority: 1,
      onUpdate: ({ progress }) => atualizarProgressoCinematica(progress),
    },
  });

  linhaDoTempo
    .to(".hero-rodape", { y: -32, opacity: 0, duration: 0.12 }, 0)
    .to(
      letrasTitulo.chars,
      {
        yPercent: () => gsap.utils.random(-320, -140),
        rotation: () => gsap.utils.random(-28, 28),
        opacity: 0,
        duration: 0.2,
        stagger: { each: 0.006, from: "random" },
      },
      0,
    )
    .to(".hero-arte", { y: "-4svh", scale: 1.2, duration: 0.3 }, 0)
    .to(".hero-arte", { x: "18vw", y: "-8svh", scale: 1.04, duration: 0.3 }, 0.3)
    .from(letrasFrase.chars, { yPercent: 115, duration: 0.18, stagger: 0.012 }, 0.36)
    .to(".cinematica-frase", { scale: escalaFinalFrase, duration: 0.15 }, 0.62)
    .to(".hero-arte", { y: "-18svh", scale: 0.86, opacity: 0.2, duration: 0.25 }, 0.65)
    .fromTo(
      ".cinematica-cortina",
      { clipPath: () => `circle(0px at ${origemCortina()})` },
      {
        clipPath: () => `circle(150% at ${origemCortina()})`,
        ease: "power2.in",
        duration: 0.23,
      },
      0.77,
    );

  return () => {
    letrasTitulo.revert();
    letrasFrase.revert();
    atualizarProgressoCinematica(0);
    delete palco.dataset.cinematica;
  };
}

// ============================================================
// 4. VERSÃO LEVE (CELULAR E TABLET)
// Sem pin: o título se desfaz e o busto recua enquanto o Hero
// sai da tela; depois as letras da frase sobem com a rolagem.
// ============================================================
function montarCinematicaLeve(palco: HTMLElement) {
  const letrasTitulo = separarLetras(palco, seletorTitulo, "auto");
  const letrasFrase = separarLetras(palco, seletorLinhasFrase, "none");
  const saidaDoHero = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 };

  gsap.to(letrasTitulo.chars, {
    yPercent: () => gsap.utils.random(-220, -80),
    rotation: () => gsap.utils.random(-24, 24),
    opacity: 0,
    ease: "none",
    stagger: { each: 0.02, from: "random" },
    scrollTrigger: { ...saidaDoHero, end: "45% top" },
  });

  gsap.to(".hero-arte", {
    yPercent: 18,
    scale: 0.88,
    opacity: 0.35,
    ease: "none",
    scrollTrigger: saidaDoHero,
  });

  gsap.from(letrasFrase.chars, {
    yPercent: 115,
    ease: "none",
    stagger: 0.03,
    scrollTrigger: {
      trigger: ".cinematica-frase",
      start: "top 90%",
      end: "top 45%",
      scrub: 0.6,
    },
  });

  return () => {
    letrasTitulo.revert();
    letrasFrase.revert();
  };
}

// ============================================================
// 5. COMPONENTE
// Sem movimento reduzido, a frase fica estática abaixo do Hero.
// ============================================================
export function Cinematica() {
  const palco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elementoPalco = palco.current;
    if (!elementoPalco) return;

    let ativo = true;
    let preferencias: gsap.MatchMedia | undefined;

    void document.fonts.ready.then(() => {
      if (!ativo) return;

      preferencias = gsap.matchMedia(elementoPalco);
      preferencias.add(midiaCinematicaCompleta, () => montarCinematicaCompleta(elementoPalco));
      preferencias.add(midiaCinematicaLeve, () => montarCinematicaLeve(elementoPalco));
      ScrollTrigger.refresh();
    });

    return () => {
      ativo = false;
      preferencias?.revert();
    };
  }, []);

  return (
    <div ref={palco} className="cinematica">
      <Hero />
      <div className="cinematica-frase-palco">
        <p lang="en" className="cinematica-frase">
          <span className="texto-leitor">CODE WITH PURPOSE.</span>
          <span className="cinematica-mascara" aria-hidden="true">
            <span className="cinematica-linha">CODE WITH</span>
          </span>{" "}
          <span className="cinematica-mascara" aria-hidden="true">
            <span className="cinematica-linha">PURPOSE.</span>
          </span>
        </p>
      </div>
      <div className="cinematica-cortina" aria-hidden="true" />
    </div>
  );
}
