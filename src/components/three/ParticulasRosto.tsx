import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  calcularDispersao,
  calcularOpacidade,
  calcularRecuoCamera,
  estadoCena,
} from "./estadoCena";
import { calcularPesosAnatomicos } from "./pesosAnatomicos";
import {
  calcularFatorDeAmortecimento,
  ponteiroCena,
  usePonteiroCena,
  type PonteiroCena,
} from "./ponteiroCena";
import { fragmentoParticulas, verticeParticulas } from "./shaders";

const GRAUS = Math.PI / 180;
const GIRO_HORIZONTAL_MAXIMO = 8 * GRAUS;
const GIRO_VERTICAL_MAXIMO = 5 * GRAUS;
const RIGIDEZ_MOUSE = 3.5;
const ATRASO_MAXIMO = 0.45;
const DESLOCAMENTO_CAMERA = new THREE.Vector2(0.08, 0.05);
const DISTANCIA_CAMERA = 3;
const ALCANCE_OLHAR_PERTO = 0.35;
const ALCANCE_OLHAR_LONGE = 0.75;
const COLUNAS_DO_ROSTO = 190;
const PONTOS_DO_ROSTO_INTEIRO = 60000;
const COLUNAS_POR_PONTO = 3;
const LARGURA_MINIMA_DA_COLUNA = 2;
const CINZA_MINIMO = 0.3;
const CINZA_FAIXA = 0.62;

const FRACAO_ARTICULACOES = new THREE.Vector3(0.15, 0.3, 0.55);
const PIVO_BASE_CERVICAL = new THREE.Vector3(0, -0.13, -0.08);
const PIVO_MEIO_CERVICAL = new THREE.Vector3(0, -0.05, -0.09);
const PIVO_CRANIO = new THREE.Vector3(0, 0.06, -0.1);

type PropsParticulas = {
  pontos: Float32Array;
  cores: Uint8Array | null;
  seguirMouse: boolean;
  espalhar: boolean;
};

// ============================================================
// 1. COR E CONTORNO DE CADA PONTO
// Com o arquivo de cores: [r, g, b, contorno] em bytes viram
// 0..1. Sem ele: cinza pelo brilho e nenhum contorno.
// ============================================================
function preencherCor(
  cores: Uint8Array | null,
  indice: number,
  brilho: number,
  destinoCor: Float32Array,
  destinoBorda: Float32Array,
) {
  if (!cores) {
    destinoCor.fill(CINZA_MINIMO + brilho * CINZA_FAIXA, indice * 3, indice * 3 + 3);
    return;
  }
  destinoCor[indice * 3] = cores[indice * 4] / 255;
  destinoCor[indice * 3 + 1] = cores[indice * 4 + 1] / 255;
  destinoCor[indice * 3 + 2] = cores[indice * 4 + 2] / 255;
  destinoBorda[indice] = cores[indice * 4 + 3] / 255;
}

// ============================================================
// 2. GEOMETRIA
// Monta posição, direção de saída, cor, contorno, brilho, atraso
// e pesos do pescoço de cada ponto uma vez só.
// ============================================================
function criarGeometria(pontos: Float32Array, cores: Uint8Array | null) {
  const total = pontos.length / 4;
  const alvos = new Float32Array(total * 3);
  const origens = new Float32Array(total * 3);
  const coresDosPontos = new Float32Array(total * 3);
  const bordas = new Float32Array(total);
  const brilhos = new Float32Array(total);
  const atrasos = new Float32Array(total);
  const pesos = new Float32Array(total * 3);

  for (let indice = 0; indice < total; indice += 1) {
    alvos[indice * 3] = pontos[indice * 4];
    alvos[indice * 3 + 1] = pontos[indice * 4 + 1];
    alvos[indice * 3 + 2] = pontos[indice * 4 + 2];
    brilhos[indice] = pontos[indice * 4 + 3];
    preencherCor(cores, indice, brilhos[indice], coresDosPontos, bordas);

    const angulo = Math.random() * Math.PI * 2;
    const inclinacao = Math.acos(Math.random() * 2 - 1);
    const raio = 0.6 + Math.random() * 0.9;
    origens[indice * 3] = raio * Math.sin(inclinacao) * Math.cos(angulo);
    origens[indice * 3 + 1] = raio * Math.sin(inclinacao) * Math.sin(angulo);
    origens[indice * 3 + 2] = raio * Math.cos(inclinacao);
    atrasos[indice] = Math.random() * ATRASO_MAXIMO;

    const pesosDoPonto = calcularPesosAnatomicos(alvos[indice * 3], alvos[indice * 3 + 1]);
    pesos[indice * 3] = pesosDoPonto.baseCervical;
    pesos[indice * 3 + 1] = pesosDoPonto.meioCervical;
    pesos[indice * 3 + 2] = pesosDoPonto.cranio;
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute("position", new THREE.BufferAttribute(alvos, 3));
  geometria.setAttribute("aOrigem", new THREE.BufferAttribute(origens, 3));
  geometria.setAttribute("aCor", new THREE.BufferAttribute(coresDosPontos, 3));
  geometria.setAttribute("aBorda", new THREE.BufferAttribute(bordas, 1));
  geometria.setAttribute("aBrilho", new THREE.BufferAttribute(brilhos, 1));
  geometria.setAttribute("aAtraso", new THREE.BufferAttribute(atrasos, 1));
  geometria.setAttribute("aPesos", new THREE.BufferAttribute(pesos, 3));
  return geometria;
}

function criarMaterial(pixelRatio: number) {
  return new THREE.ShaderMaterial({
    vertexShader: verticeParticulas,
    fragmentShader: fragmentoParticulas,
    uniforms: {
      uMontagem: { value: 0 },
      uLuz: { value: 0 },
      uFoto: { value: 0 },
      uDispersao: { value: 0 },
      uTempo: { value: 0 },
      uOpacidade: { value: 1 },
      uPixelRatio: { value: pixelRatio },
      uTamanho: { value: 0 },
      uColunas: { value: 1 },
      uGiro: { value: new THREE.Vector2() },
      uFracaoArticulacoes: { value: FRACAO_ARTICULACOES },
      uPivoBase: { value: PIVO_BASE_CERVICAL },
      uPivoMeio: { value: PIVO_MEIO_CERVICAL },
      uPivoCranio: { value: PIVO_CRANIO },
      uSurgimento: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
}

// ============================================================
// 3. ENQUADRAMENTO
// Computador: rosto grande no meio da tela, com os ombros saindo
// por baixo, e textos dos lados.
// Celular: rosto centralizado na parte de cima.
// centroTela é o meio do rosto na tela (-1..1, y para baixo), de
// onde a cabeça mede o cursor. A coluna tem um número inteiro de
// pixels físicos, para os traços ficarem todos iguais. Com menos
// pontos (celular) o rosto usa menos colunas, mais largas, para
// não sobrar buraco entre um ponto e outro.
// ============================================================
type Enquadramento = {
  escala: number;
  y: number;
  centroTela: THREE.Vector2;
};

function calcularEnquadramento(largura: number, altura: number): Enquadramento {
  const telaLarga = largura > altura;
  const escala = telaLarga ? altura * 1.24 : Math.min(largura * 1.25, altura * 0.72);
  const y = telaLarga ? altura * -0.038 : altura * 0.16;
  return {
    escala,
    y,
    centroTela: new THREE.Vector2(0, (-y / altura) * 2),
  };
}

function calcularColunasDoRosto(totalDePontos: number) {
  const fracaoDePontos = Math.min(1, totalDePontos / PONTOS_DO_ROSTO_INTEIRO);
  return Math.max(1, Math.round(COLUNAS_DO_ROSTO * Math.sqrt(fracaoDePontos)));
}

function calcularLarguraDaColuna(
  larguraDoRostoEmPixels: number,
  colunasDoRosto: number,
  pixelRatio: number,
) {
  const larguraIdeal = larguraDoRostoEmPixels / colunasDoRosto;
  const pixelsFisicos = Math.max(LARGURA_MINIMA_DA_COLUNA, Math.round(larguraIdeal * pixelRatio));
  return pixelsFisicos / pixelRatio;
}

// ============================================================
// 4. GIRO DA CABEÇA
// A cabeça olha o cursor só quando ele está perto do rosto; longe
// (lendo o texto, por exemplo) ela volta a ficar de frente.
// Persegue o alvo com amortecimento exponencial, igual em 60 ou
// 144 quadros por segundo. Some junto com a saída do rosto.
// ============================================================
function calcularAlvoGiro(ponteiro: PonteiroCena, centroTela: THREE.Vector2, presenca: number) {
  const distanciaX = ponteiro.x - centroTela.x;
  const distanciaY = ponteiro.y - centroTela.y;
  const distancia = Math.hypot(distanciaX, distanciaY);
  const proximidade =
    1 - THREE.MathUtils.smoothstep(distancia, ALCANCE_OLHAR_PERTO, ALCANCE_OLHAR_LONGE);
  const intensidade = ponteiro.ativo ? proximidade * presenca : 0;
  return {
    horizontal: THREE.MathUtils.clamp(distanciaX, -1, 1) * GIRO_HORIZONTAL_MAXIMO * intensidade,
    vertical: THREE.MathUtils.clamp(distanciaY, -1, 1) * GIRO_VERTICAL_MAXIMO * intensidade,
  };
}

function acompanharGiro(
  giro: THREE.Vector2,
  enquadramento: Enquadramento,
  presenca: number,
  delta: number,
) {
  const alvo = calcularAlvoGiro(ponteiroCena, enquadramento.centroTela, presenca);
  const fator = calcularFatorDeAmortecimento(RIGIDEZ_MOUSE, delta);
  giro.x += (alvo.horizontal - giro.x) * fator;
  giro.y += (alvo.vertical - giro.y) * fator;
}

function acompanharCamera(camera: THREE.Camera, delta: number) {
  const fator = calcularFatorDeAmortecimento(RIGIDEZ_MOUSE, delta);
  const alvoX = ponteiroCena.x * DESLOCAMENTO_CAMERA.x;
  const alvoY = -ponteiroCena.y * DESLOCAMENTO_CAMERA.y;
  camera.position.x += (alvoX - camera.position.x) * fator;
  camera.position.y += (alvoY - camera.position.y) * fator;
  camera.lookAt(0, 0, 0);
}

// ============================================================
// 5. COMPONENTE
// O grupo só enquadra. Quem gira é o pescoço, dentro do shader.
// ============================================================
export default function ParticulasRosto({ pontos, cores, seguirMouse, espalhar }: PropsParticulas) {
  const nuvem = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const viewport = useThree((estado) => estado.viewport);
  const pixelRatio = viewport.dpr;

  const geometria = useMemo(() => criarGeometria(pontos, cores), [pontos, cores]);
  const material = useMemo(() => criarMaterial(pixelRatio), [pixelRatio]);
  const colunasDoRosto = calcularColunasDoRosto(pontos.length / 4);
  const enquadramento = calcularEnquadramento(viewport.width, viewport.height);
  usePonteiroCena(seguirMouse);

  useEffect(() => {
    return () => {
      geometria.dispose();
      material.dispose();
    };
  }, [geometria, material]);

  useFrame((estado, delta) => {
    if (!nuvem.current) {
      return;
    }
    const uniforms = nuvem.current.material.uniforms;
    const { montagem, luz, foto, saidaHero, voltaContato, surgimento, recuo } = estadoCena;
    const dispersao = calcularDispersao(saidaHero, voltaContato);
    uniforms.uTempo.value = estado.clock.elapsedTime;
    const larguraDaColuna = calcularLarguraDaColuna(
      enquadramento.escala * viewport.factor,
      colunasDoRosto,
      pixelRatio,
    );
    uniforms.uTamanho.value = larguraDaColuna * COLUNAS_POR_PONTO;
    uniforms.uColunas.value = estado.size.width / (2 * larguraDaColuna);
    uniforms.uMontagem.value = montagem;
    uniforms.uLuz.value = luz;
    uniforms.uFoto.value = foto;
    uniforms.uSurgimento.value = surgimento;
    uniforms.uDispersao.value = espalhar ? dispersao : 0;
    uniforms.uOpacidade.value = calcularOpacidade(saidaHero, voltaContato);
    estado.camera.position.z = DISTANCIA_CAMERA + calcularRecuoCamera(recuo, voltaContato);
    acompanharGiro(uniforms.uGiro.value, enquadramento, 1 - dispersao, delta);
    acompanharCamera(estado.camera, delta);
  });

  return (
    <group position={[0, enquadramento.y, 0]} scale={enquadramento.escala}>
      <points ref={nuvem} geometry={geometria} material={material} frustumCulled={false} />
    </group>
  );
}
