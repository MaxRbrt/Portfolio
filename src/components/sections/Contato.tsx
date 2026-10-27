import { useRef, useState } from "react";
import { perfil } from "../../data/perfil";

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

export default function Contato() {
  const [copiado, setCopiado] = useState(false);
  const emailRef = useRef<HTMLAnchorElement>(null);

  async function copiarEmail() {
    try {
      await navigator.clipboard.writeText(perfil.email);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2400);
    } catch {
      if (emailRef.current) {
        selecionarTexto(emailRef.current);
      }
    }
  }

  return (
    <section id="contato" className="faixa contato" aria-labelledby="titulo-contato">
      <div className="miolo contato-miolo">
        <h2 id="titulo-contato" className="texto-monumental contato-titulo" data-revelar>
          Vamos criar algo?
        </h2>
        <p className="texto-frase">
          <strong>Estou procurando minha primeira vaga.</strong> Respondo rápido por e-mail ou
          LinkedIn.
        </p>
        <div className="contato-email">
          <a ref={emailRef} href={`mailto:${perfil.email}`} className="contato-endereco">
            {perfil.email}
          </a>
          <button className="botao botao-secundario" type="button" onClick={copiarEmail}>
            {copiado ? "E-mail copiado" : "Copiar e-mail"}
          </button>
          <span className="sr-only" aria-live="polite">
            {copiado ? "E-mail copiado para a área de transferência" : ""}
          </span>
        </div>
        <div className="acoes">
          <a className="botao" href={perfil.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a
            className="botao botao-secundario"
            href={perfil.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
