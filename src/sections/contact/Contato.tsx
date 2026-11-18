import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useEffect, useRef, useState } from "react";
import { LinkExterno } from "../../components/ui/LinkExterno";
import { emailContato, redesContato } from "../../data/contato";
import { useRevelacaoAoEntrar } from "../../hooks/useRevelacaoAoEntrar";

type EstadoCopiaEmail = "parado" | "copiado" | "falhou";

const mensagensCopiaEmail: Record<EstadoCopiaEmail, string> = {
  parado: "",
  copiado: "E-mail copiado.",
  falhou: `Não deu para copiar. O e-mail é ${emailContato}.`,
};

const tempoMensagemCopiaMs = 4000;

gsap.registerPlugin(ScrambleTextPlugin);

// ============================================================
// 1. COPIAR E-MAIL
// A área de transferência pode ser negada pelo navegador; nesse
// caso a mensagem mostra o endereço para copiar à mão. Ao
// copiar, o endereço embaralha e volta (ANIM-EMAIL-01).
// ============================================================
function embaralharEmail(linkEmail: HTMLAnchorElement | null) {
  const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!linkEmail || movimentoReduzido) return;

  gsap.to(linkEmail, {
    duration: 0.6,
    ease: "none",
    scrambleText: { text: emailContato, chars: "lowerCase", speed: 0.6 },
  });
}

function useCopiaEmail() {
  const [estado, setEstado] = useState<EstadoCopiaEmail>("parado");
  const temporizador = useRef<number | undefined>(undefined);
  const linkEmail = useRef<HTMLAnchorElement>(null);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  async function copiarEmail() {
    window.clearTimeout(temporizador.current);

    try {
      await navigator.clipboard.writeText(emailContato);
      setEstado("copiado");
      embaralharEmail(linkEmail.current);
    } catch {
      setEstado("falhou");
    }

    temporizador.current = window.setTimeout(() => setEstado("parado"), tempoMensagemCopiaMs);
  }

  return { estado, copiarEmail, linkEmail };
}

// ============================================================
// 2. VOLTAR AO TOPO
// Rolagem suave nativa; com movimento reduzido, salto direto.
// ============================================================
function voltarAoTopo() {
  const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: movimentoReduzido ? "auto" : "smooth" });
  document.getElementById("inicio")?.focus({ preventScroll: true });
}

// ============================================================
// 3. SEÇÃO CONTATO E RODAPÉ
// ============================================================
export function Contato() {
  const secao = useRevelacaoAoEntrar<HTMLElement>();
  const { estado, copiarEmail, linkEmail } = useCopiaEmail();
  const anoAtual = new Date().getFullYear();

  return (
    <section
      ref={secao}
      id="contato"
      tabIndex={-1}
      aria-labelledby="titulo-contato"
      className="contato secao-escura"
      data-transicao="de-cinza"
    >
      <div className="secao-fundo" aria-hidden="true" />
      <div className="contato-conteudo">
        <h2 id="titulo-contato" lang="en" className="titulo-monumental contato-titulo">
          <span className="mascara-linha">
            <span className="linha-revelada" data-revelar="mascara">
              LET&apos;S
            </span>
          </span>
          <span className="mascara-linha">
            <span className="linha-revelada" data-revelar="mascara">
              TALK.
            </span>
          </span>
        </h2>

        <div className="contato-acoes" data-revelar="bloco">
          <p className="contato-chamada">
            Procurando um desenvolvedor júnior para o time? Escreva para mim.
          </p>
          <a ref={linkEmail} className="contato-email" href={`mailto:${emailContato}`}>
            {emailContato}
          </a>
          <div className="contato-botoes">
            <button type="button" className="botao-pilula contato-copiar" onClick={copiarEmail}>
              Copiar e-mail
            </button>
            {redesContato.map((rede) => (
              <LinkExterno key={rede.nome} href={rede.href} className="botao-pilula">
                {rede.nome}
              </LinkExterno>
            ))}
          </div>
          <p className="contato-aviso" aria-live="polite">
            {mensagensCopiaEmail[estado]}
          </p>
        </div>
      </div>

      <footer className="rodape">
        <p>© {anoAtual} Marcos Roberto dos Santos Junior. Taquarituba, SP.</p>
        <button type="button" className="rodape-topo" onClick={voltarAoTopo}>
          Voltar ao topo
          <span className="link-seta" aria-hidden="true">
            ↑
          </span>
        </button>
      </footer>
    </section>
  );
}
