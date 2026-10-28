import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { calcularDispersao, calcularOpacidade, estadoCena } from "./estadoCena";
import { PIVO_CABECA_Y, separarRosto, type ParteRosto } from "./separarRosto";
import { fragmentoParticulas, verticeParticulas } from "./shaders";

const GIRO_HORIZONTAL = THREE.MathUtils.degToRad(6);
const GIRO_VERTICAL = THREE.MathUtils.degToRad(4);
const AMORTECIMENTO = 5;
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
function criarGeometria({ pontos, pesos }: ParteRosto, respirar: boolean) {
  const total = pontos.length / 4;
  const alvos = new Float32Array(total * 3);
  const origens = new Float32Array(total * 3);
  const brilhos = new Float32Array(total);
  const atrasos = new Float32Array(total);
  const movimentos = new Float32Array(total).fill(respirar ? 1 : 0);

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
  geometria.setAttribute("aPeso", new THREE.BufferAttribute(pesos, 1));
  geometria.setAttribute("aMovimento", new THREE.BufferAttribute(movimentos, 1));
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
  const cabeca = useRef<THREE.Group>(null);
  const nuvemCorpo = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const viewport = useThree((estado) => estado.viewport);
  const pixelRatio = useThree((estado) => estado.viewport.dpr);

  const partes = useMemo(() => separarRosto(pontos), [pontos]);
  const geometriaCabeca = useMemo(() => criarGeometria(partes.cabeca, espalhar), [partes, espalhar]);
  const geometriaCorpo = useMemo(() => criarGeometria(partes.corpo, false), [partes]);
  const material = useMemo(() => criarMaterial(pixelRatio), [pixelRatio]);
  const enquadramento = calcularEnquadramento(viewport.width, viewport.height);

  useEffect(() => {
    return () => {
      geometriaCabeca.dispose();
      geometriaCorpo.dispose();
      material.dispose();
    };
  }, [geometriaCabeca, geometriaCorpo, material]);

  useEffect(() => {
    if (!seguirMouse) {
      mouse.current = { x: 0, y: 0 };
      return;
    }
    const hero = document.querySelector<HTMLElement>("#inicio");
    if (!hero) {
      return;
    }
    const acompanhar = (evento: PointerEvent) => {
      const area = hero.getBoundingClientRect();
      mouse.current.x = ((evento.clientX - area.left) / area.width) * 2 - 1;
      mouse.current.y = ((evento.clientY - area.top) / area.height) * 2 - 1;
    };
    const soltar = () => {
      mouse.current = { x: 0, y: 0 };
    };
    hero.addEventListener("pointermove", acompanhar, { passive: true });
    hero.addEventListener("pointerleave", soltar);
    window.addEventListener("blur", soltar);
    return () => {
      hero.removeEventListener("pointermove", acompanhar);
      hero.removeEventListener("pointerleave", soltar);
      window.removeEventListener("blur", soltar);
    };
  }, [seguirMouse]);

  useFrame((estado, delta) => {
    if (!cabeca.current || !nuvemCorpo.current) {
      return;
    }
    const uniforms = nuvemCorpo.current.material.uniforms;
    const { montagem, saidaHero, voltaContato } = estadoCena;
    uniforms.uTempo.value = estado.clock.elapsedTime;
    uniforms.uMontagem.value = montagem;
    uniforms.uDispersao.value = espalhar ? calcularDispersao(saidaHero, voltaContato) : 0;
    uniforms.uOpacidade.value = calcularOpacidade(saidaHero, voltaContato);
    const influencia = seguirMouse
      ? Math.max(0, Math.min(1, (montagem - 0.95) * 20)) * (1 - saidaHero) ** 2
      : 0;
    const suavizacao = 1 - Math.exp(-AMORTECIMENTO * delta);
    const giroY = mouse.current.x * GIRO_HORIZONTAL * influencia;
    const giroX = mouse.current.y * GIRO_VERTICAL * influencia;
    cabeca.current.rotation.y += (giroY - cabeca.current.rotation.y) * suavizacao;
    cabeca.current.rotation.x += (giroX - cabeca.current.rotation.x) * suavizacao;
  });

  return (
    <group position={[enquadramento.x, enquadramento.y, 0]} scale={enquadramento.escala}>
      <group name="bodyGroup">
        <points
          ref={nuvemCorpo}
          geometry={geometriaCorpo}
          material={material}
          frustumCulled={false}
        />
      </group>
      <group ref={cabeca} name="headGroup" position={[0, PIVO_CABECA_Y, 0]}>
        <points
          position={[0, -PIVO_CABECA_Y, 0]}
          geometry={geometriaCabeca}
          material={material}
          frustumCulled={false}
        />
      </group>
    </group>
  );
}
