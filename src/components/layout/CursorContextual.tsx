import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { useMovimentoReduzido, usePonteiroGrosso } from "../../hooks/useMidia";
import { lerRotuloCursor } from "./rotuloCursor";

gsap.registerPlugin(useGSAP);

type PosicaoDoPonteiro = { x: number; y: number; dentro: boolean };

// ============================================================
// 1. CURSOR CONTEXTUAL
// Círculo com texto que segue o ponteiro sobre elementos com data-cursor.
// O cursor do sistema continua visível; toque e movimento reduzido não usam.
// A cada quadro o elemento sob o ponteiro é relido, para o rótulo
// aparecer e sumir também quando a página rola com o mouse parado.
// ============================================================
export default function CursorContextual() {
  const circuloRef = useRef<HTMLDivElement>(null);
  const [rotulo, setRotulo] = useState<string | null>(null);
  const ponteiroGrosso = usePonteiroGrosso();
  const movimentoReduzido = useMovimentoReduzido();
  const cursorDesativado = ponteiroGrosso || movimentoReduzido;

  useGSAP(
    () => {
      const circulo = circuloRef.current;
      if (cursorDesativado || !circulo) {
        return;
      }
      gsap.set(circulo, { xPercent: -50, yPercent: -50, scale: 0 });
      const moverX = gsap.quickTo(circulo, "x", { duration: 0.35, ease: "power3.out" });
      const moverY = gsap.quickTo(circulo, "y", { duration: 0.35, ease: "power3.out" });
      const ponteiro: PosicaoDoPonteiro = { x: 0, y: 0, dentro: false };
      let rotuloAtual: string | null = null;

      const trocarRotulo = (novoRotulo: string | null) => {
        if (novoRotulo === rotuloAtual) {
          return;
        }
        rotuloAtual = novoRotulo;
        if (novoRotulo) {
          setRotulo(novoRotulo);
        }
        gsap.to(circulo, { scale: novoRotulo ? 1 : 0, duration: 0.25, overwrite: "auto" });
      };

      const acompanharPonteiro = (evento: PointerEvent) => {
        ponteiro.x = evento.clientX;
        ponteiro.y = evento.clientY;
        ponteiro.dentro = true;
        moverX(evento.clientX);
        moverY(evento.clientY);
      };

      const sairDaJanela = () => {
        ponteiro.dentro = false;
      };

      const conferirElementoSobPonteiro = () => {
        const alvo = ponteiro.dentro ? document.elementFromPoint(ponteiro.x, ponteiro.y) : null;
        trocarRotulo(lerRotuloCursor(alvo));
      };

      window.addEventListener("pointermove", acompanharPonteiro);
      document.documentElement.addEventListener("pointerleave", sairDaJanela);
      gsap.ticker.add(conferirElementoSobPonteiro);
      return () => {
        window.removeEventListener("pointermove", acompanharPonteiro);
        document.documentElement.removeEventListener("pointerleave", sairDaJanela);
        gsap.ticker.remove(conferirElementoSobPonteiro);
      };
    },
    { dependencies: [cursorDesativado], scope: circuloRef },
  );

  if (cursorDesativado) {
    return null;
  }

  return (
    <div ref={circuloRef} className="cursor-contextual" aria-hidden="true">
      {rotulo}
    </div>
  );
}
