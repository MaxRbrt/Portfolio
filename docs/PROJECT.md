# Projeto

## Visão geral

Portfólio profissional de Marcos Roberto dos Santos Junior, desenvolvedor Full Stack. Single page
landing, aplicação estática, identidade Minimalist Brutalism monocromática, com cabeça 3D em tempo
real e um trecho cinematográfico preso ao scroll. Reconstrução do zero; o site anterior permanece no
histórico do Git (`main` até o commit `7c08401`).

## Objetivos

- Passar conhecimento técnico, criatividade, profissionalismo e cuidado com detalhe.
- Parecer portfólio de desenvolvedor, não landing genérica.
- Qualidade visual de referência criativa sem perder usabilidade, responsividade, manutenção e
  desempenho.

## Público-alvo

Recrutadores e gestores técnicos brasileiros; clientes e desenvolvedores que avaliem o trabalho.

## Escopo

Dentro: uma página com Hero, transição 3D, Sobre, Projetos, Experiência, Stack, Contato e rodapé;
documentação; testes; publicação no GitHub Pages (preparada, não executada sem autorização).

Fora: backend, banco, APIs privadas, formulário de contato com envio, blog, CMS, multi-idioma,
painel administrativo, hospedagem fora do GitHub Pages.

## Estrutura da página

1. Header (identidade à esquerda, navegação à direita, menu fullscreen no mobile)
2. Hero (título monumental, cabeça 3D, CTA, indicador de scroll)
3. Transição cinematográfica (seção fixada, frase "CODE WITH PURPOSE.")
4. Sobre (fundo claro)
5. Selected Work (projetos)
6. Experiência
7. Tech Stack
8. Contato "LET'S TALK." e rodapé

## Requisitos funcionais

- RF01 Navegação por âncoras com indicador de seção ativa.
- RF02 Menu mobile com abrir, fechar, Escape, foco gerenciado e bloqueio de scroll.
- RF03 Cabeça 3D segue o cursor (máx. ~20° horizontal, ~10° vertical), volta ao neutro ao sair.
- RF04 Timeline de scroll reversível ligada ao progresso da seção fixada, não ao scroll total.
- RF05 Projetos com número, nome, categoria, descrição, tecnologias, imagem ou placeholder
  identificado, links reais quando existirem.
- RF06 Botão de copiar e-mail com feedback acessível; retorno ao topo.
- RF07 Todo conteúdo legível sem animação e sem WebGL.

## Requisitos não funcionais

- RNF01 TypeScript strict, ESLint e Prettier sem erro.
- RNF02 Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
  (metas, medir no build de produção). LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms.
- RNF03 WCAG 2.2 AA; um único H1; landmarks semânticos; foco visível.
- RNF04 `prefers-reduced-motion` respeitado.
- RNF05 Sem overflow horizontal de 320 px a 1920 px.
- RNF06 Three.js carregado sob demanda; cena pausada fora da tela; cleanup de recursos.
- RNF07 Funciona com base `/Portfolio/` no GitHub Pages.
