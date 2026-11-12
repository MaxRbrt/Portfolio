import { useRef, useState } from "react";
import { textosInterface } from "../../data/interface";
import { perfil } from "../../data/perfil";
import CamadaAmbiente from "./CamadaAmbiente";

const TEMPO_DO_AVISO_DE_COPIA = 2400;

// ============================================================
// 1. COPIAR E-MAIL
// Usa a área de transferência; se o navegador recusar,
// seleciona o texto do e-mail para o visitante copiar à mão.
// ============================================================
function selecionarTexto(elemento: HTMLElement) {
  const selecao = window.getSelection();
  const faixa = document.createRange();
  faixa.selectNodeContents(elemento);
  selecao?.removeAllRanges();
  selecao?.addRange(faixa);
}

function useCopiaDoEmail() {
  const [copiado, setCopiado] = useState(false);
  const emailRef = useRef<HTMLAnchorElement>(null);

  async function copiarEmail() {
    try {
      await navigator.clipboard.writeText(perfil.email);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), TEMPO_DO_AVISO_DE_COPIA);
    } catch {
      if (emailRef.current) {
        selecionarTexto(emailRef.current);
      }
    }
  }

  return { copiado, emailRef, copiarEmail };
}

// ============================================================
// 2. CONTATO NO BECO
// O vermelho do bloco vira o beco (canvas). Chamada central em
// caixa alta, frase, linha de links e rodapé pequeno embaixo.
// ============================================================
export default function Contato() {
  const { copiado, emailRef, copiarEmail } = useCopiaDoEmail();
  const ano = new Date().getFullYear();
  const [primeiraLinha, segundaLinha] = textosInterface.chamadaContato;

  return (
    <section
      id="contato"
      className="faixa-ambiente beco"
      aria-labelledby="titulo-contato"
      data-ambiente=""
    >
      <div className="beco-palco" data-palco-beco>
        <CamadaAmbiente nome="contato-1" classe="ambiente-camada beco-foto" />
        <CamadaAmbiente nome="contato-faiscas" classe="ambiente-camada-luz beco-foto" />
        <div className="ambiente-veu" aria-hidden="true" />
        <div className="beco-texto" data-linha-beco>
          <h2 id="titulo-contato" className="beco-chamada" data-linha-beco>
            <span>{primeiraLinha}</span>
            <span>{segundaLinha}</span>
          </h2>
          <p className="beco-frase" data-linha-beco>
            {textosInterface.fraseContato}
          </p>
          <ul className="beco-links" data-linha-beco>
            <li>
              <a href={perfil.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={perfil.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a ref={emailRef} href={`mailto:${perfil.email}`}>
                {perfil.email}
              </a>
            </li>
            <li>
              <button className="beco-copiar" type="button" onClick={copiarEmail}>
                {copiado ? textosInterface.emailCopiado : textosInterface.copiarEmail}
              </button>
              <span className="sr-only" aria-live="polite">
                {copiado ? textosInterface.avisoEmailCopiado : ""}
              </span>
            </li>
          </ul>
        </div>
        <footer className="beco-rodape">
          <p>
            © {ano} {perfil.nome}
          </p>
          <p>{textosInterface.rodape}</p>
        </footer>
      </div>
    </section>
  );
}
