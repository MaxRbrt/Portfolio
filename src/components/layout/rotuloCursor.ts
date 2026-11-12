// ============================================================
// 1. RÓTULO DO CURSOR CONTEXTUAL
// Lê o data-cursor do elemento mais próximo sob o ponteiro.
// ============================================================
export type AlvoCursor = {
  closest(seletor: string): { getAttribute(nome: string): string | null } | null;
};

export function lerRotuloCursor(alvo: AlvoCursor | null): string | null {
  if (!alvo) {
    return null;
  }
  const elementoComRotulo = alvo.closest("[data-cursor]");
  const rotulo = elementoComRotulo?.getAttribute("data-cursor")?.trim();
  return rotulo ? rotulo : null;
}
