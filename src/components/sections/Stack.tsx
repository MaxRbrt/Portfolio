import { gruposStack } from "../../data/stack";

export default function Stack() {
  return (
    <section className="faixa faixa-clara stack" aria-labelledby="titulo-stack">
      <div className="miolo">
        <h2 id="titulo-stack" className="texto-titulo" data-revelar>
          Com o que eu trabalho
        </h2>
        <div className="stack-grade">
          {gruposStack.map((grupo) => (
            <article key={grupo.id} className="stack-grupo">
              <h3 className="stack-titulo">{grupo.titulo}</h3>
              <p className="texto-discreto">{grupo.resumo}</p>
              <ul className="etiquetas" aria-label={`Tecnologias de ${grupo.titulo}`}>
                {grupo.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
