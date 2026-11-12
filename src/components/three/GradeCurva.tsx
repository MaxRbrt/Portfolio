import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { estadoCena } from "./estadoCena";
import { criarLinhasGrade } from "./linhasGrade";

const COLUNAS = 26;
const FILEIRAS = 10;
const SEGMENTOS = 48;

// ============================================================
// 1. SHADER DA GRADE
// As linhas verticais só têm vértice no alto e embaixo, então a
// distância ao meio é calculada pela altura do ponto na tela.
// Acende do meio para as bordas com uma frente mais clara, fica
// mais forte atrás do rosto, some nas bordas e apaga inteira na
// transição. Antes de apagar, as bordas vêm para a frente e se
// abrem (uCurva), e os anéis se curvam com força.
// ============================================================
const verticeGrade = /* glsl */ `
  uniform float uCurva;
  attribute float aLateral;
  varying float vLateral;
  varying float vAltura;

  void main() {
    vLateral = aLateral;
    float puxada = uCurva * aLateral * aLateral;
    vec3 ponto = position;
    ponto.y *= 1.0 + puxada * 0.6;
    ponto.z += puxada * 2.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(ponto, 1.0);
    vAltura = gl_Position.y / gl_Position.w;
  }
`;

const fragmentoGrade = /* glsl */ `
  uniform float uAcendimento;
  uniform float uOpacidade;
  varying float vLateral;
  varying float vAltura;

  void main() {
    float vertical = abs(vAltura);
    float distanciaDoMeio = length(vec2(vLateral * 1.6, vertical * 0.8));
    float alcance = uAcendimento * 1.6;
    float aceso = 1.0 - smoothstep(alcance - 0.2, alcance, distanciaDoMeio);
    float frente = 1.0 - smoothstep(0.0, 0.08, abs(distanciaDoMeio - alcance + 0.1));
    float miolo = mix(1.0, 0.45, smoothstep(0.0, 1.2, distanciaDoMeio));
    float borda = 1.0 - smoothstep(0.75, 1.0, vLateral);
    float alfa = (0.6 * aceso * miolo + 0.4 * frente * (1.0 - uAcendimento)) * borda;
    gl_FragColor = vec4(vec3(0.8, 0.86, 0.92), alfa * uOpacidade);
  }
`;

function criarGeometriaGrade() {
  const linhas = criarLinhasGrade(COLUNAS, FILEIRAS, SEGMENTOS);
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute("position", new THREE.BufferAttribute(linhas.posicoes, 3));
  geometria.setAttribute("aLateral", new THREE.BufferAttribute(linhas.laterais, 1));
  return geometria;
}

function criarMaterialGrade() {
  return new THREE.ShaderMaterial({
    vertexShader: verticeGrade,
    fragmentShader: fragmentoGrade,
    uniforms: {
      uAcendimento: { value: 0 },
      uOpacidade: { value: 1 },
      uCurva: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// ============================================================
// 2. COMPONENTE
// Existe só na abertura: apaga no começo da transição.
// ============================================================
export default function GradeCurva() {
  const linhas = useRef<THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const geometria = useMemo(() => criarGeometriaGrade(), []);
  const material = useMemo(() => criarMaterialGrade(), []);

  useEffect(() => {
    return () => {
      geometria.dispose();
      material.dispose();
    };
  }, [geometria, material]);

  useFrame(() => {
    if (!linhas.current) {
      return;
    }
    const uniforms = linhas.current.material.uniforms;
    uniforms.uAcendimento.value = estadoCena.grade;
    uniforms.uOpacidade.value = 1 - estadoCena.apagarGrade;
    uniforms.uCurva.value = estadoCena.curvaGrade;
    linhas.current.visible = estadoCena.grade > 0 && estadoCena.apagarGrade < 1;
  });

  return (
    <lineSegments
      ref={linhas}
      geometry={geometria}
      material={material}
      frustumCulled={false}
      renderOrder={-1}
    />
  );
}
