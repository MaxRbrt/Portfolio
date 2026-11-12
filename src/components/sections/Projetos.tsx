import type { CSSProperties } from "react";
import { galeriaProjetos, projetos, type Projeto } from "../../data/projetos";
import PainelProjeto from "./PainelProjeto";

const vitrine = projetos.filter((projeto) => projeto.vitrine);

// ============================================================
// 1. ITEM DA LISTA LATERAL
// Projeto com imagem leva até ele na coluna; sem imagem abre o
// repositório (ou o site) em outra aba.
// ============================================================
function ItemDaLista({ projeto }: { projeto: Projeto }) {
  if (projeto.vitrine) {
    return (
      <li>
        <a href={`#projeto-${projeto.id}`} data-indice-galeria={projeto.id}>
          {projeto.titulo}
        </a>
      </li>
    );
  }
  return (
    <li>
      <a href={projeto.codigo ?? projeto.site} target="_blank" rel="noreferrer">
        {projeto.titulo}
        <span className="projetos-lista-nota">{galeriaProjetos.notaSemImagem}</span>
      </a>
    </li>
  );
}

// ============================================================
// 2. SEÇÃO
// Lista parada à esquerda, palco de cartões no meio. Com WebGL
// as imagens são desenhadas pelo canvas (GaleriaCurva) no lugar
// dos quadros HTML. A quantidade de projetos define a altura da
// seção no carrossel (uma tela por projeto).
// ============================================================
export default function Projetos() {
  const estiloDaSecao = { "--quantidade-projetos": vitrine.length } as CSSProperties;
  return (
    <section
      id="projetos"
      className="faixa projetos"
      aria-labelledby="titulo-projetos"
      data-galeria=""
      style={estiloDaSecao}
    >
      <div className="projetos-lateral" data-lateral-galeria>
        <div className="projetos-lateral-miolo">
          <h2 id="titulo-projetos" className="projetos-titulo">
            {galeriaProjetos.titulo}
          </h2>
          <ol className="projetos-lista">
            {projetos.map((projeto) => (
              <ItemDaLista key={projeto.id} projeto={projeto} />
            ))}
          </ol>
        </div>
      </div>
      <div className="projetos-coluna" data-palco-galeria>
        {vitrine.map((projeto, indice) => (
          <PainelProjeto key={projeto.id} projeto={projeto} primeiro={indice === 0} />
        ))}
      </div>
    </section>
  );
}
