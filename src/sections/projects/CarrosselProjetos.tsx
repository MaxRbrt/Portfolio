import { useRef, useState } from "react";
import type { ReactNode } from "react";

type PropsCarrosselProjetos = {
  readonly idLista: string;
  readonly classeLista: string;
  readonly rotulo: string;
  readonly inicio: number;
  readonly total: number;
  readonly children: ReactNode;
};

const midiaMovimentoReduzido = "(prefers-reduced-motion: reduce)";

// ============================================================
// 1. POSIÇÃO NO CARROSSEL
// Acha o cartão cujo início está mais perto da rolagem atual.
// ============================================================
function acharIndiceCartaoVisivel(lista: HTMLOListElement) {
  const cartoes = Array.from(lista.children) as HTMLElement[];
  const distancias = cartoes.map((cartao) => Math.abs(cartao.offsetLeft - lista.scrollLeft));
  const menorDistancia = Math.min(...distancias);

  return Math.max(distancias.indexOf(menorDistancia), 0);
}

function rolarAteCartao(lista: HTMLOListElement, indice: number) {
  const cartao = lista.children.item(indice);
  if (!(cartao instanceof HTMLElement)) return;

  const movimentoReduzido = window.matchMedia(midiaMovimentoReduzido).matches;
  lista.scrollTo({
    left: cartao.offsetLeft,
    behavior: movimentoReduzido ? "auto" : "smooth",
  });
}

// ============================================================
// 2. CARROSSEL DE PROJETOS
// No celular a lista rola de lado, um cartão por vez, com
// contador e setas. A partir de 48rem o CSS desliga o
// carrossel e esconde os controles.
// ============================================================
export function CarrosselProjetos({
  idLista,
  classeLista,
  rotulo,
  inicio,
  total,
  children,
}: PropsCarrosselProjetos) {
  const lista = useRef<HTMLOListElement>(null);
  const quadroPendente = useRef(0);
  const [indiceAtual, setIndiceAtual] = useState(0);

  const noPrimeiro = indiceAtual === 0;
  const noUltimo = indiceAtual === total - 1;

  function atualizarIndiceAoRolar() {
    cancelAnimationFrame(quadroPendente.current);
    quadroPendente.current = requestAnimationFrame(() => {
      if (!lista.current) return;
      setIndiceAtual(acharIndiceCartaoVisivel(lista.current));
    });
  }

  function irParaCartao(deslocamento: number) {
    if (!lista.current) return;

    const destino = Math.min(Math.max(indiceAtual + deslocamento, 0), total - 1);
    rolarAteCartao(lista.current, destino);
  }

  return (
    <div className="carrossel" role="group" aria-roledescription="carrossel" aria-label={rotulo}>
      <ol
        ref={lista}
        id={idLista}
        className={`carrossel-lista ${classeLista}`}
        start={inicio}
        onScroll={atualizarIndiceAoRolar}
      >
        {children}
      </ol>
      <div className="carrossel-controles">
        <button
          type="button"
          className="carrossel-seta"
          aria-controls={idLista}
          disabled={noPrimeiro}
          onClick={() => irParaCartao(-1)}
        >
          <span aria-hidden="true">←</span>
          <span className="texto-leitor">Projeto anterior</span>
        </button>
        <p className="carrossel-contador" aria-live="polite">
          {indiceAtual + 1} / {total}
        </p>
        <button
          type="button"
          className="carrossel-seta"
          aria-controls={idLista}
          disabled={noUltimo}
          onClick={() => irParaCartao(1)}
        >
          <span aria-hidden="true">→</span>
          <span className="texto-leitor">Próximo projeto</span>
        </button>
      </div>
    </div>
  );
}
