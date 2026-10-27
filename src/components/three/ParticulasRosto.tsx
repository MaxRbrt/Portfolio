import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { calcularDispersao, calcularOpacidade, estadoCena } from "./estadoCena";
import { fragmentoParticulas, verticeParticulas } from "./shaders";

const GIRO_MAXIMO = 0.26;
const SUAVIZACAO_MOUSE = 0.06;
const ATRASO_MAXIMO = 0.45;

type PropsParticulas = {
  pontos: Float32Array;
  seguirMouse: boolean;
  espalhar: boolean;
};

// ============================================================
// 1. GEOMETRIA
// Monta alvo, origem, brilho e atraso de cada ponto uma vez só.
// ============================================================
function criarGeometria(pontos: Float32Array) {
  const total = pontos.length / 4;
  const alvos = new Float32Array(total * 3);
  const origens = new Float32Array(total * 3);
  const brilhos = new Float32Array(total);
  const atrasos = new Float32Array(total);

  for (let indice = 0; indice < total; indice += 1) {
    alvos[indice * 3] = pontos[indice * 4];
    alvos[indice * 3 + 1] = pontos[indice * 4 + 1];
    alvos[indice * 3 + 2] = pontos[indice * 4 + 2];
    brilhos[indice] = pontos[indice * 4 + 3];

    const angulo = Math.random() * Math.PI * 2;
    const inclinacao = Math.acos(Math.random() * 2 - 1);
    const raio = 0.6 + Math.random() * 0.9;
    origens[indice * 3] = raio * Math.sin(inclinacao) * Math.cos(angulo);
    origens[indice * 3 + 1] = raio * Math.sin(inclinacao) * Math.sin(angulo);
    origens[indice * 3 + 2] = raio * Math.cos(inclinacao);
    atrasos[indice] = Math.random() * ATRASO_MAXIMO;
  }

  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute("position", new THREE.BufferAttribute(alvos, 3));
  geometria.setAttribute("aOrigem", new THREE.BufferAttribute(origens, 3));
  geometria.setAttribute("aBrilho", new THREE.BufferAttribute(brilhos, 1));
  geometria.setAttribute("aAtraso", new THREE.BufferAttribute(atrasos, 1));
  return geometria;
}

function criarMaterial(pixelRatio: number) {
  return new THREE.ShaderMaterial({
    vertexShader: verticeParticulas,
    fragmentShader: fragmentoParticulas,
    uniforms: {
      uMontagem: { value: 0 },
      uDispersao: { value: 0 },
      uTempo: { value: 0 },
      uOpacidade: { value: 1 },
      uPixelRatio: { value: pixelRatio },
      uTamanho: { value: 4.6 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

// ============================================================
// 2. ENQUADRAMENTO
// Computador: rosto grande à direita, nome embaixo à esquerda.
// Celular: rosto centralizado na parte de cima.
// ============================================================
function calcularEnquadramento(largura: number, altura: number) {
  const telaLarga = largura > altura;
  if (telaLarga) {
    return { escala: altura * 0.9, x: largura * 0.24, y: altura * 0.06 };
  }
  return { escala: Math.min(largura * 1.25, altura * 0.72), x: 0, y: altura * 0.16 };
}

// ============================================================
// 3. COMPONENTE
// ============================================================
export default function ParticulasRosto({ pontos, seguirMouse, espalhar }: PropsParticulas) {
  const grupo = useRef<THREE.Group>(null);
  const nuvem = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const viewport = useThree((estado) => estado.viewport);
  const pixelRatio = useThree((estado) => estado.viewport.dpr);

  const geometria = useMemo(() => criarGeometria(pontos), [pontos]);
  const material = useMemo(() => criarMaterial(pixelRatio), [pixelRatio]);
  const enquadramento = calcularEnquadramento(viewport.width, viewport.height);

  useEffect(() => {
    return () => {
      geometria.dispose();
      material.dispose();
    };
  }, [geometria, material]);

  useEffect(() => {
    if (!seguirMouse) {
      mouse.current = { x: 0, y: 0 };
      return;
    }
    const acompanhar = (evento: PointerEvent) => {
      mouse.current.x = (evento.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (evento.clientY / window.innerHeight) * 2 - 1;
    };
    const soltar = () => {
      mouse.current = { x: 0, y: 0 };
    };
    window.addEventListener("pointermove", acompanhar, { passive: true });
    document.documentElement.addEventListener("pointerleave", soltar);
    return () => {
      window.removeEventListener("pointermove", acompanhar);
      document.documentElement.removeEventListener("pointerleave", soltar);
    };
  }, [seguirMouse]);

  useFrame((estado) => {
    if (!grupo.current || !nuvem.current) {
      return;
    }
    const uniforms = nuvem.current.material.uniforms;
    const { montagem, saidaHero, voltaContato } = estadoCena;
    uniforms.uTempo.value = estado.clock.elapsedTime;
    uniforms.uMontagem.value = montagem;
    uniforms.uDispersao.value = espalhar ? calcularDispersao(saidaHero, voltaContato) : 0;
    uniforms.uOpacidade.value = calcularOpacidade(saidaHero, voltaContato);
    estado.camera.position.z = 3 - saidaHero * (1 - voltaContato) * 0.6;

    const giroY = mouse.current.x * GIRO_MAXIMO;
    const giroX = mouse.current.y * GIRO_MAXIMO * 0.45;
    grupo.current.rotation.y += (giroY - grupo.current.rotation.y) * SUAVIZACAO_MOUSE;
    grupo.current.rotation.x += (giroX - grupo.current.rotation.x) * SUAVIZACAO_MOUSE;
  });

  return (
    <group
      ref={grupo}
      position={[enquadramento.x, enquadramento.y, 0]}
      scale={enquadramento.escala}
    >
      <points ref={nuvem} geometry={geometria} material={material} frustumCulled={false} />
    </group>
  );
}
