// ============================================================
// 1. SUPORTE A WEBGL
// Testa uma vez; sem WebGL o hero usa a imagem parada.
// ============================================================
let resultadoGuardado: boolean | null = null;

export function temWebGL() {
  if (resultadoGuardado !== null) {
    return resultadoGuardado;
  }
  try {
    const tela = document.createElement("canvas");
    resultadoGuardado = Boolean(tela.getContext("webgl2") ?? tela.getContext("webgl"));
  } catch {
    resultadoGuardado = false;
  }
  return resultadoGuardado;
}
