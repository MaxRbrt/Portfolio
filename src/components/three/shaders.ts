// ============================================================
// 1. VÉRTICE
// position = lugar do ponto no rosto. aOrigem = de onde ele vem.
// Cada ponto tem seu atraso, então o rosto se monta em onda.
// O pescoço é um esqueleto de três articulações: cada uma gira
// uma parte do ângulo, e o ponto segue cada uma pelo seu peso
// (aPesos). Ordem: pose, pescoço, respiração, montagem, poeira.
// ============================================================
export const verticeParticulas = /* glsl */ `
  uniform float uMontagem;
  uniform float uDispersao;
  uniform float uTempo;
  uniform float uPixelRatio;
  uniform float uTamanho;
  uniform vec2 uGiro;
  uniform vec3 uFracaoArticulacoes;
  uniform vec3 uPivoBase;
  uniform vec3 uPivoMeio;
  uniform vec3 uPivoCranio;

  attribute vec3 aOrigem;
  attribute float aBrilho;
  attribute float aAtraso;
  attribute vec3 aPesos;

  varying float vBrilho;
  varying float vBase;

  float suavizarSaida(float t) {
    return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
  }

  vec3 girarArticulacao(vec3 ponto, vec3 pivo, float parcela) {
    float guinada = uGiro.x * parcela;
    float aceno = uGiro.y * parcela;
    vec3 local = ponto - pivo;

    float cosAceno = cos(aceno);
    float senAceno = sin(aceno);
    local = vec3(
      local.x,
      local.y * cosAceno - local.z * senAceno,
      local.y * senAceno + local.z * cosAceno
    );

    float cosGuinada = cos(guinada);
    float senGuinada = sin(guinada);
    local = vec3(
      local.x * cosGuinada + local.z * senGuinada,
      local.y,
      -local.x * senGuinada + local.z * cosGuinada
    );
    return local + pivo;
  }

  vec3 deformarPescoco(vec3 ponto) {
    vec3 parcelas = aPesos * uFracaoArticulacoes;
    ponto = girarArticulacao(ponto, uPivoCranio, parcelas.z);
    ponto = girarArticulacao(ponto, uPivoMeio, parcelas.y);
    return girarArticulacao(ponto, uPivoBase, parcelas.x);
  }

  void main() {
    float progresso = clamp(uMontagem * 1.45 - aAtraso, 0.0, 1.0);
    float montado = suavizarSaida(progresso);

    vec3 pose = deformarPescoco(position);
    vec3 respiracao = 0.0035 * vec3(
      sin(uTempo * 1.1 + aAtraso * 40.0),
      cos(uTempo * 0.9 + aAtraso * 31.0),
      sin(uTempo * 0.7 + aAtraso * 17.0)
    );
    vec3 ponto = mix(aOrigem, pose + respiracao, montado);

    float soltura = pow(uDispersao, 1.6) * (0.4 + aAtraso * 1.4);
    ponto += vec3(aOrigem.x * 0.55, 0.3 + aOrigem.y * 0.25, aOrigem.z * 0.35) * soltura;

    vec4 posicaoNaCamera = modelViewMatrix * vec4(ponto, 1.0);
    gl_Position = projectionMatrix * posicaoNaCamera;
    float tamanho = uTamanho * uPixelRatio * (0.7 + aBrilho * 0.8) / -posicaoNaCamera.z;
    gl_PointSize = min(tamanho, 3.5 * uPixelRatio);
    vBrilho = aBrilho * montado;
    vBase = smoothstep(-0.5, -0.3, position.y);
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

  void main() {
    float distancia = length(gl_PointCoord - 0.5);
    if (distancia > 0.5) {
      discard;
    }
    float borda = smoothstep(0.5, 0.1, distancia);
    vec3 cor = mix(vec3(0.55, 0.58, 0.64), vec3(0.93, 0.94, 0.97), vBrilho);
    gl_FragColor = vec4(cor, borda * (0.25 + vBrilho * 0.75) * vBase * uOpacidade);
  }
`;
