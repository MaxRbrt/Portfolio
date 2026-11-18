// ============================================================
// 1. PROGRESSO DA CINEMÁTICA
// O ScrollTrigger escreve o progresso aqui e a cena 3D lê no
// próximo quadro. Fica fora do estado do React para não
// renderizar a árvore a cada evento de rolagem.
// ============================================================
type OuvinteProgressoCinematica = () => void;

export const estadoCinematica = { progresso: 0 };

const ouvintesCinematica = new Set<OuvinteProgressoCinematica>();

export function atualizarProgressoCinematica(progresso: number) {
  estadoCinematica.progresso = Math.max(0, Math.min(1, progresso));
  ouvintesCinematica.forEach((ouvinte) => ouvinte());
}

export function observarProgressoCinematica(ouvinte: OuvinteProgressoCinematica) {
  ouvintesCinematica.add(ouvinte);

  return () => {
    ouvintesCinematica.delete(ouvinte);
  };
}

// ============================================================
// 2. CORTINA DO FIM DA CINEMÁTICA
// A partir deste progresso o círculo claro já cobre o topo da
// tela, e o cabeçalho troca para o tema claro.
// ============================================================
export const progressoCortinaCobrindoTopo = 0.9;
