import { textosInterface } from "../../data/interface";
import { perfil } from "../../data/perfil";
import { gruposStack } from "../../data/stack";
import CamadaAmbiente from "./CamadaAmbiente";

// ============================================================
// 1. SEÇÃO SOBRE NA INDÚSTRIA
// A última imagem da galeria cresce e vira a fábrica (canvas).
// O palco fica preso enquanto a câmera avança; o texto no centro
// entra linha a linha: rótulo, parágrafo de abertura em destaque,
// parágrafo de apoio e a stack em linhas.
// ============================================================
function escolherClasseDoResumo(indice: number) {
  return indice === 0 ? "industria-resumo industria-resumo-destaque" : "industria-resumo";
}

export default function Industria() {
  return (
    <section
      id="sobre"
      className="faixa-ambiente industria"
      aria-labelledby="titulo-sobre"
      data-industria=""
    >
      <div className="industria-palco" data-palco-industria>
        <CamadaAmbiente nome="industrial-1" classe="ambiente-camada industria-foto" />
        <CamadaAmbiente nome="industrial-luzes" classe="ambiente-camada-luz industria-foto" />
        <div className="ambiente-veu" aria-hidden="true" />
        <div className="industria-texto" data-linha-sobre>
          <h2 id="titulo-sobre" className="industria-titulo" data-linha-sobre>
            {textosInterface.sobre}
          </h2>
          {perfil.resumoSobre.map((paragrafo, indice) => (
            <p key={paragrafo} className={escolherClasseDoResumo(indice)} data-linha-sobre>
              {paragrafo}
            </p>
          ))}
          <ul className="industria-stack" aria-label={textosInterface.stack}>
            {gruposStack.map((grupo) => (
              <li key={grupo.id} data-linha-sobre>
                <span className="industria-stack-grupo">{grupo.titulo}</span>
                <span className="industria-stack-itens">{grupo.itens.join(" · ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
