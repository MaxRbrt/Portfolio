import { perfil } from "../../data/perfil";

export default function Hero() {
  return (
    <section id="inicio" className="faixa hero" aria-labelledby="titulo-hero">
      <div className="miolo hero-miolo">
        <p className="texto-discreto hero-local">{perfil.cidade}</p>
        <div className="hero-texto">
          <h1 id="titulo-hero" className="texto-monumental hero-nome">
            <span className="linha">Marcos</span> <span className="linha">Roberto</span>
          </h1>
          <div className="hero-apoio">
            <p className="texto-frase">
              <strong>{perfil.cargo}.</strong> {perfil.posicionamento}
            </p>
            <div className="acoes">
              <a className="botao" href="#projetos">
                Ver projetos
              </a>
              <a
                className="botao botao-secundario"
                href={perfil.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <p className="texto-discreto hero-dica" aria-hidden="true">
          Role para descer
        </p>
      </div>
    </section>
  );
}
