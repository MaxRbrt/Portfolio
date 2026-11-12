import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useState } from "react";
import { informarProgresso, lerAbertura, resolverRosto } from "../abertura/estadoAbertura";
import { useMovimentoReduzido, usePonteiroGrosso } from "../../hooks/useMidia";
import { temWebGL } from "../../hooks/suporteWebGL";
import {
  carregarCoresRosto,
  carregarRosto,
  limitePorDispositivo,
  recortarCores,
  urlRostoEstatico,
} from "./carregarRosto";
import { estadoCena } from "./estadoCena";
import CenaCidade from "./CenaCidade";
import CenaIndustria from "./CenaIndustria";
import ComposicaoCena from "./ComposicaoCena";
import GaleriaCurva from "./GaleriaCurva";
import GradeCurva from "./GradeCurva";
import ParticulasRosto from "./ParticulasRosto";
import PoeiraAbertura from "./PoeiraAbertura";

const DURACAO_MONTAGEM_ATRASADA = 1.6;
const SECOES_COM_ROSTO = "#inicio";
const SECOES_COM_PALCO = "#inicio, #projetos, #sobre, #trajetoria, #contato";
const POEIRA_COMPUTADOR = 360;
const POEIRA_CELULAR = 140;

type RostoCarregado = { pontos: Float32Array; cores: Uint8Array | null };
type EstadoCarga =
  { tipo: "carregando" } | ({ tipo: "pronto" } & RostoCarregado) | { tipo: "estatico" };

// ============================================================
// 1. CARGA DO ROSTO
// Pontos (com a barra de progresso) e cor de cada ponto chegam
// juntos; a cor é recortada no total de pontos lido. Sem o
// arquivo de cores o rosto segue em cinza.
// ============================================================
async function carregarRostoCompleto(limite: number): Promise<RostoCarregado> {
  const [pontos, cores] = await Promise.all([
    carregarRosto(limite, informarProgresso),
    carregarCoresRosto(limite),
  ]);
  const totalDePontos = pontos.length / 4;
  return { pontos, cores: cores && recortarCores(cores, totalDePontos) };
}

// ============================================================
// 2. ROSTO QUE CHEGA DEPOIS DA ABERTURA
// A sequência de entrada desenha o rosto. Se o arquivo chegou
// depois dela (rede lenta), o rosto se desenha sozinho.
// ============================================================
function montarRostoAtrasado(movimentoReduzido: boolean) {
  if (!lerAbertura().concluida) {
    return;
  }
  if (movimentoReduzido) {
    gsap.set(estadoCena, { montagem: 1, surgimento: 1, foto: 1 });
    return;
  }
  gsap.fromTo(
    estadoCena,
    { montagem: 0, surgimento: 0, foto: 0 },
    {
      montagem: 1,
      surgimento: 1,
      foto: 1,
      duration: DURACAO_MONTAGEM_ATRASADA,
      ease: "power1.out",
    },
  );
}

// ============================================================
// 3. PAUSA FORA DA TELA
// Com movimento reduzido, só desenha com o hero na tela. Com o palco, também
// na galeria, na Indústria, na cidade e no contato. No resto o
// canvas está coberto e a placa de vídeo descansa.
// ============================================================
function useRostoVisivel(seletores: string) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const presentes = Array.from(document.querySelectorAll(seletores));
    const naTela = new Set<Element>();
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          naTela.add(entrada.target);
        } else {
          naTela.delete(entrada.target);
        }
      });
      setVisivel(naTela.size > 0);
    });
    presentes.forEach((secao) => observador.observe(secao));
    return () => observador.disconnect();
  }, [seletores]);

  return visivel;
}

// ============================================================
// 4. COMPONENTE
// Canvas fixo atrás da página. Sem WebGL ou com erro no
// arquivo, mostra a imagem parada do rosto em pontos.
// ============================================================
export default function CenaRosto() {
  const movimentoReduzido = useMovimentoReduzido();
  const ponteiroGrosso = usePonteiroGrosso();
  const comLente = !ponteiroGrosso && !movimentoReduzido;
  const comPalco = !movimentoReduzido;
  const ativo = useRostoVisivel(comPalco ? SECOES_COM_PALCO : SECOES_COM_ROSTO);
  const [carga, setCarga] = useState<EstadoCarga>(() =>
    temWebGL() ? { tipo: "carregando" } : { tipo: "estatico" },
  );

  useEffect(() => {
    if (carga.tipo !== "carregando") {
      return;
    }
    let cancelado = false;
    const limite = limitePorDispositivo(window.innerWidth, ponteiroGrosso);
    carregarRostoCompleto(limite)
      .then((rosto) => {
        if (!cancelado) {
          setCarga({ tipo: "pronto", ...rosto });
        }
      })
      .catch((erro: unknown) => {
        console.error(erro);
        if (!cancelado) {
          setCarga({ tipo: "estatico" });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [carga.tipo, ponteiroGrosso]);

  useEffect(() => {
    if (carga.tipo === "carregando") {
      return;
    }
    resolverRosto();
    if (carga.tipo === "pronto") {
      montarRostoAtrasado(movimentoReduzido);
    }
  }, [carga.tipo, movimentoReduzido]);

  return (
    <div className="rosto-fixo" aria-hidden="true">
      {carga.tipo === "estatico" && (
        <img className="rosto-estatico" src={urlRostoEstatico} alt="" decoding="async" />
      )}
      {carga.tipo === "pronto" && (
        <Canvas
          frameloop={ativo ? "always" : "never"}
          dpr={ponteiroGrosso ? 1 : [1, 1.5]}
          camera={{ position: [0, 0, 3], fov: 35, near: 0.1, far: 20 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", () =>
              setCarga({ tipo: "estatico" }),
            );
          }}
        >
          <GradeCurva />
          <PoeiraAbertura quantidade={ponteiroGrosso ? POEIRA_CELULAR : POEIRA_COMPUTADOR} />
          <ParticulasRosto
            pontos={carga.pontos}
            cores={carga.cores}
            seguirMouse={comLente}
            espalhar={!movimentoReduzido}
          />
          {comPalco && <GaleriaCurva />}
          {comPalco && <CenaCidade />}
          {comPalco && <CenaIndustria />}
          {comPalco && <ComposicaoCena comLente={comLente} />}
        </Canvas>
      )}
    </div>
  );
}
