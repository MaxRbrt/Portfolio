import { calcularProgressoCarga } from "../three/carregarRosto";

// ============================================================
// 1. ESTADO DA ABERTURA
// Liga o carregamento do rosto, a tela de carregamento e a
// sequência de entrada. Cada mudança gera objeto novo para o
// useSyncExternalStore perceber.
// progresso: fração baixada do rosto, null sem tamanho conhecido.
// rostoResolvido: rosto pronto, trocado pela imagem ou com erro.
// liberada: a tela de carregamento saiu, a sequência pode rodar.
// concluida: a sequência de entrada terminou.
// ============================================================
export type EstadoAbertura = {
  progresso: number | null;
  rostoResolvido: boolean;
  liberada: boolean;
  concluida: boolean;
};

let estadoAtual: EstadoAbertura = {
  progresso: null,
  rostoResolvido: false,
  liberada: false,
  concluida: false,
};

const assinantes = new Set<() => void>();

function atualizarAbertura(mudanca: Partial<EstadoAbertura>) {
  const proximo = { ...estadoAtual, ...mudanca };
  const chaves = Object.keys(mudanca) as Array<keyof EstadoAbertura>;
  const mudouAlgo = chaves.some((chave) => proximo[chave] !== estadoAtual[chave]);
  if (!mudouAlgo) {
    return;
  }
  estadoAtual = proximo;
  assinantes.forEach((avisar) => avisar());
}

// ============================================================
// 2. LEITURA E ASSINATURA
// ============================================================
export function lerAbertura(): EstadoAbertura {
  return estadoAtual;
}

export function assinarAbertura(avisar: () => void): () => void {
  assinantes.add(avisar);
  return () => {
    assinantes.delete(avisar);
  };
}

// ============================================================
// 3. MUDANÇAS
// ============================================================
export function informarProgresso(recebidos: number, total: number | null) {
  atualizarAbertura({ progresso: calcularProgressoCarga(recebidos, total) });
}

export function resolverRosto() {
  atualizarAbertura({ rostoResolvido: true });
}

export function liberarAbertura() {
  atualizarAbertura({ liberada: true });
}

export function concluirAbertura() {
  atualizarAbertura({ concluida: true });
}
