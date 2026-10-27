import { useSyncExternalStore } from "react";

// ============================================================
// 1. CONSULTA DE MÍDIA REATIVA
// Acompanha "reduzir movimento", tipo de ponteiro e afins.
// ============================================================
export function useMidia(consulta: string) {
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

export const useMovimentoReduzido = () => useMidia("(prefers-reduced-motion: reduce)");

export const usePonteiroGrosso = () => useMidia("(pointer: coarse)");
