import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { LinkExterno } from "../../components/ui/LinkExterno";
import {
  dimensaoImagemProjeto,
  montarSrcImagemProjeto,
  montarSrcsetImagemProjeto,
  projetosDestaque,
  projetosGaleria,
  projetosSemImagem,
} from "../../data/projetos";
import type { Projeto, ProjetoComImagem } from "../../data/projetos";
import { useMovimentoProjetos } from "../../hooks/useMovimentoProjetos";
import { useRevelacaoAoEntrar } from "../../hooks/useRevelacaoAoEntrar";
import { CarrosselProjetos } from "./CarrosselProjetos";

type PropsItemProjeto<T extends Projeto> = {
  readonly projeto: T;
  readonly ordem: number;
};

const tamanhosImagemDestaque = "(min-width: 64rem) 50vw, (min-width: 48rem) 100vw, 80vw";
const tamanhosImagemGaleria = "(min-width: 48rem) 50vw, 80vw";
const inicioGaleria = projetosDestaque.length;
const inicioSemImagem = inicioGaleria + projetosGaleria.length;
const totalMaisProjetos = projetosGaleria.length + projetosSemImagem.length;
const idListaDestaque = "lista-projetos-destaque";
const idListaMais = "lista-mais-projetos";
const idBlocoMais = "bloco-mais-projetos";

// ============================================================
// 1. PEÇAS COMPARTILHADAS
// Número grande é a ordem real da lista (DESIGN_SYSTEM.md).
// ============================================================
function formatarOrdemProjeto(ordem: number) {
  return String(ordem).padStart(2, "0");
}

function montarIdTituloProjeto(nome: string) {
  return `projeto-${nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

type PropsImagemProjeto = {
  readonly projeto: ProjetoComImagem;
  readonly tamanhos: string;
  readonly revelarSozinha: boolean;
};

function FotoProjeto({ projeto, tamanhos }: Omit<PropsImagemProjeto, "revelarSozinha">) {
  return (
    <img
      src={montarSrcImagemProjeto(projeto.imagem)}
      srcSet={montarSrcsetImagemProjeto(projeto.imagem)}
      sizes={tamanhos}
      alt={`Captura de tela do projeto ${projeto.nome}`}
      width={dimensaoImagemProjeto.largura}
      height={dimensaoImagemProjeto.altura}
      loading="lazy"
      decoding="async"
    />
  );
}

// ============================================================
// 2. IMAGEM DO PROJETO
// Com site ou código, a imagem leva ao mesmo destino do botão.
// Fica fora do Tab (os botões já cobrem o teclado) e o cursor
// mostra para onde vai. revelarSozinha=false deixa a animação
// com useMovimentoProjetos.
// ============================================================
function ImagemProjeto({ projeto, tamanhos, revelarSozinha }: PropsImagemProjeto) {
  const destino = projeto.site ?? projeto.codigo;
  const rotuloCursor = projeto.site ? "Ver site" : "Código";
  const revelar = revelarSozinha ? "imagem" : undefined;

  if (!destino) {
    return (
      <div className="projeto-imagem" data-revelar={revelar}>
        <FotoProjeto projeto={projeto} tamanhos={tamanhos} />
      </div>
    );
  }

  return (
    <a
      className="projeto-imagem"
      href={destino}
      target="_blank"
      rel="noreferrer"
      tabIndex={-1}
      aria-hidden="true"
      data-revelar={revelar}
      data-cursor={rotuloCursor}
    >
      <FotoProjeto projeto={projeto} tamanhos={tamanhos} />
    </a>
  );
}

function ListaStackProjeto({ projeto }: { projeto: Projeto }) {
  return (
    <ul className="lista-tags" aria-label={`Tecnologias do ${projeto.nome}`}>
      {projeto.stack.map((tecnologia) => (
        <li key={tecnologia}>{tecnologia}</li>
      ))}
    </ul>
  );
}

function LinksProjeto({ projeto }: { projeto: Projeto }) {
  const temLink = Boolean(projeto.site || projeto.codigo);

  if (!temLink) {
    return <p className="projeto-privado">Repositório privado</p>;
  }

  return (
    <div className="projeto-links">
      {projeto.site && (
        <LinkExterno href={projeto.site} className="botao-pilula projeto-link-site">
          Ver site<span className="texto-leitor"> do {projeto.nome}</span>
        </LinkExterno>
      )}
      {projeto.codigo && (
        <LinkExterno href={projeto.codigo} className="botao-pilula">
          Código<span className="texto-leitor"> do {projeto.nome}</span>
        </LinkExterno>
      )}
    </div>
  );
}

// ============================================================
// 3. PROJETO EM DESTAQUE
// ============================================================
function ItemProjetoDestaque({ projeto, ordem }: PropsItemProjeto<ProjetoComImagem>) {
  const idTitulo = montarIdTituloProjeto(projeto.nome);

  return (
    <li className="projeto">
      <article className="projeto-artigo" aria-labelledby={idTitulo}>
        <span className="projeto-numero" aria-hidden="true">
          {formatarOrdemProjeto(ordem)}
        </span>
        <ImagemProjeto projeto={projeto} tamanhos={tamanhosImagemDestaque} revelarSozinha={false} />
        <div className="projeto-info">
          <p className="projeto-categoria">{projeto.categoria}</p>
          <h3 id={idTitulo} className="projeto-nome">
            {projeto.nome}
          </h3>
          <p className="projeto-descricao">{projeto.descricao}</p>
          <ListaStackProjeto projeto={projeto} />
          <LinksProjeto projeto={projeto} />
        </div>
      </article>
    </li>
  );
}

// ============================================================
// 4. PROJETO DA GALERIA
// ============================================================
function ItemProjetoGaleria({ projeto, ordem }: PropsItemProjeto<ProjetoComImagem>) {
  const idTitulo = montarIdTituloProjeto(projeto.nome);

  return (
    <li className="galeria-item">
      <article className="galeria-artigo" aria-labelledby={idTitulo} tabIndex={-1}>
        <ImagemProjeto projeto={projeto} tamanhos={tamanhosImagemGaleria} revelarSozinha />
        <div className="galeria-info" data-revelar="bloco">
          <div className="galeria-cabecalho">
            <span className="galeria-numero" aria-hidden="true">
              {formatarOrdemProjeto(ordem)}
            </span>
            <h4 id={idTitulo} className="galeria-nome">
              {projeto.nome}
            </h4>
            <p className="projeto-categoria">{projeto.categoria}</p>
          </div>
          <p className="projeto-descricao">{projeto.descricao}</p>
          <ListaStackProjeto projeto={projeto} />
          <LinksProjeto projeto={projeto} />
        </div>
      </article>
    </li>
  );
}

// ============================================================
// 5. PROJETO SEM IMAGEM
// ============================================================
function ItemProjetoSemImagem({ projeto, ordem }: PropsItemProjeto<Projeto>) {
  const idTitulo = montarIdTituloProjeto(projeto.nome);

  return (
    <li className="texto-item">
      <article className="texto-artigo" aria-labelledby={idTitulo} tabIndex={-1}>
        <span className="galeria-numero" aria-hidden="true">
          {formatarOrdemProjeto(ordem)}
        </span>
        <div className="texto-info">
          <h4 id={idTitulo} className="galeria-nome">
            {projeto.nome}
          </h4>
          <p className="projeto-categoria">{projeto.categoria}</p>
          <p className="projeto-descricao">{projeto.descricao}</p>
          <ListaStackProjeto projeto={projeto} />
        </div>
        <LinksProjeto projeto={projeto} />
      </article>
    </li>
  );
}

// ============================================================
// 6. VER MAIS PROJETOS
// A página abre só com os 5 destaques; o botão mostra o resto
// (desktop e celular). Ao abrir, o foco vai para o primeiro
// projeto novo; ao fechar, a tela volta para o botão.
// ============================================================
function useListaExpansivel() {
  const [expandido, setExpandido] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const acaoPendente = useRef<"abriu" | "fechou" | null>(null);

  useEffect(() => {
    ScrollTrigger.refresh();

    const acao = acaoPendente.current;
    acaoPendente.current = null;

    if (acao === "abriu") {
      const primeiroNovo = document.querySelector<HTMLElement>(`#${idListaMais} > li article`);
      primeiroNovo?.focus();
      return;
    }

    if (acao === "fechou") {
      botao.current?.scrollIntoView({ block: "center" });
    }
  }, [expandido]);

  function alternarExpansao() {
    acaoPendente.current = expandido ? "fechou" : "abriu";
    setExpandido(!expandido);
  }

  return { expandido, botao, alternarExpansao };
}

// ============================================================
// 7. SEÇÃO SELECTED WORK
// ============================================================
export function Projetos() {
  const secao = useRevelacaoAoEntrar<HTMLElement>();
  useMovimentoProjetos(secao);
  const { expandido, botao, alternarExpansao } = useListaExpansivel();

  return (
    <section
      ref={secao}
      id="projetos"
      tabIndex={-1}
      aria-labelledby="titulo-projetos"
      className="projetos secao-clara"
    >
      <div className="projetos-conteudo">
        <h2 id="titulo-projetos" lang="en" className="titulo-secao">
          <span className="mascara-linha">
            <span className="linha-revelada" data-revelar="mascara">
              Selected
            </span>
          </span>
          <span className="mascara-linha">
            <span className="linha-revelada" data-revelar="mascara">
              Work.
            </span>
          </span>
        </h2>

        <CarrosselProjetos
          idLista={idListaDestaque}
          classeLista="projetos-lista"
          rotulo="Projetos em destaque"
          inicio={1}
          total={projetosDestaque.length}
        >
          {projetosDestaque.map((projeto, indice) => (
            <ItemProjetoDestaque key={projeto.nome} projeto={projeto} ordem={indice + 1} />
          ))}
        </CarrosselProjetos>

        <div className="projetos-mais">
          <div id={idBlocoMais} hidden={!expandido}>
            <h3 className="projetos-mais-titulo">Mais projetos</h3>
            <CarrosselProjetos
              idLista={idListaMais}
              classeLista="galeria-lista"
              rotulo="Mais projetos"
              inicio={inicioGaleria + 1}
              total={totalMaisProjetos}
            >
              {projetosGaleria.map((projeto, indice) => (
                <ItemProjetoGaleria
                  key={projeto.nome}
                  projeto={projeto}
                  ordem={inicioGaleria + indice + 1}
                />
              ))}
              {projetosSemImagem.map((projeto, indice) => (
                <ItemProjetoSemImagem
                  key={projeto.nome}
                  projeto={projeto}
                  ordem={inicioSemImagem + indice + 1}
                />
              ))}
            </CarrosselProjetos>
          </div>
          <button
            ref={botao}
            type="button"
            className="botao-pilula projetos-ver-mais"
            aria-expanded={expandido}
            aria-controls={idBlocoMais}
            onClick={alternarExpansao}
          >
            {expandido ? "Ver menos" : `Ver mais projetos (+${totalMaisProjetos})`}
          </button>
        </div>
      </div>
    </section>
  );
}
