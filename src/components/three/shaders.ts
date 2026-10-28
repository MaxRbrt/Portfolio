// ============================================================
// 1. VÉRTICE
// position = lugar do ponto no rosto. aOrigem = de onde ele vem.
// Cada ponto tem seu atraso, então o rosto se monta em onda.
// ============================================================
export const verticeParticulas = /* glsl */ `
  uniform float uMontagem;
  uniform float uDispersao;
  uniform float uTempo;
  uniform float uPixelRatio;
  uniform float uTamanho;

  attribute vec3 aOrigem;
  attribute float aBrilho;
  attribute float aAtraso;
  attribute float aPeso;
  attribute float aMovimento;

  varying float vBrilho;
  varying float vBase;
  varying float vPeso;

  float suavizarSaida(float t) {
    return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
  }

  void main() {
    float progresso = clamp(uMontagem * 1.45 - aAtraso, 0.0, 1.0);
    float montado = suavizarSaida(progresso);

    vec3 respiracao = 0.0035 * vec3(
      sin(uTempo * 1.1 + aAtraso * 40.0),
      cos(uTempo * 0.9 + aAtraso * 31.0),
      sin(uTempo * 0.7 + aAtraso * 17.0)
    );
    vec3 ponto = mix(aOrigem, position + respiracao * aMovimento, montado);

    float soltura = pow(uDispersao, 1.6) * (0.4 + aAtraso * 1.4);
    ponto += vec3(aOrigem.x * 0.55, 0.3 + aOrigem.y * 0.25, aOrigem.z * 0.35) * soltura;

    vec4 posicaoNaCamera = modelViewMatrix * vec4(ponto, 1.0);
    gl_Position = projectionMatrix * posicaoNaCamera;
    float tamanho = uTamanho * uPixelRatio * (0.7 + aBrilho * 0.8) / -posicaoNaCamera.z;
    gl_PointSize = min(tamanho, 3.5 * uPixelRatio);
    vBrilho = aBrilho * montado;
    vBase = smoothstep(-0.5, -0.3, position.y);
    vPeso = aPeso;
  }
`;

// ============================================================
// 2. FRAGMENTO
// Ponto redondo e macio, prata frio, mais claro onde a foto
// era mais clara. A base do busto some em degradê.
// ============================================================
export const fragmentoParticulas = /* glsl */ `
  uniform float uOpacidade;

  varying float vBrilho;
  varying float vBase;
  varying float vPeso;

  void main() {
    float distancia = length(gl_PointCoord - 0.5);
    if (distancia > 0.5) {
      discard;
    }
    float borda = smoothstep(0.5, 0.1, distancia);
    vec3 cor = mix(vec3(0.55, 0.58, 0.64), vec3(0.93, 0.94, 0.97), vBrilho);
    gl_FragColor = vec4(cor, borda * (0.25 + vBrilho * 0.75) * vBase * vPeso * uOpacidade);
  }
`;
