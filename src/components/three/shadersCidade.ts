// ============================================================
// 1. VÉRTICE DA CIDADE
// Plano em tela cheia, escrito direto no espaço de recorte.
// ============================================================
export const verticeCidade = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

// ============================================================
// 2. FRAGMENTO DA CIDADE E DO BECO
// Cânion: zoom na luz do fundo até o branco tomar a tela.
// Vista de cima: abre do branco com a câmera descendo; o bloco
// vermelho do meio cresce e a cidade em volta se parte em
// quarteirões que voam para fora. O vermelho que enche a tela
// vira o beco do contato: paralaxe no cursor, faíscas somadas,
// brasas subindo e, no fim, ruído vermelho.
// ============================================================
export const fragmentoCidade = /* glsl */ `
  uniform sampler2D uCanion;
  uniform sampler2D uVista;
  uniform sampler2D uFotoBeco;
  uniform sampler2D uFaiscas;
  uniform float uAspectoCena;
  uniform vec2 uTamanhoEmPixels;
  uniform float uZoomCanion;
  uniform float uBranco;
  uniform float uMostraVista;
  uniform float uDescida;
  uniform float uBloco;
  uniform float uBeco;
  uniform float uRuido;
  uniform float uTextoCanion;
  uniform vec2 uPonteiro;
  uniform float uTempo;
  varying vec2 vUv;

  const vec2 LUZ_DO_CANION = vec2(0.5, 0.2);
  const vec2 MEIO = vec2(0.5, 0.5);
  const vec3 BRANCO_DA_LUZ = vec3(0.94, 0.97, 1.0);
  const vec3 VERMELHO = vec3(0.78, 0.05, 0.08);
  const float QUARTEIROES = 7.0;

  float sortear(vec2 ponto) {
    return fract(sin(dot(ponto, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec2 cobrir(vec2 uv) {
    float aspectoDaTela = uTamanhoEmPixels.x / uTamanhoEmPixels.y;
    vec2 escala = aspectoDaTela > uAspectoCena
      ? vec2(1.0, uAspectoCena / aspectoDaTela)
      : vec2(aspectoDaTela / uAspectoCena, 1.0);
    return 0.5 + (uv - 0.5) * escala;
  }

  vec2 aproximar(vec2 uv, vec2 foco, float zoom) {
    return foco + (uv - foco) / zoom;
  }

  vec3 desenharCanion(vec2 uvCena) {
    vec2 uvCanion = aproximar(uvCena, LUZ_DO_CANION, uZoomCanion);
    vec3 cor = texture2D(uCanion, uvCanion).rgb;
    vec2 daLuz = (uvCena - LUZ_DO_CANION) * vec2(uAspectoCena, 1.0);
    float brilho = exp(-length(daLuz) * mix(9.0, 2.5, uBranco));
    cor += BRANCO_DA_LUZ * brilho * (0.25 + 0.75 * (uZoomCanion - 1.0));
    float ladoDoTexto = smoothstep(0.62, 0.0, vUv.x) * uTextoCanion;
    return cor * (1.0 - 0.72 * ladoDoTexto);
  }

  vec3 lerVista(vec2 uvTela) {
    vec2 uvVista = aproximar(cobrir(uvTela), MEIO, 1.0 + 0.55 * uDescida);
    return texture2D(uVista, uvVista).rgb;
  }

  vec3 desenharVista(vec2 uvTela) {
    float aspectoDaTela = uTamanhoEmPixels.x / uTamanhoEmPixels.y;
    vec2 doMeio = (uvTela - MEIO) * vec2(aspectoDaTela, 1.0);
    float metadeDoBloco = mix(0.075, 1.25, uBloco * uBloco);
    float noBloco = step(max(abs(doMeio.x), abs(doMeio.y)), metadeDoBloco);
    vec3 vermelhoDoBloco = mix(lerVista(uvTela) * vec3(1.6, 0.35, 0.35), VERMELHO, uBloco);

    float explosao = uBloco;
    vec2 estimado = doMeio / (1.0 + explosao * 1.2);
    vec2 quarteirao = floor(estimado * QUARTEIROES);
    float sorteio = sortear(quarteirao);
    vec2 origem = doMeio / (1.0 + explosao * (0.6 + 1.2 * sorteio));
    float mesmoQuarteirao = 1.0 - step(0.5, length(floor(origem * QUARTEIROES) - quarteirao));
    vec2 uvOrigem = MEIO + origem / vec2(aspectoDaTela, 1.0);
    float presenca = mesmoQuarteirao * (1.0 - smoothstep(0.45, 0.95, explosao));
    vec3 cidade = lerVista(uvOrigem) * mix(1.0, presenca, step(0.001, explosao));
    return mix(cidade, vermelhoDoBloco, noBloco);
  }

  float medirBrasas(vec2 uv) {
    float aspecto = uTamanhoEmPixels.x / uTamanhoEmPixels.y;
    float soma = 0.0;
    for (int camada = 0; camada < 3; camada++) {
      float escala = 9.0 + float(camada) * 6.0;
      vec2 grade = uv * vec2(aspecto, 1.0) * escala;
      grade.y -= uTempo * (0.5 + 0.25 * float(camada));
      grade.x += sin(grade.y * 0.7 + float(camada)) * 0.4;
      vec2 celula = floor(grade);
      float sorteio = sortear(celula + float(camada) * 13.7);
      vec2 desvio = vec2(sortear(celula + 2.3), sortear(celula + 5.9)) - 0.5;
      float distancia = length(fract(grade) - 0.5 - desvio * 0.6);
      float piscar = 0.6 + 0.4 * sin(uTempo * 5.0 + sorteio * 40.0);
      soma += smoothstep(0.07, 0.0, distancia) * step(0.86, sorteio) * piscar;
    }
    return soma;
  }

  vec3 desenharBeco(vec2 uvTela) {
    vec2 paralaxe = uPonteiro * vec2(0.012, 0.008);
    vec2 uvBeco = aproximar(cobrir(uvTela), MEIO, 1.05) + paralaxe;
    vec3 cor = texture2D(uFotoBeco, uvBeco).rgb;
    vec2 uvFaiscas = cobrir(uvTela) - paralaxe * 2.0 + vec2(0.0, -uTempo * 0.015);
    float tremor = 0.75 + 0.25 * sin(uTempo * 3.1) * sin(uTempo * 1.7);
    cor += texture2D(uFaiscas, uvFaiscas).rgb * 0.55 * tremor;
    cor += vec3(1.0, 0.45, 0.15) * medirBrasas(uvTela) * 0.8;
    float meioDoTexto = smoothstep(0.55, 0.0, length((uvTela - MEIO) * vec2(1.0, 1.6)));
    return cor * (1.0 - 0.35 * meioDoTexto);
  }

  vec3 desfazerEmRuido(vec3 cor, vec2 uvTela) {
    if (uRuido <= 0.0) {
      return cor;
    }
    vec2 grao = floor(uvTela * uTamanhoEmPixels / 3.0);
    float ruido = sortear(grao + floor(uTempo * 14.0));
    float limite = sortear(floor(uvTela * uTamanhoEmPixels / 24.0));
    float tomado = step(limite, uRuido * 1.05 - 0.02);
    vec3 vermelhoRuidoso = VERMELHO * (0.25 + 0.55 * ruido);
    return mix(cor, vermelhoRuidoso, tomado);
  }

  void main() {
    vec3 cidade = uMostraVista > 0.5 ? desenharVista(vUv) : desenharCanion(cobrir(vUv));
    cidade = mix(cidade, BRANCO_DA_LUZ, uBranco);
    vec3 cor = uBeco > 0.0 ? mix(cidade, desenharBeco(vUv), uBeco) : cidade;
    cor = desfazerEmRuido(cor, vUv);
    gl_FragColor = vec4(cor, 1.0);
  }
`;
