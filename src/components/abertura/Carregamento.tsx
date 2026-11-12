import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { textosInterface } from "../../data/interface";
import { useMovimentoReduzido } from "../../hooks/useMidia";
import { liberarAbertura } from "./estadoAbertura";
import { useEstadoAbertura } from "./useEstadoAbertura";

gsap.registerPlugin(useGSAP);

const ESPERA_MINIMA_MS = 1200;
const ESPERA_MAXIMA_MS = 4000;
const CARGA_SEM_TAMANHO = 0.15;
const TETO_ANTES_DE_RESOLVER = 0.92;
const DURACAO_ENCHIMENTO = 0.9;
const DURACAO_ENCHIMENTO_FINAL = 0.35;
const DURACAO_SAIDA_FUNDO = 0.5;
const ATRASO_SAIDA_BARRA = 0.35;
const DURACAO_SAIDA_BARRA = 0.4;

type CargaMostrada = { valor: number };

// ============================================================
// 1. ESPERA
// Vira verdadeiro depois do tempo pedido, uma vez só.
// ============================================================
function useEsperaPassada(milissegundos: number): boolean {
  const [passou, setPassou] = useState(false);

  useEffect(() => {
    const espera = window.setTimeout(() => setPassou(true), milissegundos);
    return () => window.clearTimeout(espera);
  }, [milissegundos]);

  return passou;
}

// ============================================================
// 2. CARGA DA BARRA
// A barra persegue o download real do rosto, mas só chega a
// 100% na hora de sair. Sem tamanho conhecido fica num trecho
// curto, pulsando.
// ============================================================
function calcularCargaAlvo(progresso: number | null, deveSair: boolean): number {
  if (deveSair) {
    return 1;
  }
  if (progresso === null) {
    return CARGA_SEM_TAMANHO;
  }
  return Math.min(progresso, TETO_ANTES_DE_RESOLVER);
}

function mostrarCarga(tela: HTMLElement, carga: number) {
  tela.style.setProperty("--carga", carga.toFixed(4));
}

function encherBarra(tela: HTMLElement, cargaMostrada: CargaMostrada, alvo: number) {
  const ultimoTrecho = alvo === 1;
  return gsap.timeline().to(cargaMostrada, {
    valor: alvo,
    duration: ultimoTrecho ? DURACAO_ENCHIMENTO_FINAL : DURACAO_ENCHIMENTO,
    ease: "power1.out",
    overwrite: true,
    onUpdate: () => mostrarCarga(tela, cargaMostrada.valor),
  });
}

// ============================================================
// 3. SAÍDA
// Com a barra cheia a sequência de entrada é liberada: o fundo
// preto some primeiro, revelando a cena, e a barra some depois.
// ============================================================
function animarSaida(linhaDoTempo: gsap.core.Timeline, aoTerminar: () => void) {
  linhaDoTempo
    .call(liberarAbertura)
    .to(".carregamento-fundo", { opacity: 0, duration: DURACAO_SAIDA_FUNDO, ease: "power2.inOut" })
    .to(
      ".carregamento-conteudo",
      { opacity: 0, duration: DURACAO_SAIDA_BARRA, ease: "power1.in" },
      `<${ATRASO_SAIDA_BARRA}`,
    )
    .call(aoTerminar);
}

// ============================================================
// 4. TELA DE CARREGAMENTO
// Preto, "CARREGANDO" e barra de vida com o download real do
// rosto. Sai quando o rosto resolve (com no mínimo 1,2 s de
// tela) ou depois de 4 s, o que vier antes. Movimento reduzido:
// sem espera mínima e sem animação.
// ============================================================
export default function Carregamento() {
  const telaRef = useRef<HTMLDivElement>(null);
  const cargaMostrada = useRef<CargaMostrada>({ valor: 0 });
  const [montada, setMontada] = useState(true);
  const { progresso, rostoResolvido } = useEstadoAbertura();
  const movimentoReduzido = useMovimentoReduzido();
  const esperaMinimaPassada = useEsperaPassada(ESPERA_MINIMA_MS);
  const tempoEsgotado = useEsperaPassada(ESPERA_MAXIMA_MS);
  const rostoNaHora = rostoResolvido && (esperaMinimaPassada || movimentoReduzido);
  const deveSair = rostoNaHora || tempoEsgotado;
  const cargaAlvo = calcularCargaAlvo(progresso, deveSair);

  useGSAP(
    () => {
      const tela = telaRef.current;
      if (!tela) {
        return;
      }
      const desmontar = () => setMontada(false);
      if (movimentoReduzido) {
        mostrarCarga(tela, cargaAlvo);
      }
      if (movimentoReduzido && deveSair) {
        liberarAbertura();
        desmontar();
      }
      if (movimentoReduzido) {
        return;
      }
      const linhaDoTempo = encherBarra(tela, cargaMostrada.current, cargaAlvo);
      if (deveSair) {
        animarSaida(linhaDoTempo, desmontar);
      }
    },
    { dependencies: [cargaAlvo, deveSair, movimentoReduzido], scope: telaRef },
  );

  if (!montada) {
    return null;
  }

  return (
    <div ref={telaRef} className="carregamento" aria-hidden="true">
      <span className="carregamento-fundo" />
      <div className="carregamento-conteudo">
        <span className="carregamento-texto">{textosInterface.carregando}</span>
        <span className="carregamento-moldura">
          <span
            className="carregamento-enchimento"
            data-sem-tamanho={progresso === null || undefined}
          />
        </span>
      </div>
    </div>
  );
}
