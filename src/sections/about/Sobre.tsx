import { useRevelacaoAoEntrar } from "../../hooks/useRevelacaoAoEntrar";

// ============================================================
// 1. SEÇÃO SOBRE
// Textos de docs/CONTENT.md ("Sobre (publicado)").
// ============================================================
export function Sobre() {
  const secao = useRevelacaoAoEntrar<HTMLElement>();

  return (
    <section
      ref={secao}
      id="sobre"
      tabIndex={-1}
      aria-labelledby="titulo-sobre"
      className="sobre secao-clara"
    >
      <div className="sobre-grade">
        <h2 id="titulo-sobre" className="titulo-secao sobre-titulo">
          <span className="mascara-linha">
            <span className="linha-revelada" data-revelar="mascara">
              Sobre.
            </span>
          </span>
        </h2>

        <p className="sobre-abertura" data-revelar="bloco">
          Desenvolvedor full stack em Taquarituba, SP. Construo APIs, telas e automações e busco
          minha primeira vaga como júnior.
        </p>

        <p className="sobre-texto" data-revelar="bloco">
          Hoje sou estagiário de desenvolvimento na Transroni. Crio e mantenho APIs REST em NestJS
          com TypeORM e MySQL, faço telas em React com TypeScript e automatizo processos no n8n,
          integrando APIs e webhooks.
        </p>

        <dl className="sobre-fatos">
          <div className="sobre-fato" data-revelar="bloco">
            <dt>Agora</dt>
            <dd>
              Estágio em desenvolvimento na Transroni
              <span className="sobre-data">desde jul. 2026</span>
            </dd>
          </div>
          <div className="sobre-fato" data-revelar="bloco">
            <dt>Formação</dt>
            <dd>
              Análise e Desenvolvimento de Sistemas, UNEDUVALE (Avaré)
              <span className="sobre-data">conclusão prevista em dez. 2026</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
