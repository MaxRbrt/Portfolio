import { useEffect } from "react";

// ============================================================
// 1. PONTEIRO DA CENA
// Posição do mouse na tela (-1..1, y para baixo), escrita pelos
// eventos e lida quadro a quadro pelo rosto e pela lente.
// ============================================================
export type PonteiroCena = { x: number; y: number; ativo: boolean };

export const ponteiroCena: PonteiroCena = { x: 0, y: 0, ativo: false };

function soltarPonteiro() {
  ponteiroCena.x = 0;
  ponteiroCena.y = 0;
  ponteiroCena.ativo = false;
}

function acompanharPonteiro(evento: PointerEvent) {
  ponteiroCena.x = (evento.clientX / window.innerWidth) * 2 - 1;
  ponteiroCena.y = (evento.clientY / window.innerHeight) * 2 - 1;
  ponteiroCena.ativo = true;
}

// ============================================================
// 2. AMORTECIMENTO POR QUADRO
// Fração do caminho até o alvo neste quadro, igual em qualquer
// taxa de quadros. Quadro longo (aba voltando) conta como 0,1 s.
// ============================================================
export function calcularFatorDeAmortecimento(rigidez: number, delta: number) {
  return 1 - Math.exp(-rigidez * Math.min(delta, 0.1));
}

export function usePonteiroCena(seguir: boolean) {
  useEffect(() => {
    if (!seguir) {
      soltarPonteiro();
      return undefined;
    }
    window.addEventListener("pointermove", acompanharPonteiro, { passive: true });
    document.documentElement.addEventListener("pointerleave", soltarPonteiro);
    return () => {
      window.removeEventListener("pointermove", acompanharPonteiro);
      document.documentElement.removeEventListener("pointerleave", soltarPonteiro);
      soltarPonteiro();
    };
  }, [seguir]);
}
