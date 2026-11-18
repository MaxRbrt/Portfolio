import type { ReactNode } from "react";

type PropriedadesLinkExterno = {
  readonly href: string;
  readonly className: string;
  readonly children: ReactNode;
};

// ============================================================
// 1. LINK EXTERNO
// Abre em nova aba, avisa o leitor de tela e traz a seta que
// desliza no hover (classe .link-seta em base.css).
// ============================================================
export function LinkExterno({ href, className, children }: PropriedadesLinkExterno) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="link-seta" aria-hidden="true">
        ↗
      </span>
      <span className="texto-leitor">(abre em nova aba)</span>
    </a>
  );
}
