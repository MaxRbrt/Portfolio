import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import {
  estadoCinematica,
  observarProgressoCinematica,
  progressoCortinaCobrindoTopo,
} from "../../animation/progressoCinematica";
import { useSecaoAtiva } from "../../hooks/useSecaoAtiva";

export interface SecaoNavegacao {
  id: string;
  rotulo: string;
  tema: "claro" | "escuro";
}

interface PropriedadesCabecalho {
  secoes: readonly SecaoNavegacao[];
}

// ============================================================
// 1. TEMA DURANTE A CORTINA DA CINEMÁTICA
// ============================================================
function useCortinaCinematicaCobrindo() {
  const [cobrindo, definirCobrindo] = useState(false);

  useEffect(
    () =>
      observarProgressoCinematica(() => {
        definirCobrindo(estadoCinematica.progresso >= progressoCortinaCobrindoTopo);
      }),
    [],
  );

  return cobrindo;
}

// ============================================================
// 2. CABEÇALHO
// ============================================================
export function Cabecalho({ secoes }: PropriedadesCabecalho) {
  const cabecalho = useRef<HTMLElement>(null);
  const marca = useRef<HTMLAnchorElement>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const [menuAberto, definirMenuAberto] = useState(false);
  const ids = useMemo(() => secoes.map(({ id }) => id), [secoes]);
  const secaoAtiva = useSecaoAtiva(ids, cabecalho);
  const cortinaCobrindo = useCortinaCinematicaCobrindo();
  const temaDaSecao = secoes.find(({ id }) => id === secaoAtiva)?.tema ?? "escuro";
  const cortinaSobInicio = cortinaCobrindo && secaoAtiva === "inicio";
  const tema = cortinaSobInicio ? "claro" : temaDaSecao;

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");

    function fecharEmDesktop(evento: MediaQueryListEvent) {
      if (!evento.matches || !dialogo.current?.open) return;

      dialogo.current.close();
      marca.current?.focus({ preventScroll: true });
    }

    desktop.addEventListener("change", fecharEmDesktop);
    return () => desktop.removeEventListener("change", fecharEmDesktop);
  }, []);

  function abrirMenu(evento: MouseEvent<HTMLButtonElement>) {
    const painel = dialogo.current;
    if (!painel || painel.open) return;

    painel.toggleAttribute("data-entrada-animada", evento.detail > 0);
    painel.showModal();
    definirMenuAberto(true);
    painel.querySelector("a")?.focus({ preventScroll: true });
  }

  function fecharMenu() {
    dialogo.current?.close();
  }

  function circularFocoNoMenu(evento: KeyboardEvent<HTMLDialogElement>) {
    if (evento.key !== "Tab") return;

    const primeiro = evento.currentTarget.querySelector("button");
    const ultimo = evento.currentTarget.querySelector<HTMLAnchorElement>("li:last-child a");
    const foco = document.activeElement;
    const destino = evento.shiftKey && foco === primeiro ? ultimo : null;
    const focoCircular = !evento.shiftKey && foco === ultimo ? primeiro : destino;
    if (!focoCircular) return;

    evento.preventDefault();
    focoCircular.focus();
  }

  const linksDesktop = secoes.filter(({ id }) => id !== "inicio");

  return (
    <header ref={cabecalho} className="cabecalho-portfolio" data-tema={tema}>
      <a className="pular-navegacao" href="#conteudo">
        Ir para o conteúdo
      </a>
      <div className="cabecalho-barra">
        <a
          ref={marca}
          href="#inicio"
          className="cabecalho-marca"
          aria-current={secaoAtiva === "inicio" ? "location" : undefined}
        >
          Marcos Roberto
        </a>
        <nav className="cabecalho-navegacao" aria-label="Navegação principal">
          <ul>
            {linksDesktop.map(({ id, rotulo }) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={secaoAtiva === id ? "location" : undefined}>
                  {rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className="cabecalho-acionador"
          aria-haspopup="dialog"
          aria-controls="menu-portfolio"
          aria-expanded={menuAberto}
          onClick={abrirMenu}
        >
          Menu
          <span className="icone-menu" aria-hidden="true" />
        </button>
      </div>
      <dialog
        ref={dialogo}
        id="menu-portfolio"
        className="menu-portfolio"
        aria-label="Navegação"
        onClose={() => definirMenuAberto(false)}
        onKeyDown={circularFocoNoMenu}
      >
        <div className="menu-portfolio-barra">
          <button
            type="button"
            className="menu-portfolio-fechar"
            aria-label="Fechar menu"
            onClick={fecharMenu}
          >
            Fechar
            <span className="icone-fechar" aria-hidden="true" />
          </button>
        </div>
        <nav className="menu-portfolio-navegacao" aria-label="Navegação principal">
          <ul>
            {secoes.map(({ id, rotulo }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={secaoAtiva === id ? "location" : undefined}
                  onClick={fecharMenu}
                >
                  {rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </header>
  );
}
