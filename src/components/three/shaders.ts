// ============================================================
// 1. VÉRTICE
// position = lugar do ponto no rosto. Depois de projetado, cada
// ponto fica preso na coluna de tela mais próxima (uColunas por
// metade da tela), então o rosto é feito de linhas verticais que
// não saem do lugar quando a cabeça gira. Na entrada o contorno (aBorda) aparece antes do
// miolo, de cima para baixo. O pescoço é um esqueleto de três
// articulações: cada uma gira uma parte do ângulo, e o ponto
// segue cada uma pelo seu peso (aPesos). Na saída o rosto quebra
// em lascas (células inclinadas): cada uma parte na sua hora,
// gira em volta do próprio centro, se afasta e some.
// ============================================================
export const verticeParticulas = /* glsl */ `
  uniform float uMontagem;
  uniform float uDispersao;
  uniform float uTempo;
  uniform float uPixelRatio;
  uniform float uTamanho;
  uniform float uColunas;
  uniform vec2 uGiro;
  uniform vec3 uFracaoArticulacoes;
  uniform vec3 uPivoBase;
  uniform vec3 uPivoMeio;
  uniform vec3 uPivoCranio;

  attribute vec3 aOrigem;
  attribute vec3 aCor;
  attribute float aBrilho;
  attribute float aBorda;
  attribute float aAtraso;
  attribute vec3 aPesos;

  varying vec3 vCor;
  varying float vBrilho;
  varying float vBorda;
  varying float vVisivel;
  varying float vBase;
  varying float vLasca;

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

  float sortearLasca(vec2 celula, float semente) {
    return fract(sin(dot(celula, vec2(127.1, 311.7)) + semente * 74.7) * 43758.5453);
  }

  vec3 quebrarEmLascas(vec3 ponto) {
    vec2 celula = floor(vec2(
      position.x * 7.0 + position.y * 3.0,
      position.y * 8.0 - position.x * 2.5
    ));
    vec2 meioDaCelula = celula + 0.5;
    vec2 centro = vec2(
      8.0 * meioDaCelula.x - 3.0 * meioDaCelula.y,
      2.5 * meioDaCelula.x + 7.0 * meioDaCelula.y
    ) / 63.5;
    float partida = sortearLasca(celula, 1.0) * 0.55;
    float progresso = clamp((uDispersao - partida) / 0.45, 0.0, 1.0);
    float avanco = progresso * progresso;
    vLasca = 1.0 - smoothstep(0.5, 1.0, progresso);

    float angulo = (sortearLasca(celula, 2.0) - 0.5) * 3.2 * avanco;
    vec2 local = ponto.xy - centro;
    local = vec2(
      local.x * cos(angulo) - local.y * sin(angulo),
      local.x * sin(angulo) + local.y * cos(angulo)
    );
    vec2 direcao = normalize(centro + vec2(0.001, 0.02));
    float alcance = 0.7 + sortearLasca(celula, 3.0) * 0.9;
    vec2 afastamento = (direcao * alcance + vec2(0.0, 0.25)) * avanco;
    float profundidade = (sortearLasca(celula, 4.0) - 0.3) * 1.4 * avanco;
    vec3 farelo = aOrigem * 0.05 * avanco;
    return vec3(centro + local + afastamento, ponto.z + profundidade) + farelo;
  }

  void main() {
    float contorno = smoothstep(0.22, 0.6, aBorda);
    float partida = (1.0 - contorno) * 0.4 + (0.5 - position.y) * 0.25 + aAtraso * 0.3;
    vVisivel = smoothstep(partida, partida + 0.2, uMontagem);

    vec3 ponto = deformarPescoco(position);
    ponto.y += 0.0025 * sin(uTempo * 0.9 + position.x * 60.0);
    ponto.y += (1.0 - vVisivel) * 0.03;

    ponto = quebrarEmLascas(ponto);

    vec4 posicaoNaCamera = modelViewMatrix * vec4(ponto, 1.0);
    gl_Position = projectionMatrix * posicaoNaCamera;
    float xNaTela = gl_Position.x / gl_Position.w;
    float colunaNaTela = (floor(xNaTela * uColunas) + 0.5) / uColunas;
    gl_Position.x = colunaNaTela * gl_Position.w;
    gl_PointSize = uTamanho * uPixelRatio;
    vCor = aCor;
    vBrilho = aBrilho;
    vBorda = contorno;
    vBase = smoothstep(-0.5, -0.3, position.y);
    vVisivel *= vLasca;
  }
`;

// ============================================================
// 2. FRAGMENTO
// Cada ponto tem três colunas de altura: um traço em pé no meio
// e preto dos lados, que tampa a grade atrás do rosto. Três estados
// misturados: linha azulada (mais clara no contorno), luz branca
// (uLuz) e foto em preto e branco (uFoto). A base do busto some
// em degradê.
// ============================================================
export const fragmentoParticulas = /* glsl */ `
  uniform float uOpacidade;
  uniform float uSurgimento;
  uniform float uLuz;
  uniform float uFoto;
  uniform float uTempo;

  varying vec3 vCor;
  varying float vBrilho;
  varying float vBorda;
  varying float vVisivel;
  varying float vBase;

  void main() {
    vec2 centro = gl_PointCoord - 0.5;
    float lado = abs(centro.x);
    if (lado > 0.2) {
      discard;
    }
    float traco = smoothstep(0.13, 0.093, lado);
    float cobertura = smoothstep(0.5, 0.36, abs(centro.y));

    float variacaoLuz = 0.94 + 0.06 * sin(uTempo * 0.6);
    vec3 corLinha = mix(vec3(0.32, 0.66, 0.95), vec3(0.86, 0.96, 1.0), max(vBrilho, vBorda));
    float presencaLinha = 0.18 + 0.5 * vBrilho + 0.5 * vBorda;

    float luminancia = dot(vCor, vec3(0.299, 0.587, 0.114));
    float cinzaContrastado = clamp((luminancia - 0.5) * 1.15 + 0.5, 0.0, 1.0);
    vec3 corFoto = vec3(cinzaContrastado) * 1.08 * variacaoLuz;
    float presencaFoto = 1.0;

    vec3 cor = mix(corLinha, vec3(1.0), uLuz);
    float presenca = mix(presencaLinha, 1.0, uLuz);
    cor = mix(cor, corFoto, uFoto);
    presenca = mix(presenca, presencaFoto, uFoto);

    float alfa = cobertura * vVisivel * vBase * uOpacidade * uSurgimento;
    gl_FragColor = vec4(cor * traco * presenca, alfa);
  }
`;
