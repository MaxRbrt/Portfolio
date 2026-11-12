import { lazy, Suspense } from "react";
import Carregamento from "./components/abertura/Carregamento";
import { useSequenciaAbertura } from "./components/abertura/useSequenciaAbertura";
import CursorContextual from "./components/layout/CursorContextual";
import Navegacao from "./components/layout/Navegacao";
import Contato from "./components/sections/Contato";
import Hero from "./components/sections/Hero";
import Industria from "./components/sections/Industria";
import Projetos from "./components/sections/Projetos";
import Trajetoria from "./components/sections/Trajetoria";
import { useMovimentoEditorial } from "./components/motion/useMovimentoEditorial";
import { useRolagemGaleria } from "./components/motion/useRolagemGaleria";
import { useRolagemIndustria } from "./components/motion/useRolagemIndustria";
import { useRolagemCidade } from "./components/motion/useRolagemCidade";
import { useNavegacaoComCortina } from "./components/motion/useNavegacaoComCortina";
import { useRolagemSuave } from "./components/motion/useRolagemSuave";
import { useRolagemTransicao } from "./components/motion/useRolagemTransicao";

const CenaRosto = lazy(() => import("./components/three/CenaRosto"));

export default function App() {
  useRolagemSuave();
  useRolagemTransicao();
  useRolagemGaleria();
  useRolagemIndustria();
  useRolagemCidade();
  useMovimentoEditorial();
  useSequenciaAbertura();
  useNavegacaoComCortina();

  return (
    <>
      <a className="pular" href="#projetos">
        Pular para os projetos
      </a>
      <Carregamento />
      <Suspense fallback={null}>
        <CenaRosto />
      </Suspense>
      <Navegacao />
      <CursorContextual />
      <div className="cortina" data-cortina aria-hidden="true" />
      <div id="rolagem-moldura">
        <div id="rolagem-conteudo">
          <main>
            <Hero />
            <Projetos />
            <Industria />
            <Trajetoria />
            <Contato />
          </main>
        </div>
      </div>
    </>
  );
}
