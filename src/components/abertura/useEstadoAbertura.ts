import { useSyncExternalStore } from "react";
import { assinarAbertura, lerAbertura } from "./estadoAbertura";

// ============================================================
// 1. GANCHO DO ESTADO DA ABERTURA
// ============================================================
export function useEstadoAbertura() {
  return useSyncExternalStore(assinarAbertura, lerAbertura, lerAbertura);
}
