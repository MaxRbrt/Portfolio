import { perfil } from "../../data/perfil";

export default function Sobre() {
  const [primeiroParagrafo, ...demaisParagrafos] = perfil.sobre;

  return (
    <section id="sobre" className="faixa faixa-clara sobre" aria-labelledby="titulo-sobre">
      <div className="miolo sobre-grade">
        <h2 id="titulo-sobre" className="texto-titulo sobre-titulo" data-revelar>
          Sobre mim
        </h2>
        <img
          className="sobre-foto"
          src={perfil.foto}
          alt={`Foto de ${perfil.nome}`}
          width={192}
          height={192}
          loading="lazy"
        />
        <div className="sobre-texto">
          <p className="texto-frase">
            <strong>{primeiroParagrafo}</strong>
          </p>
          {demaisParagrafos.map((paragrafo) => (
            <p key={paragrafo} className="texto-frase">
              {paragrafo}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
