import type { Projeto } from "../../data/projetos";

type PropsPainel = {
  projeto: Projeto;
  primeiro: boolean;
};

// ============================================================
// 1. PROJETO NA COLUNA DA GALERIA
// Cartão com a imagem no meio e ficha ao lado. Cada linha da
// ficha (data-linha-ficha) entra em sequência quando o projeto
// vira o atual do carrossel.
// ============================================================
export default function PainelProjeto({ projeto, primeiro }: PropsPainel) {
  return (
    <article
      id={`projeto-${projeto.id}`}
      className="projeto"
      data-projeto={projeto.id}
      aria-labelledby={`titulo-projeto-${projeto.id}`}
    >
      <a
        className="projeto-quadro"
        href={projeto.site ?? projeto.codigo}
        target="_blank"
        rel="noreferrer"
        tabIndex={-1}
        data-cursor="Ver"
        data-quadro-galeria
      >
        <img
          src={projeto.imagem}
          alt={projeto.descricaoImagem}
          width={1440}
          height={846}
          loading={primeiro ? "eager" : "lazy"}
          decoding="async"
        />
      </a>
      <div className="projeto-ficha">
        <p className="projeto-categoria" data-linha-ficha>
          {projeto.categoria} · {projeto.contexto}
        </p>
        <h3 id={`titulo-projeto-${projeto.id}`} className="projeto-titulo" data-linha-ficha>
          {projeto.titulo}
        </h3>
        <p className="projeto-descricao" data-linha-ficha>
          {projeto.descricao}
        </p>
        <ul className="projeto-tecnologias" aria-label="Tecnologias" data-linha-ficha>
          {projeto.tecnologias.map((tecnologia) => (
            <li key={tecnologia}>{tecnologia}</li>
          ))}
        </ul>
        <div className="projeto-links" data-linha-ficha>
          {projeto.site && (
            <a href={projeto.site} target="_blank" rel="noreferrer">
              Ver site
            </a>
          )}
          {projeto.codigo && (
            <a href={projeto.codigo} target="_blank" rel="noreferrer">
              Ver código
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
