import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { calcularDispersao, estadoCena } from "./estadoCena";
import { CAMADA_DA_GALERIA, CURVATURA_DO_PALCO, estadoPalco } from "./estadoPalco";
import { calcularFatorDeAmortecimento, ponteiroCena } from "./ponteiroCena";

const RAIO_LENTE = 0.2;
const RIGIDEZ_LENTE = 7;
const PRIORIDADE_DEPOIS_DA_CENA = 1;
const COR_FUNDO_DA_GALERIA = new THREE.Vector3(0.058, 0.06, 0.068);

// ============================================================
// 1. SHADER DA COMPOSIÇÃO
// A cena chega pronta numa textura. Folha: com a galeria na
// tela, a cena inteira vira uma folha preta que sobe junto com
// o topo da galeria, mais larga perto das bordas de cima e de
// baixo da tela (cilindro deitado), com um fio de luz na borda.
// Fora dela fica o fundo escuro da galeria: vinheta, brilho
// fraco no meio e grão de filme, nunca cor lisa.
// Lente: em volta do ponteiro um círculo amplia a imagem e
// separa vermelho e azul, mais forte perto da borda do círculo.
// ============================================================
const verticeComposicao = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentoComposicao = /* glsl */ `
  uniform sampler2D uCena;
  uniform vec2 uCursor;
  uniform float uForca;
  uniform float uAspecto;
  uniform float uRaio;
  uniform float uSubida;
  uniform float uGaleria;
  uniform float uCurvatura;
  uniform float uTempo;
  uniform vec3 uCorFundo;
  varying vec2 vUv;

  vec4 aplicarLente(vec2 uv) {
    if (uForca < 0.001) {
      return texture2D(uCena, uv);
    }
    vec2 afastamento = uv - uCursor;
    vec2 afastamentoRedondo = vec2(afastamento.x * uAspecto, afastamento.y);
    float distancia = length(afastamentoRedondo) / uRaio;
    float dentro = (1.0 - smoothstep(0.9, 1.0, distancia)) * uForca;
    float curva = 1.0 - distancia * distancia;
    vec2 uvLente = uCursor + afastamento * (1.0 - 0.3 * dentro * curva);

    vec2 direcao = afastamento / max(length(afastamentoRedondo), 0.0001);
    vec2 separacao = direcao * 0.012 * dentro * smoothstep(0.15, 1.0, distancia);
    vec4 vermelho = texture2D(uCena, uvLente + separacao);
    vec4 verde = texture2D(uCena, uvLente);
    vec4 azul = texture2D(uCena, uvLente - separacao);

    float aro = smoothstep(0.92, 0.97, distancia) * (1.0 - smoothstep(0.97, 1.02, distancia));
    vec3 cor = vec3(vermelho.r, verde.g, azul.b) + vec3(0.5, 0.7, 0.9) * aro * 0.18 * uForca;
    float alfa = max(max(vermelho.a, azul.a), verde.a) + aro * 0.18 * uForca;
    return vec4(cor, min(alfa, 1.0));
  }

  float sortearGrao(vec2 ponto) {
    return fract(sin(dot(ponto, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec3 desenharFundoDaGaleria(vec2 tela) {
    vec2 redondo = tela * vec2(uAspecto, 1.0) / max(uAspecto, 1.0);
    float vinheta = 1.0 - 0.55 * smoothstep(0.35, 1.45, length(redondo));
    float brilhoDoMeio = exp(-dot(redondo, redondo) * 2.2) * 0.05;
    vec3 base = uCorFundo * vinheta + vec3(0.55, 0.62, 0.72) * brilhoDoMeio;
    float grao = sortearGrao(floor(gl_FragCoord.xy) + floor(uTempo * 24.0)) - 0.5;
    return base + grao * 0.035;
  }

  void main() {
    vec2 tela = vUv * 2.0 - 1.0;
    float curvatura = uCurvatura * smoothstep(0.0, 0.25, uSubida);
    float alargamento = (1.0 + curvatura * tela.y * tela.y) / (1.0 + 0.3 * curvatura);
    vec2 folha = vec2(tela.x / alargamento, tela.y - 2.0 * uSubida);

    float bordaLateral = 1.0 - smoothstep(0.996, 1.0, abs(folha.x));
    float bordaDeBaixo = smoothstep(-1.0, -0.996, folha.y);
    float naFolha = bordaLateral * bordaDeBaixo;
    vec4 cena = aplicarLente(folha * 0.5 + 0.5);

    float distanciaDaBorda = abs(folha.y + 1.0);
    float fioDeLuz = (1.0 - smoothstep(0.0, 0.012, distanciaDaBorda)) * bordaLateral;
    vec3 fundo = desenharFundoDaGaleria(tela) + vec3(0.6, 0.72, 0.85) * fioDeLuz * 0.22;
    vec4 sobreFundo = vec4(mix(fundo, cena.rgb, naFolha), 1.0);
    gl_FragColor = mix(cena, sobreFundo, uGaleria);
  }
`;

function criarTelaDaComposicao(textura: THREE.Texture) {
  const material = new THREE.ShaderMaterial({
    vertexShader: verticeComposicao,
    fragmentShader: fragmentoComposicao,
    uniforms: {
      uCena: { value: textura },
      uCursor: { value: new THREE.Vector2(0.5, 0.5) },
      uForca: { value: 0 },
      uAspecto: { value: 1 },
      uRaio: { value: RAIO_LENTE },
      uSubida: { value: 0 },
      uGaleria: { value: 0 },
      uCurvatura: { value: CURVATURA_DO_PALCO },
      uTempo: { value: 0 },
      uCorFundo: { value: COR_FUNDO_DA_GALERIA },
    },
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const geometria = new THREE.PlaneGeometry(2, 2);
  const tela = new THREE.Mesh(geometria, material);
  tela.frustumCulled = false;
  const cena = new THREE.Scene();
  cena.add(tela);
  return { cena, material, geometria };
}

type TamanhoTela = { width: number; height: number };

function ajustarTamanhoDaComposicao(
  alvo: THREE.WebGLRenderTarget,
  material: THREE.ShaderMaterial,
  tamanho: TamanhoTela,
  pixelRatio: number,
) {
  alvo.setSize(
    Math.max(1, Math.round(tamanho.width * pixelRatio)),
    Math.max(1, Math.round(tamanho.height * pixelRatio)),
  );
  material.uniforms.uAspecto.value = tamanho.width / Math.max(1, tamanho.height);
}

// ============================================================
// 2. LENTE ATRÁS DO PONTEIRO
// Persegue o ponteiro com amortecimento exponencial. Some
// quando o ponteiro sai da janela, quando o rosto se desfaz e
// enquanto a foto ainda não apareceu.
// ============================================================
function acompanharPonteiro(material: THREE.ShaderMaterial, comLente: boolean, delta: number) {
  const uniforms = material.uniforms;
  const fator = calcularFatorDeAmortecimento(RIGIDEZ_LENTE, delta);
  const presenca = 1 - calcularDispersao(estadoCena.saidaHero, estadoCena.voltaContato);
  const lenteLigada = comLente && ponteiroCena.ativo;
  const forcaAlvo = lenteLigada ? presenca * estadoCena.foto : 0;
  const cursor = uniforms.uCursor.value as THREE.Vector2;
  cursor.x += ((ponteiroCena.x + 1) / 2 - cursor.x) * fator;
  cursor.y += ((1 - ponteiroCena.y) / 2 - cursor.y) * fator;
  uniforms.uForca.value += (forcaAlvo - uniforms.uForca.value) * fator;
}

// ============================================================
// 3. FOLHA DO HERO
// Fora da galeria a folha fica parada no lugar e o fundo
// continua transparente.
// ============================================================
function acompanharPalco(material: THREE.ShaderMaterial, tempo: number) {
  const comGaleria = estadoPalco.galeriaNaTela;
  material.uniforms.uGaleria.value = comGaleria ? 1 : 0;
  material.uniforms.uSubida.value = comGaleria ? estadoPalco.subida : 0;
  material.uniforms.uTempo.value = tempo;
  return comGaleria && estadoPalco.subida >= 1;
}

function desenharGaleria(gl: THREE.WebGLRenderer, cena: THREE.Scene, camera: THREE.Camera) {
  const limpezaAutomatica = gl.autoClear;
  gl.autoClear = false;
  camera.layers.set(CAMADA_DA_GALERIA);
  gl.render(cena, camera);
  camera.layers.set(0);
  gl.autoClear = limpezaAutomatica;
}

// ============================================================
// 4. COMPONENTE
// Assume o desenho do quadro (prioridade 1): cena numa textura,
// composição na tela e, por cima, as imagens da galeria e a
// Indústria, a cidade e o beco (camada 1). A cena 3D não é
// desenhada enquanto um ambiente cobre a tela. Montado só sem
// movimento reduzido; a lente depende também de mouse.
// ============================================================
type PropsComposicao = {
  comLente: boolean;
};

export default function ComposicaoCena({ comLente }: PropsComposicao) {
  const tamanho = useThree((estado) => estado.size);
  const pixelRatio = useThree((estado) => estado.viewport.dpr);
  const alvo = useMemo(() => new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false }), []);
  const telaDaComposicao = useMemo(() => criarTelaDaComposicao(alvo.texture), [alvo]);
  const cameraDaTela = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);

  useEffect(() => {
    ajustarTamanhoDaComposicao(alvo, telaDaComposicao.material, tamanho, pixelRatio);
  }, [alvo, telaDaComposicao, tamanho, pixelRatio]);

  useEffect(() => {
    return () => {
      alvo.dispose();
      telaDaComposicao.material.dispose();
      telaDaComposicao.geometria.dispose();
    };
  }, [alvo, telaDaComposicao]);

  useFrame((estado, delta) => {
    const material = telaDaComposicao.material;
    acompanharPonteiro(material, comLente, delta);
    const folhaForaDaTela = acompanharPalco(material, estado.clock.elapsedTime);
    const ambienteCobre = estadoPalco.industriaCobre || estadoPalco.cidadeCobre;
    const cenaEscondida = folhaForaDaTela || ambienteCobre;
    estado.gl.setRenderTarget(alvo);
    estado.gl.clear();
    if (!cenaEscondida) {
      estado.gl.render(estado.scene, estado.camera);
    }
    estado.gl.setRenderTarget(null);
    estado.gl.render(telaDaComposicao.cena, cameraDaTela);
    desenharGaleria(estado.gl, estado.scene, estado.camera);
  }, PRIORIDADE_DEPOIS_DA_CENA);

  return null;
}
