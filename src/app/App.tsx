import { Cabecalho } from "../components/layout/Cabecalho";
import type { SecaoNavegacao } from "../components/layout/Cabecalho";
import { CursorProjeto } from "../components/layout/CursorProjeto";
import { useBotoesMagneticos } from "../hooks/useBotoesMagneticos";
import { Sobre } from "../sections/about/Sobre";
import { Contato } from "../sections/contact/Contato";
import { Experiencia } from "../sections/experience/Experiencia";
import { Cinematica } from "../sections/hero/Cinematica";
import { Projetos } from "../sections/projects/Projetos";
import { Stack } from "../sections/stack/Stack";

// ============================================================
// 1. APLICAÇÃO
// Ordem das seções e tema de cada uma para o cabeçalho.
// ============================================================
const secoesPortfolio = [
  { id: "inicio", rotulo: "Início", tema: "escuro" },
  { id: "sobre", rotulo: "Sobre", tema: "claro" },
  { id: "projetos", rotulo: "Projetos", tema: "claro" },
  { id: "experiencia", rotulo: "Experiência", tema: "escuro" },
  { id: "stack", rotulo: "Tech Stack", tema: "escuro" },
  { id: "contato", rotulo: "Contato", tema: "escuro" },
] as const satisfies readonly SecaoNavegacao[];

export function App() {
  useBotoesMagneticos();

  return (
    <>
      <Cabecalho secoes={secoesPortfolio} />
      <CursorProjeto />
      <main id="conteudo" tabIndex={-1}>
        <Cinematica />
        <Sobre />
        <Projetos />
        <Experiencia />
        <Stack />
        <Contato />
      </main>
    </>
  );
}
