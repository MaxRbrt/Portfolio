# Estado do projeto

Atualizado em 2026-11-18.

## Task atual

TASK 07, Sobre. Status: TODO.

## Última task concluída

TASK 06, transição cinematográfica. A TASK 05 (Hero) foi revisada e fechada junto.

## Implementações existentes

- Base em `src/app/` e `src/styles/`: tokens Tailwind e fontes locais. O Vite usa a base
  `/Portfolio/`.
- Header fixo com seção ativa e tema. No celular, menu em diálogo.
- Hero com busto 3D (R3F, `frameloop="demand"`) que segue o cursor no desktop, com fallback em
  webp. A entrada usa GSAP.
- `Cinematica.tsx` envolve o Hero:
  - no desktop, prende a seção por 200% da altura da tela;
  - o título sai e o busto gira por `grupoScroll` (`src/animation/progressoCinematica.ts`);
  - a frase "CODE WITH PURPOSE." entra;
  - no celular, a frase só é revelada, sem pin;
  - com movimento reduzido, a frase fica estática.
- Sobre, Projetos, Experiência, Stack e Contato ainda são placeholders.

## Decisões tomadas

Ver `DECISIONS.md`, decisões D01 a D12.

## Problemas e bloqueios

- Favicon com 404, para a TASK 14.
- Chunk 3D grande e Lighthouse, para a TASK 13.
- Faltam conteúdos, listados em `CONTENT.md`.

## Testes executados

Ver `QA_REPORT.md`, seções da TASK 05 e da TASK 06.

## Próxima ação exata

TASK 07: criar `src/sections/about/` com o conteúdo real de `CONTENT.md`, em seção clara.
