import { trajetoria } from "../../data/trajetoria";

export default function Trajetoria() {
  return (
    <section id="trajetoria" className="faixa trajetoria" aria-labelledby="titulo-trajetoria">
      <div className="miolo">
        <h2 id="titulo-trajetoria" className="texto-titulo" data-revelar>
          Trajetória
        </h2>
        <ol className="trajetoria-lista">
          {trajetoria.map((etapa) => (
            <li key={etapa.titulo} className="trajetoria-etapa" data-surgir>
              <p className="trajetoria-periodo">{etapa.periodo}</p>
              <div>
                <h3 className="trajetoria-titulo">{etapa.titulo}</h3>
                <p className="texto-discreto">{etapa.lugar}</p>
                <p className="trajetoria-descricao">{etapa.descricao}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
