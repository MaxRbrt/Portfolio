import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useMovimentoReduzido } from "../../hooks/useMidia";
import { estadoCena } from "../three/estadoCena";
import { concluirAbertura } from "./estadoAbertura";
import { useEstadoAbertura } from "./useEstadoAbertura";

gsap.registerPlugin(useGSAP);

const CHAVE_ABERTURA_VISTA = "abertura-vista";
const ACELERACAO_SEGUNDA_VISITA = 2.5;
const TEXTOS_DO_HERO = ".hero-nome .linha, .hero-cargo, .hero-apoio";
const ELEMENTOS_DA_ENTRADA = `${TEXTOS_DO_HERO}, .navegacao`;
const CENA_PRONTA = { grade: 1, surgimento: 1, montagem: 1, luz: 0, foto: 1 };

// ============================================================
// 1. VISITA ANTERIOR NA MESMA ABA
// Lido uma vez ao carregar o módulo; armazenamento bloqueado
// conta como primeira visita.
// ============================================================
function lerAberturaVista(): boolean {
  try {
    return window.sessionStorage.getItem(CHAVE_ABERTURA_VISTA) === "1";
  } catch {
    return false;
  }
}

function marcarAberturaVista() {
  try {
    window.sessionStorage.setItem(CHAVE_ABERTURA_VISTA, "1");
  } catch {
    return;
  }
}

const aberturaJaVista = typeof window !== "undefined" && lerAberturaVista();

// ============================================================
// 2. CENA DA ENTRADA
// A grade acende do meio para as bordas, o rosto se desenha em
// linhas (contorno antes do miolo), acende em branco e a luz
// baixa revelando a foto.
// ============================================================
function animarCena(linhaDoTempo: gsap.core.Timeline) {
  linhaDoTempo
    .fromTo(estadoCena, { grade: 0 }, { grade: 1, duration: 0.9, ease: "power2.out" }, 0)
    .fromTo(estadoCena, { surgimento: 0 }, { surgimento: 1, duration: 0.3 }, 0.1)
    .fromTo(estadoCena, { montagem: 0 }, { montagem: 1, duration: 1, ease: "none" }, 0.15)
    .fromTo(estadoCena, { luz: 0 }, { luz: 1, duration: 0.45, ease: "power2.in" }, 0.75)
    .to(estadoCena, { luz: 0, duration: 0.7, ease: "power2.out" }, 1.25)
    .fromTo(estadoCena, { foto: 0 }, { foto: 1, duration: 0.8, ease: "power1.out" }, 1.25);
}

// ============================================================
// 3. TEXTOS DA ENTRADA
// Entram enquanto o rosto acende. Cada etapa começa antes da
// anterior terminar.
// ============================================================
function animarTextos(linhaDoTempo: gsap.core.Timeline) {
  linhaDoTempo
    .fromTo(
      TEXTOS_DO_HERO,
      { yPercent: 40, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.08 },
      0.95,
    )
    .fromTo(".navegacao", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 1.1);
}

function criarLinhaDoTempoAbertura() {
  const linhaDoTempo = gsap.timeline({
    onComplete: () => {
      marcarAberturaVista();
      concluirAbertura();
    },
  });
  animarCena(linhaDoTempo);
  animarTextos(linhaDoTempo);
  if (aberturaJaVista) {
    linhaDoTempo.timeScale(ACELERACAO_SEGUNDA_VISITA);
  }
}

// ============================================================
// 4. GANCHO
// Antes da liberação o texto fica escondido atrás da tela de
// carregamento. Movimento reduzido: tudo pronto, sem animar.
// ============================================================
export function useSequenciaAbertura() {
  const { liberada } = useEstadoAbertura();
  const movimentoReduzido = useMovimentoReduzido();

  useGSAP(
    () => {
      if (movimentoReduzido) {
        gsap.set(estadoCena, CENA_PRONTA);
        gsap.set(ELEMENTOS_DA_ENTRADA, { opacity: 1, yPercent: 0 });
      }
      if (movimentoReduzido && liberada) {
        concluirAbertura();
      }
      if (movimentoReduzido) {
        return;
      }
      if (!liberada) {
        gsap.set(ELEMENTOS_DA_ENTRADA, { opacity: 0 });
        return;
      }
      criarLinhaDoTempoAbertura();
    },
    { dependencies: [liberada, movimentoReduzido] },
  );
}
