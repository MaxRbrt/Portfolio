// ============================================================
// 1. VÉRTICE DA IMAGEM DA GALERIA
// O plano vai direto para a tela (sem câmera), no lugar exato do
// quadro HTML. Plano reto: sem bojo, curva ou esticão.
// ============================================================
export const verticeGaleria = /* glsl */ `
  uniform vec2 uCentro;
  uniform vec2 uTamanho;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec2 tela = uCentro + position.xy * uTamanho;
    gl_Position = vec4(tela, 0.0, 1.0);
  }
`;

// ============================================================
// 2. FRAGMENTO DA IMAGEM DA GALERIA
// Imagem crua, com borda suave de 1 px pela distância ao canto.
// ============================================================
export const fragmentoGaleria = /* glsl */ `
  uniform sampler2D uImagem;
  uniform vec2 uTamanhoEmPixels;
  uniform float uRaioEmPixels;
  varying vec2 vUv;

  float medirCanto(vec2 uv) {
    vec2 ponto = (uv - 0.5) * uTamanhoEmPixels;
    vec2 metade = uTamanhoEmPixels * 0.5 - uRaioEmPixels;
    vec2 distancias = abs(ponto) - metade;
    float dentro = min(max(distancias.x, distancias.y), 0.0);
    return length(max(distancias, 0.0)) + dentro - uRaioEmPixels;
  }

  void main() {
    vec4 cor = texture2D(uImagem, vUv);
    float cobertura = 1.0 - smoothstep(-0.5, 0.5, medirCanto(vUv));
    gl_FragColor = vec4(cor.rgb, cobertura);
  }
`;
