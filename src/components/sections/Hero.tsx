import { perfil } from "../../data/perfil";

export default function Hero() {
  return (
    <section id="inicio" className="faixa hero" aria-labelledby="titulo-hero">
      <div className="miolo hero-miolo">
        <div className="hero-topo">
          <h1 id="titulo-hero" className="hero-nome">
            <span className="linha">Marcos</span> <span className="linha">Roberto</span>
          </h1>
          <p className="hero-cargo">
            {perfil.cargo} · {perfil.cidade}
          </p>
        </div>
        <div className="hero-base">
          <div className="hero-apoio">
            <p className="hero-posicionamento">{perfil.posicionamento}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
