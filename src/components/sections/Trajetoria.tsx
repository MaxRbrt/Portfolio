import { textosInterface } from "../../data/interface";
import { perfil } from "../../data/perfil";
import { trajetoria } from "../../data/trajetoria";
import CamadaAmbiente from "./CamadaAmbiente";

// ============================================================
// 1. TRAJETÓRIA NO CÂNION
// A cidade (canvas) aparece por baixo da fábrica. No cânion o
// texto fica à esquerda num cartão escuro; depois a câmera entra
// na luz, abre na vista de cima e o bloco vermelho leva ao beco.
// ============================================================
export default function Trajetoria() {
  return (
    <section
      id="trajetoria"
      className="faixa-ambiente cidade"
      aria-labelledby="titulo-trajetoria"
      data-ambiente=""
    >
      <div className="cidade-palco" data-palco-cidade>
        <CamadaAmbiente nome="cidade-1" classe="ambiente-camada cidade-foto" />
        <div className="ambiente-veu" aria-hidden="true" />
        <div className="cidade-texto" data-linha-cidade>
          <h2 id="titulo-trajetoria" className="cidade-titulo" data-linha-cidade>
            {textosInterface.trajetoria}
          </h2>
          <ol className="cidade-lista">
            {trajetoria.map((etapa) => (
              <li key={etapa.titulo} className="cidade-etapa" data-linha-cidade>
                <p className="cidade-periodo">{etapa.periodo}</p>
                <h3 className="cidade-etapa-titulo">{etapa.titulo}</h3>
                <p className="cidade-lugar">{etapa.lugar}</p>
                <p className="cidade-descricao">{etapa.descricao}</p>
              </li>
            ))}
          </ol>
          <a
            className="cidade-saiba-mais"
            href={perfil.linkedin}
            target="_blank"
            rel="noreferrer"
            data-linha-cidade
            data-cursor="LinkedIn"
          >
            {textosInterface.saibaMais}
          </a>
        </div>
      </div>
    </section>
  );
}
