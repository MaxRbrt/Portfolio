import { lazy, Suspense } from "react";
import Navegacao from "./components/layout/Navegacao";
import Rodape from "./components/layout/Rodape";
import Contato from "./components/sections/Contato";
import Hero from "./components/sections/Hero";
import Manifesto from "./components/sections/Manifesto";
import Projetos from "./components/sections/Projetos";
import Sobre from "./components/sections/Sobre";
import Stack from "./components/sections/Stack";
import Trajetoria from "./components/sections/Trajetoria";
import { useMovimentoEditorial } from "./components/motion/useMovimentoEditorial";
import { useRolagemRosto } from "./components/motion/useRolagemRosto";

const CenaRosto = lazy(() => import("./components/three/CenaRosto"));

export default function App() {
  useMovimentoEditorial();
  useRolagemRosto();

  return (
    <>
      <a className="pular" href="#projetos">
        Pular para os projetos
      </a>
      <Suspense fallback={null}>
        <CenaRosto />
      </Suspense>
      <Navegacao />
      <main>
        <Hero />
        <Manifesto />
        <Projetos />
        <Sobre />
        <Stack />
        <Trajetoria />
        <Contato />
      </main>
      <Rodape />
    </>
  );
}
