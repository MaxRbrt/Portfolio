// ============================================================
// 1. VÉRTICE DA INDÚSTRIA
// Mesmo desenho do plano da galeria (direto na tela, reto), que
// cresce do cartão até a tela cheia. Na saída o plano fica
// parado: quem some é a imagem.
// ============================================================
export const verticeIndustria = /* glsl */ `
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
// 2. FRAGMENTO DA INDÚSTRIA
// Começa com a imagem do último projeto e troca para a fábrica
// logo no início do crescimento. A câmera avança (zoom no ponto
// de fuga), as três fotos se cruzam (uPesos), a cena escurece e
// as luzes somam por cima com zoom um pouco mais rápido. Poeira
// fria: campo de pontos em quatro camadas vindo na direção da
// câmera. Meio mais escuro para o texto centralizado.
// Saída (uSaida): a câmera acelera para o fundo, a luz do fim do
// corredor cresce e abre um buraco do centro para fora, com
// borda luminosa e macia, mostrando a cidade por baixo.
// ============================================================
export const fragmentoIndustria = /* glsl */ `
  uniform sampler2D uProjeto;
  uniform sampler2D uCena1;
  uniform sampler2D uCena2;
  uniform sampler2D uCena3;
  uniform sampler2D uLuzes;
  uniform vec3 uPesos;
  uniform float uAspectoProjeto;
  uniform float uAspectoCena;
  uniform vec2 uTamanhoEmPixels;
  uniform float uRaioEmPixels;
  uniform float uCrescimento;
  uniform float uAvanco;
  uniform float uSaida;
  uniform float uTempo;
  varying vec2 vUv;

  const vec2 PONTO_DE_FUGA = vec2(0.5, 0.56);
  const vec3 COR_DA_POEIRA = vec3(0.72, 0.86, 1.0);
  const vec3 COR_DA_LUZ_DO_FUNDO = vec3(0.8, 0.9, 1.0);
  const float BORDA_DA_ABERTURA = 0.22;

  float medirCanto(vec2 uv) {
    vec2 ponto = (uv - 0.5) * uTamanhoEmPixels;
    vec2 metade = uTamanhoEmPixels * 0.5 - uRaioEmPixels;
    vec2 distancias = abs(ponto) - metade;
    float dentro = min(max(distancias.x, distancias.y), 0.0);
    return length(max(distancias, 0.0)) + dentro - uRaioEmPixels;
  }

  vec2 cobrir(vec2 uv, float aspectoDaImagem) {
    float aspectoDoPlano = uTamanhoEmPixels.x / uTamanhoEmPixels.y;
    vec2 escala = aspectoDoPlano > aspectoDaImagem
      ? vec2(1.0, aspectoDaImagem / aspectoDoPlano)
      : vec2(aspectoDoPlano / aspectoDaImagem, 1.0);
    return 0.5 + (uv - 0.5) * escala;
  }

  vec2 aproximar(vec2 uv, float zoom) {
    return PONTO_DE_FUGA + (uv - PONTO_DE_FUGA) / zoom;
  }

  float sortear(vec2 ponto) {
    return fract(sin(dot(ponto, vec2(127.1, 311.7))) * 43758.5453);
  }

  float medirPoeira(vec2 uv) {
    float aspecto = uTamanhoEmPixels.x / uTamanhoEmPixels.y;
    vec2 doFoco = (uv - PONTO_DE_FUGA) * vec2(aspecto, 1.0);
    float soma = 0.0;
    for (int camada = 0; camada < 4; camada++) {
      float profundidade = fract(float(camada) * 0.25 + uTempo * 0.035 + uAvanco * 0.9);
      vec2 grade = doFoco * mix(16.0, 1.4, profundidade) + float(camada) * 7.31;
      vec2 celula = floor(grade);
      float sorteio = sortear(celula);
      vec2 desvio = vec2(sortear(celula + 1.7), sortear(celula + 3.1)) - 0.5;
      float distancia = length(fract(grade) - 0.5 - desvio * 0.7);
      float ponto = smoothstep(0.03 + 0.04 * sorteio, 0.0, distancia) * step(0.6, sorteio);
      float presenca = smoothstep(0.0, 0.3, profundidade) * smoothstep(1.0, 0.75, profundidade);
      soma += ponto * presenca;
    }
    return soma;
  }

  float medirDistanciaDoFundo(vec2 uv) {
    float aspecto = uTamanhoEmPixels.x / uTamanhoEmPixels.y;
    return length((uv - PONTO_DE_FUGA) * vec2(aspecto, 1.0));
  }

  vec3 desenharFabrica(vec2 uv, float saida) {
    vec2 uvCena = cobrir(uv, uAspectoCena);
    float zoomDaSaida = 1.0 + 1.4 * saida * saida;
    float zoom = (1.0 + 0.04 * uCrescimento + 0.5 * uAvanco) * zoomDaSaida;
    vec2 uvFabrica = aproximar(uvCena, zoom);
    vec3 fabrica = texture2D(uCena1, uvFabrica).rgb * uPesos.x;
    fabrica += texture2D(uCena2, uvFabrica).rgb * uPesos.y;
    fabrica += texture2D(uCena3, uvFabrica).rgb * uPesos.z;
    fabrica *= 1.0 - 0.55 * smoothstep(0.45, 1.0, uAvanco);

    vec3 luzes = texture2D(uLuzes, aproximar(uvCena, (1.0 + 0.8 * uAvanco) * zoomDaSaida)).rgb;
    float pulso = 0.85 + 0.15 * sin(uTempo * 1.7);
    float forcaDasLuzes = (0.3 + 0.7 * smoothstep(0.3, 1.0, uAvanco)) * pulso;
    fabrica += luzes * forcaDasLuzes * uCrescimento;
    fabrica += COR_DA_POEIRA * medirPoeira(uvCena) * 0.55 * uCrescimento;

    float meioDoTexto = smoothstep(0.62, 0.0, length((uv - 0.5) * vec2(1.1, 1.7)));
    fabrica *= 1.0 - 0.58 * meioDoTexto * uCrescimento * (1.0 - saida);

    float luzDoFundo = smoothstep(0.7, 0.0, medirDistanciaDoFundo(uv));
    return fabrica + COR_DA_LUZ_DO_FUNDO * luzDoFundo * saida * 0.9;
  }

  vec4 abrirParaACidade(vec3 cor, vec2 uv, float saida) {
    float distancia = medirDistanciaDoFundo(uv);
    float raio = mix(-BORDA_DA_ABERTURA, 1.25, saida);
    float presenca = smoothstep(raio, raio + BORDA_DA_ABERTURA, distancia);
    float naBorda = 1.0 - abs(distancia - raio - BORDA_DA_ABERTURA * 0.5) / BORDA_DA_ABERTURA;
    float brilhoDaBorda = clamp(naBorda, 0.0, 1.0) * smoothstep(0.0, 0.15, saida);
    vec3 corComBorda = cor + COR_DA_LUZ_DO_FUNDO * brilhoDaBorda * 0.8;
    float alpha = max(presenca, brilhoDaBorda * 0.6 * (1.0 - saida));
    return vec4(corComBorda, alpha);
  }

  void main() {
    float saida = smoothstep(0.0, 1.0, uSaida);

    vec3 projeto = texture2D(uProjeto, cobrir(vUv, uAspectoProjeto)).rgb;
    float viraFabrica = smoothstep(0.02, 0.35, uCrescimento);
    vec3 cor = mix(projeto, desenharFabrica(vUv, saida), viraFabrica);
    vec4 corAberta = abrirParaACidade(cor, vUv, saida);

    float cobertura = 1.0 - smoothstep(-0.5, 0.5, medirCanto(vUv));
    gl_FragColor = vec4(corAberta.rgb, corAberta.a * cobertura);
  }
`;
