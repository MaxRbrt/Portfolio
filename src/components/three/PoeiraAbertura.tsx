import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { estadoCena } from "./estadoCena";

const ALTURA_CAIXA = 3;

type PropsPoeira = {
  quantidade: number;
};

// ============================================================
// 1. SHADER DA POEIRA
// Cada grão sobe devagar, balança de lado e volta por baixo.
// Pisca de leve e some junto com o hero.
// ============================================================
const verticePoeira = /* glsl */ `
  uniform float uTempo;
  uniform float uPixelRatio;
  attribute float aSemente;
  varying float vPiscar;

  void main() {
    vec3 ponto = position;
    float subida = uTempo * (0.025 + aSemente * 0.03);
    ponto.y = mod(ponto.y + subida + ${(ALTURA_CAIXA / 2).toFixed(1)}, ${ALTURA_CAIXA.toFixed(1)})
      - ${(ALTURA_CAIXA / 2).toFixed(1)};
    ponto.x += sin(uTempo * 0.3 + aSemente * 20.0) * 0.06;
    vec4 posicaoNaCamera = modelViewMatrix * vec4(ponto, 1.0);
    gl_Position = projectionMatrix * posicaoNaCamera;
    gl_PointSize = (1.2 + aSemente * 1.6) * uPixelRatio * 3.0 / -posicaoNaCamera.z;
    vPiscar = 0.55 + 0.45 * sin(uTempo * (0.6 + aSemente) + aSemente * 50.0);
  }
`;

const fragmentoPoeira = /* glsl */ `
  uniform float uOpacidade;
  varying float vPiscar;

  void main() {
    float distancia = length(gl_PointCoord - 0.5);
    if (distancia > 0.5) {
      discard;
    }
    float borda = smoothstep(0.5, 0.0, distancia);
    gl_FragColor = vec4(vec3(0.78, 0.84, 0.9), borda * vPiscar * 0.35 * uOpacidade);
  }
`;

function criarGeometriaPoeira(quantidade: number) {
  const posicoes = new Float32Array(quantidade * 3);
  const sementes = new Float32Array(quantidade);
  for (let indice = 0; indice < quantidade; indice += 1) {
    posicoes[indice * 3] = (Math.random() - 0.5) * 6;
    posicoes[indice * 3 + 1] = (Math.random() - 0.5) * ALTURA_CAIXA;
    posicoes[indice * 3 + 2] = -3 + Math.random() * 4.5;
    sementes[indice] = Math.random();
  }
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute("position", new THREE.BufferAttribute(posicoes, 3));
  geometria.setAttribute("aSemente", new THREE.BufferAttribute(sementes, 1));
  return geometria;
}

function criarMaterialPoeira(pixelRatio: number) {
  return new THREE.ShaderMaterial({
    vertexShader: verticePoeira,
    fragmentShader: fragmentoPoeira,
    uniforms: {
      uTempo: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uOpacidade: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// ============================================================
// 2. COMPONENTE
// ============================================================
export default function PoeiraAbertura({ quantidade }: PropsPoeira) {
  const poeira = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const pixelRatio = useThree((estado) => estado.viewport.dpr);
  const geometria = useMemo(() => criarGeometriaPoeira(quantidade), [quantidade]);
  const material = useMemo(() => criarMaterialPoeira(pixelRatio), [pixelRatio]);

  useEffect(() => {
    return () => {
      geometria.dispose();
      material.dispose();
    };
  }, [geometria, material]);

  useFrame((estado) => {
    if (!poeira.current) {
      return;
    }
    const uniforms = poeira.current.material.uniforms;
    uniforms.uTempo.value = estado.clock.elapsedTime;
    uniforms.uOpacidade.value = estadoCena.surgimento * (1 - estadoCena.saidaHero);
    poeira.current.visible = uniforms.uOpacidade.value > 0;
  });

  return <points ref={poeira} geometry={geometria} material={material} frustumCulled={false} />;
}
