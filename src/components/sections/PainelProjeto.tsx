import type { Projeto } from "../../data/projetos";

type PropsPainel = {
  projeto: Projeto;
};

export default function PainelProjeto({ projeto }: PropsPainel) {
  return (
    <article className="painel" aria-labelledby={`projeto-${projeto.id}`}>
      <div className="painel-imagem">
        <img
          src={projeto.imagem}
          alt={projeto.descricaoImagem}
          width={1440}
          height={846}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="painel-texto">
        <p className="texto-discreto">
          {projeto.categoria} · {projeto.contexto}
        </p>
        <h3 id={`projeto-${projeto.id}`} className="painel-titulo">
          {projeto.titulo}
        </h3>
        <p className="painel-destaque">{projeto.destaque}</p>
        <p className="painel-descricao">{projeto.descricao}</p>
        <ul className="etiquetas" aria-label="Tecnologias">
          {projeto.tecnologias.map((tecnologia) => (
            <li key={tecnologia}>{tecnologia}</li>
          ))}
        </ul>
        <div className="acoes">
          {projeto.site && (
            <a className="botao" href={projeto.site} target="_blank" rel="noreferrer">
              Abrir site
            </a>
          )}
          {projeto.codigo && (
            <a
              className="botao botao-secundario"
              href={projeto.codigo}
              target="_blank"
              rel="noreferrer"
            >
              Ver código
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
