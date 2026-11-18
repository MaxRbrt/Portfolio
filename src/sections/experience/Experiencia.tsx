import { experiencias } from "../../data/experiencias";
import { useRevelacaoAoEntrar } from "../../hooks/useRevelacaoAoEntrar";

// ============================================================
// 1. SEÇÃO EXPERIÊNCIA
// ============================================================
export function Experiencia() {
  const secao = useRevelacaoAoEntrar<HTMLElement>();

  return (
    <section
      ref={secao}
      id="experiencia"
      tabIndex={-1}
      aria-labelledby="titulo-experiencia"
      className="experiencia secao-cinza"
      data-transicao="de-clara"
    >
      <div className="secao-fundo" aria-hidden="true" />
      <div className="experiencia-conteudo">
        <h2 id="titulo-experiencia" className="titulo-secao">
          <span className="mascara-linha">
            <span className="linha-revelada" data-revelar="mascara">
              Experiência.
            </span>
          </span>
        </h2>

        <ol className="experiencia-lista">
          {experiencias.map((experiencia) => (
            <li key={experiencia.organizacao} className="experiencia-item" data-revelar="bloco">
              <p className="experiencia-periodo">{experiencia.periodo}</p>
              <div className="experiencia-cabecalho">
                <h3 className="experiencia-cargo">{experiencia.cargo}</h3>
                <p className="experiencia-organizacao">
                  {experiencia.organizacao}, {experiencia.local}
                </p>
              </div>
              <ul className="experiencia-atividades">
                {experiencia.atividades.map((atividade) => (
                  <li key={atividade}>{atividade}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
