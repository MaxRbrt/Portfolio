import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

const midiaCursorProjeto =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

// ============================================================
// 1. CÍRCULO QUE SEGUE O PONTEIRO (ANIM-CURSOR-01)
// Aparece sobre qualquer elemento com data-cursor e mostra o
// texto do atributo. Fora deles, encolhe e some.
// ============================================================
function seguirPonteiroSobreProjetos(cursor: HTMLElement, trocarRotulo: (rotulo: string) => void) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0.9, opacity: 0 });

  const moverX = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
  const moverY = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
  let alvoAtual: HTMLElement | null = null;

  function mostrarCursor(alvo: HTMLElement) {
    trocarRotulo(alvo.dataset.cursor ?? "");
    gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.25, ease: "power3.out" });
  }

  function esconderCursor() {
    gsap.to(cursor, { scale: 0.9, opacity: 0, duration: 0.2, ease: "power3.out" });
  }

  function acompanharPonteiro(evento: PointerEvent) {
    moverX(evento.clientX);
    moverY(evento.clientY);

    const elementoSobPonteiro = evento.target instanceof Element ? evento.target : null;
    const alvo = elementoSobPonteiro?.closest<HTMLElement>("[data-cursor]") ?? null;
    if (alvo === alvoAtual) return;

    alvoAtual = alvo;
    if (alvo) {
      mostrarCursor(alvo);
      return;
    }

    esconderCursor();
  }

  window.addEventListener("pointermove", acompanharPonteiro, { passive: true });

  return () => window.removeEventListener("pointermove", acompanharPonteiro);
}

export function CursorProjeto() {
  const cursor = useRef<HTMLDivElement>(null);
  const [rotulo, setRotulo] = useState("");

  useEffect(() => {
    const elementoCursor = cursor.current;
    if (!elementoCursor) return;

    const preferencias = gsap.matchMedia();
    preferencias.add(midiaCursorProjeto, () =>
      seguirPonteiroSobreProjetos(elementoCursor, setRotulo),
    );

    return () => {
      preferencias.revert();
    };
  }, []);

  return (
    <div ref={cursor} className="cursor-projeto" aria-hidden="true">
      {rotulo}
    </div>
  );
}
