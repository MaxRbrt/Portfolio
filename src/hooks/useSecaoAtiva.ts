import { useEffect, useState } from "react";
import type { RefObject } from "react";

interface PosicaoSecao {
  id: string;
  topo: number;
}

export function identificarSecaoAtiva(
  secoes: readonly PosicaoSecao[],
  limite: number,
  chegouAoFim: boolean,
): string | undefined {
  if (chegouAoFim) return secoes.at(-1)?.id;

  let secaoAtiva = secoes[0]?.id;

  for (const secao of secoes) {
    if (secao.topo > limite) break;
    secaoAtiva = secao.id;
  }

  return secaoAtiva;
}

export function useSecaoAtiva(
  ids: readonly string[],
  cabecalho: RefObject<HTMLElement | null>,
): string | undefined {
  const [secaoAtiva, definirSecaoAtiva] = useState(ids[0]);

  useEffect(() => {
    const secoes = ids.flatMap((id) => document.getElementById(id) ?? []);
    const idInicial = window.location.hash.slice(1);
    const secaoInicial = secoes.find(({ id }) => id === idInicial);
    let quadro = 0;

    if (window.scrollY === 0) secaoInicial?.scrollIntoView();

    function medirSecoes() {
      quadro = 0;
      const limite = (cabecalho.current?.getBoundingClientRect().bottom ?? 0) + 1;
      const fimDaPagina = document.documentElement.scrollHeight - window.innerHeight;
      const chegouAoFim = fimDaPagina > 1 && window.scrollY >= fimDaPagina - 1;
      const posicoes = secoes.map((secao) => ({
        id: secao.id,
        topo: secao.getBoundingClientRect().top,
      }));

      definirSecaoAtiva(identificarSecaoAtiva(posicoes, limite, chegouAoFim));
    }

    function agendarMedicao() {
      if (!quadro) quadro = window.requestAnimationFrame(medirSecoes);
    }

    const observador = new ResizeObserver(agendarMedicao);
    observador.observe(document.body);
    window.addEventListener("scroll", agendarMedicao, { passive: true });
    window.addEventListener("resize", agendarMedicao);
    agendarMedicao();

    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", agendarMedicao);
      window.removeEventListener("resize", agendarMedicao);
      window.cancelAnimationFrame(quadro);
    };
  }, [ids, cabecalho]);

  return secaoAtiva;
}
