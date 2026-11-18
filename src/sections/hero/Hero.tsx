import { gsap } from "gsap";
import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const CenaHero = lazy(() => import("../../components/three/CenaHero"));
const midiaCenaHero =
  "(min-width: 64rem) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const imagemBustoHero = `${import.meta.env.BASE_URL}images/busto-marmore.webp`;

// ============================================================
// 1. IMAGEM ESTÁTICA E CARREGAMENTO DA CENA
// ============================================================
class LimiteCenaHero extends Component<{ children: ReactNode }, { falhou: boolean }> {
  state = { falhou: false };

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  render() {
    return this.state.falhou ? null : this.props.children;
  }
}

function useCenaHeroDisponivel(): boolean {
  const [disponivel, definirDisponivel] = useState(false);

  useEffect(() => {
    const midia = window.matchMedia(midiaCenaHero);
    let suporteWebGL: boolean | undefined;
    let quadro = 0;
    let ocioso = 0;

    function ativarCena() {
      if (!midia.matches) return;

      suporteWebGL ??= Boolean(document.createElement("canvas").getContext("webgl2"));
      definirDisponivel(suporteWebGL);
    }

    function acompanharMidia() {
      window.cancelAnimationFrame(quadro);
      window.cancelIdleCallback?.(ocioso);

      if (!midia.matches) {
        definirDisponivel(false);
        return;
      }

      quadro = window.requestAnimationFrame(() => {
        if (window.requestIdleCallback) {
          ocioso = window.requestIdleCallback(ativarCena, { timeout: 600 });
          return;
        }

        quadro = window.requestAnimationFrame(ativarCena);
      });
    }

    acompanharMidia();
    midia.addEventListener("change", acompanharMidia);

    return () => {
      midia.removeEventListener("change", acompanharMidia);
      window.cancelAnimationFrame(quadro);
      window.cancelIdleCallback?.(ocioso);
    };
  }, []);

  return disponivel;
}

// ============================================================
// 2. CONTEÚDO E ENTRADA DO HERO
// ============================================================
export function Hero() {
  const secao = useRef<HTMLElement>(null);
  const cenaDisponivel = useCenaHeroDisponivel();

  useEffect(() => {
    const ancora = window.location.hash;
    if (ancora && ancora !== "#inicio") return;

    const preferencias = gsap.matchMedia();
    preferencias.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap
          .timeline({ defaults: { ease: "expo.out", clearProps: "transform,opacity" } })
          .from(".hero-linha-titulo", { y: 14, opacity: 0.75, duration: 0.65, stagger: 0.1 }, 0.15)
          .from(".hero-apresentacao", { y: 10, opacity: 0.72, duration: 0.55 }, 0.35)
          .from(".hero-acoes", { y: 8, opacity: 0.75, duration: 0.55 }, 0.5)
          .from(
            ".hero-arte-palco",
            { scale: 0.96, opacity: 0.55, duration: 0.9, ease: "power2.out" },
            0.6,
          );
      },
      secao.current ?? undefined,
    );

    return () => preferencias.revert();
  }, []);

  return (
    <section id="inicio" ref={secao} tabIndex={-1} aria-labelledby="titulo-inicio" className="hero">
      <div className="hero-composicao">
        <h1 id="titulo-inicio" lang="en" className="titulo-monumental hero-titulo">
          <span className="hero-linha-titulo">FULL STACK</span>{" "}
          <span className="hero-linha-titulo">DEVELOPER.</span>
        </h1>

        <div className="hero-arte" aria-hidden="true">
          <div className="hero-arte-palco">
            <img className="hero-busto" src={imagemBustoHero} alt="" width="760" height="760" />
            {cenaDisponivel && (
              <LimiteCenaHero>
                <Suspense fallback={null}>
                  <CenaHero secao={secao} />
                </Suspense>
              </LimiteCenaHero>
            )}
          </div>
        </div>

        <div className="hero-rodape">
          <div className="hero-apresentacao">
            <p className="hero-nome">Marcos Roberto dos Santos Junior</p>
            <p>Desenvolvendo experiências digitais, sistemas e automações.</p>
          </div>

          <div className="hero-acoes">
            <a className="hero-link-projetos" href="#projetos">
              Ver projetos <span aria-hidden="true">↗</span>
            </a>
            <a className="hero-link-sobre" href="#sobre">
              Sobre mim <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
