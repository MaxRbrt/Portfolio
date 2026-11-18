import { useEffect, useRef } from "react";
import type { RefObject } from "react";

// ============================================================
// 1. COORDENADAS DO PONTEIRO NO HERO
// ============================================================
export function normalizarCursorHero(valor: number, comprimento: number): number {
  if (comprimento <= 0) return 0;

  return Math.max(-1, Math.min(1, (valor / comprimento) * 2 - 1));
}

export function useCursorNormalizado(secao: RefObject<HTMLElement | null>, invalidar: () => void) {
  const cursor = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const elemento = secao.current;
    if (!elemento) return;

    const atualizar = (evento: PointerEvent) => {
      if (evento.pointerType !== "mouse") return;

      const { left, top, width, height } = elemento.getBoundingClientRect();
      cursor.current.x = normalizarCursorHero(evento.clientX - left, width);
      cursor.current.y = normalizarCursorHero(evento.clientY - top, height);
      invalidar();
    };

    function centralizar() {
      cursor.current.x = 0;
      cursor.current.y = 0;
      invalidar();
    }

    elemento.addEventListener("pointermove", atualizar, { passive: true });
    elemento.addEventListener("pointerleave", centralizar);
    window.addEventListener("blur", centralizar);

    return () => {
      elemento.removeEventListener("pointermove", atualizar);
      elemento.removeEventListener("pointerleave", centralizar);
      window.removeEventListener("blur", centralizar);
    };
  }, [secao, invalidar]);

  return cursor;
}
