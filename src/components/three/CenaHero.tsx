import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Box3, MathUtils, Mesh, MeshStandardMaterial, Vector3 } from "three";
import type { DirectionalLight, Group } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { estadoCinematica, observarProgressoCinematica } from "../../animation/progressoCinematica";
import { useCursorNormalizado } from "../../hooks/useCursorNormalizado";

const modeloBustoHero = `${import.meta.env.BASE_URL}models/busto-marmore.glb`;
const limiteHorizontal = MathUtils.degToRad(20);
const limiteVertical = MathUtils.degToRad(10);
const giroCinematica = MathUtils.degToRad(-75);
const fimGiroCinematica = 0.65;

interface PropriedadesBustoHero {
  secao: RefObject<HTMLElement | null>;
  aoExibir: () => void;
  aoPerderContexto: () => void;
}

// ============================================================
// 1. MODELO E RECURSOS DA CENA
// ============================================================
function liberarBustoHero(modelo: Group) {
  modelo.traverse((objeto) => {
    if (!(objeto instanceof Mesh)) return;

    objeto.geometry.dispose();
    if (!(objeto.material instanceof MeshStandardMaterial)) return;

    const mapaNormal = objeto.material.normalMap;
    const imagem: unknown = mapaNormal?.image;
    mapaNormal?.dispose();
    if (typeof ImageBitmap !== "undefined" && imagem instanceof ImageBitmap) imagem.close();
    objeto.material.dispose();
  });
}

function enquadrarBustoHero(modelo: Group) {
  const caixa = new Box3().setFromObject(modelo);
  const centro = caixa.getCenter(new Vector3());
  const escala = 2.66 / caixa.getSize(new Vector3()).y;
  modelo.scale.setScalar(escala);
  modelo.position.copy(centro.multiplyScalar(-escala));
}

function aproximarRotacao(grupo: Group, alvoX: number, alvoY: number, intervalo: number) {
  const distancia = Math.max(
    Math.abs(grupo.rotation.x - alvoX),
    Math.abs(grupo.rotation.y - alvoY),
  );

  if (distancia < 0.001) {
    grupo.rotation.set(alvoX, alvoY, 0);
    return true;
  }

  grupo.rotation.x = MathUtils.damp(grupo.rotation.x, alvoX, 9, intervalo);
  grupo.rotation.y = MathUtils.damp(grupo.rotation.y, alvoY, 9, intervalo);
  return false;
}

function calcularGiroCinematica(progresso: number) {
  return Math.min(progresso / fimGiroCinematica, 1) * giroCinematica;
}

// ============================================================
// 2. LUZ QUE VARRE O MÁRMORE
// Acompanha o progresso da cinemática: vai da direita para a
// esquerda enquanto o busto gira.
// ============================================================
function LuzVarredura() {
  const luz = useRef<DirectionalLight>(null);

  useFrame(() => {
    if (!luz.current) return;

    const posicaoX = MathUtils.lerp(3, -4, estadoCinematica.progresso);
    luz.current.position.set(posicaoX, 2, -2);
  });

  return <directionalLight ref={luz} position={[3, 2, -2]} intensity={2.4} />;
}

// ============================================================
// 3. BUSTO: CURSOR E ROLAGEM
// ============================================================
function BustoHero({ secao, aoExibir, aoPerderContexto }: PropriedadesBustoHero) {
  const [modelo, definirModelo] = useState<Group | null>(null);
  const grupoCursor = useRef<Group>(null);
  const grupoScroll = useRef<Group>(null);
  const invalidar = useThree((estado) => estado.invalidate);
  const canvas = useThree((estado) => estado.gl.domElement);
  const cursor = useCursorNormalizado(secao, invalidar);

  useEffect(() => {
    const controlador = new AbortController();
    let bustoCarregado: Group | undefined;

    async function carregarBusto() {
      const resposta = await fetch(modeloBustoHero, { signal: controlador.signal });
      if (!resposta.ok) return;

      const arquivo = await resposta.arrayBuffer();
      const { scene } = await new GLTFLoader().parseAsync(arquivo, "");
      if (controlador.signal.aborted) {
        liberarBustoHero(scene);
        return;
      }

      bustoCarregado = scene;
      enquadrarBustoHero(scene);
      definirModelo(scene);
    }

    void carregarBusto().catch(() => {});
    canvas.addEventListener("webglcontextlost", aoPerderContexto);

    return () => {
      controlador.abort();
      canvas.removeEventListener("webglcontextlost", aoPerderContexto);
      if (bustoCarregado) liberarBustoHero(bustoCarregado);
    };
  }, [aoPerderContexto, canvas]);

  useEffect(() => {
    if (!modelo) return;

    invalidar();
    let quadro = requestAnimationFrame(() => {
      quadro = requestAnimationFrame(aoExibir);
    });

    return () => cancelAnimationFrame(quadro);
  }, [aoExibir, invalidar, modelo]);

  useEffect(() => observarProgressoCinematica(invalidar), [invalidar]);

  useFrame((_, delta) => {
    const grupo = grupoCursor.current;
    const scroll = grupoScroll.current;
    if (!grupo || !scroll) return;

    const intervalo = Math.min(delta, 0.05);
    const cursorParado = aproximarRotacao(
      grupo,
      cursor.current.y * limiteVertical,
      cursor.current.x * limiteHorizontal,
      intervalo,
    );
    const scrollParado = aproximarRotacao(
      scroll,
      0,
      calcularGiroCinematica(estadoCinematica.progresso),
      intervalo,
    );

    if (!cursorParado || !scrollParado) invalidar();
  });

  if (!modelo) return null;

  return (
    <group ref={grupoScroll} name="grupoScroll">
      <group ref={grupoCursor} name="grupoCursor">
        <primitive object={modelo} dispose={null} />
      </group>
    </group>
  );
}

// ============================================================
// 4. RENDERIZAÇÃO SOB DEMANDA
// ============================================================
export default function CenaHero({ secao }: Pick<PropriedadesBustoHero, "secao">) {
  const [pronta, definirPronta] = useState(false);
  const [perdeuContexto, definirPerdeuContexto] = useState(false);
  const exibir = useCallback(() => definirPronta(true), []);
  const perderContexto = useCallback(() => definirPerdeuContexto(true), []);

  if (perdeuContexto) return null;

  return (
    <div className="hero-cena" data-pronta={pronta}>
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 35 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[-4, 3, 4]} intensity={2.7} />
        <LuzVarredura />
        <BustoHero secao={secao} aoExibir={exibir} aoPerderContexto={perderContexto} />
      </Canvas>
    </div>
  );
}
