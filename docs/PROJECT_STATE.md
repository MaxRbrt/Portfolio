# Estado do projeto

Atualizado em 2026-11-19.

## Task atual

TASK 12, responsividade e acessibilidade. Status: IN_PROGRESS. Testes feitos; falta a correção
do `aria-label` proibido na frase da cinemática.

## Última task concluída

TASK 11, contato e rodapé. As animações de rolagem e interação (D15) foram aprovadas e enviadas
ao GitHub depois dela.

## Implementações existentes

- Base em `src/app/` e `src/styles/`: tokens, fontes locais (@fontsource) e base `/Portfolio/`.
- Header fixo com seção ativa e tema. No celular, menu em diálogo de tela inteira.
- Hero com busto 3D (R3F, `frameloop="demand"`) que segue o cursor no desktop, com fallback em
  webp.
- `Cinematica.tsx` envolve o Hero:
  - desktop (≥ 64rem): pin por 300% da altura, em três atos (título se desfaz, busto de perfil e
    frase "CODE WITH PURPOSE.", círculo claro que emenda no Sobre);
  - celular e tablet: versão leve sem pin;
  - movimento reduzido: frase estática, sem canvas.
- Sobre, Selected Work (17 projetos: 5 destaques e 12 em "Ver mais"; carrossel no celular),
  Experiência, Tech Stack e Contato com conteúdo real.
- Animações: revelação ao entrar na tela, títulos letra por letra, troca de tom entre seções,
  parallax dos projetos, cursor com rótulo sobre os projetos, botões magnéticos e e-mail embaralhado ao
  copiar. Catálogo em `ANIMATIONS.md`.

## Decisões tomadas

Ver `DECISIONS.md`, decisões D01 a D16.

## Problemas e bloqueios

- `aria-label` proibido no `<p>` da frase da cinemática (SplitText). Correção proposta na
  TASK 12, aguardando aprovação.
- Lighthouse mobile: Performance 77, LCP 4,5 s (imagem do busto depois do JS). TASK 13.
- Sem favicon (404 de `/favicon.ico`), sem description, Open Graph e canonical. TASK 14.
- Commit e publicação precisam de autorização do autor.

## Publicação

TASK 15 concluída em 2026-11-19 (D16). Todo push na `main` publica em
https://maxrbrt.github.io/Portfolio/ pelo `.github/workflows/deploy.yml`.

## Testes executados

Ver `QA_REPORT.md`, seções da TASK 12 e da TASK 13 (medição inicial).

## Próxima ação exata

Com aprovação: aplicar `aria: "hidden"` no `SplitText.create` de `separarLetras`
(`src/sections/hero/Cinematica.tsx`), repetir o Lighthouse e fechar a TASK 12. Depois, TASK 13:
adiantar o carregamento da imagem do busto (preload) e medir de novo.
