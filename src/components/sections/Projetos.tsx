import { projetos } from "../../data/projetos";
import PainelProjeto from "./PainelProjeto";

const vitrine = projetos.filter((projeto) => projeto.vitrine);
const outros = projetos.filter((projeto) => !projeto.vitrine);

export default function Projetos() {
  return (
    <section id="projetos" className="faixa faixa-clara projetos" aria-labelledby="titulo-projetos">
      <div className="miolo projetos-cabecalho">
        <h2 id="titulo-projetos" className="texto-titulo" data-revelar>
          Projetos que estão no ar
        </h2>
        <p className="texto-frase">
          <strong>Sistemas usados de verdade.</strong> Da portaria de uma escola a um app de
          reciclagem, cada um resolve um problema que existia antes dele.
        </p>
      </div>
      <div className="galeria" data-galeria>
        <div className="galeria-trilho" data-trilho>
          {vitrine.map((projeto) => (
            <PainelProjeto key={projeto.id} projeto={projeto} />
          ))}
        </div>
      </div>
      <div className="miolo outros">
        <h3 className="outros-titulo">Outros projetos</h3>
        <ul className="outros-lista">
          {outros.map((projeto) => (
            <li key={projeto.id} className="outro">
              <a href={projeto.codigo ?? projeto.site} target="_blank" rel="noreferrer">
                <span className="outro-nome">{projeto.titulo}</span>
                <span className="outro-descricao">{projeto.descricao}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
