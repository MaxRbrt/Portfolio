import { gruposStack } from "../../data/stack";
import { useRevelacaoAoEntrar } from "../../hooks/useRevelacaoAoEntrar";

// ============================================================
// 1. SEÇÃO TECH STACK
// Categorias por tipografia e linha, sem barra de nível.
// ============================================================
export function Stack() {
  const secao = useRevelacaoAoEntrar<HTMLElement>();

  return (
    <section
      ref={secao}
      id="stack"
      tabIndex={-1}
      aria-labelledby="titulo-stack"
      className="stack secao-cinza"
    >
      <div className="stack-conteudo">
        <h2 id="titulo-stack" lang="en" className="titulo-secao">
          <span className="mascara-linha">
            <span className="linha-revelada" data-revelar="mascara">
              Tech Stack.
            </span>
          </span>
        </h2>

        <dl className="stack-grupos">
          {gruposStack.map((grupo) => (
            <div key={grupo.nome} className="stack-grupo" data-revelar="bloco">
              <dt className="stack-nome">{grupo.nome}</dt>
              <dd className="stack-tecnologias">
                <ul>
                  {grupo.tecnologias.map((tecnologia) => (
                    <li key={tecnologia}>{tecnologia}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
