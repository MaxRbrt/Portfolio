import { perfil } from "../../data/perfil";

export default function Manifesto() {
  return (
    <section className="faixa faixa-clara manifesto" aria-label="Manifesto">
      <div className="miolo">
        <p className="texto-monumental manifesto-texto" data-revelar>
          {perfil.manifesto}
        </p>
      </div>
    </section>
  );
}
