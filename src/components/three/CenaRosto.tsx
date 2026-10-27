import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useState } from "react";
import { useMovimentoReduzido, usePonteiroGrosso } from "../../hooks/useMidia";
import { temWebGL } from "../../hooks/suporteWebGL";
import { carregarRosto, limitePorDispositivo, urlRostoEstatico } from "./carregarRosto";
import { estadoCena } from "./estadoCena";
import ParticulasRosto from "./ParticulasRosto";

const DURACAO_MONTAGEM = 2.2;
const SECOES_COM_ROSTO = ["#inicio", "#contato"];

type EstadoCarga =
  { tipo: "carregando" } | { tipo: "pronto"; pontos: Float32Array } | { tipo: "estatico" };

// ============================================================
// 1. ENTRADA DO ROSTO
// Com "reduzir movimento" o rosto já aparece formado.
// ============================================================
function montarRosto(movimentoReduzido: boolean) {
  if (movimentoReduzido) {
    estadoCena.montagem = 1;
    return;
  }
  gsap.fromTo(
    estadoCena,
    { montagem: 0 },
    { montagem: 1, duration: DURACAO_MONTAGEM, ease: "none", delay: 0.15 },
  );
}

// ============================================================
// 2. PAUSA FORA DA TELA
// Só desenha quando o hero ou o contato aparecem; no resto da
// página o rosto está coberto e a placa de vídeo descansa.
// ============================================================
function useRostoVisivel() {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const secoes = SECOES_COM_ROSTO.map((seletor) => document.querySelector(seletor));
    const presentes = secoes.filter((secao): secao is Element => secao !== null);
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
  }, []);

  return visivel;
}

// ============================================================
// 3. COMPONENTE
// Canvas fixo atrás da página. Sem WebGL ou com erro no
// arquivo, mostra a imagem parada do rosto em pontos.
// ============================================================
export default function CenaRosto() {
  const movimentoReduzido = useMovimentoReduzido();
  const ativo = useRostoVisivel();
  const ponteiroGrosso = usePonteiroGrosso();
  const [carga, setCarga] = useState<EstadoCarga>(() =>
    temWebGL() ? { tipo: "carregando" } : { tipo: "estatico" },
  );

  useEffect(() => {
    if (carga.tipo !== "carregando") {
      return;
    }
    let cancelado = false;
    const limite = limitePorDispositivo(window.innerWidth, ponteiroGrosso);
    carregarRosto(limite)
      .then((pontos) => {
        if (!cancelado) {
          setCarga({ tipo: "pronto", pontos });
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
    if (carga.tipo === "pronto") {
      montarRosto(movimentoReduzido);
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
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 3], fov: 35, near: 0.1, far: 20 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", () =>
              setCarga({ tipo: "estatico" }),
            );
          }}
        >
          <ParticulasRosto
            pontos={carga.pontos}
            seguirMouse={!ponteiroGrosso && !movimentoReduzido}
            espalhar={!movimentoReduzido}
          />
        </Canvas>
      )}
    </div>
  );
}
