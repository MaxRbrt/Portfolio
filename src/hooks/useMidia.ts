import { useSyncExternalStore } from "react";

// ============================================================
// 1. CONSULTA DE MÍDIA REATIVA
// Acompanha "reduzir movimento", tipo de ponteiro e afins.
// ============================================================
function useMidia(consulta: string) {
  return useSyncExternalStore(
    (avisar) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", avisar);
      return () => lista.removeEventListener("change", avisar);
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}

export const COM_MOVIMENTO = "(prefers-reduced-motion: no-preference)";

export const MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";

export const useMovimentoReduzido = () => useMidia(MOVIMENTO_REDUZIDO);

export const usePonteiroGrosso = () => useMidia("(pointer: coarse)");
