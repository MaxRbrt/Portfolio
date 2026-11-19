# Backlog

Status: TODO, IN_PROGRESS, REVIEW, DONE, BLOCKED. Toda task de front termina com o protocolo de revisão
visual de `TESTING.md` e registro em `QA_REPORT.md`.

## TASK 00 — Documentação e memória — DONE

- Objetivo: documentação inicial e memória persistente.
- Dependências: nenhuma.
- Subtarefas: inspecionar pasta e Git; criar docs; registrar decisões iniciais.
- Arquivos: `docs/*.md`.
- Aceite: documentos criados, consistentes, com conteúdo útil; nenhum código novo.
- Testes: revisão cruzada de consistência (nomes, caminhos, tasks).

## TASK 01 — Pesquisa e engenharia reversa visual — REVIEW

- Objetivo: observar R01 a R05 no navegador e registrar comportamento.
- Dependências: 00 aprovada pelo usuário.
- Subtarefas: visitar cada referência; copiar prompt se público; screenshots; preencher `REFERENCES.md`.
- Arquivos: `docs/REFERENCES.md`, `docs/ANIMATIONS.md`.
- Aceite: cada referência documentada com comportamento, o que reproduzir, diferenças e limitações.
- Testes: conferir se cada link foi realmente aberto (data e evidência registradas).

## TASK 02 — Design system — DONE

- Objetivo: fechar tokens, tipografia, grid e componentes visuais base.
- Dependências: 01.
- Subtarefas: validar contraste de cada par; escolher e licenciar fontes; definir tokens CSS.
- Arquivos: `docs/DESIGN_SYSTEM.md`, `docs/ASSETS.md`, `src/styles/tokens.css`.
- Aceite: tokens e regras sem ambiguidade; contraste AA conferido.
- Testes: tabela de contraste calculada.

## TASK 03 — Inicialização e arquitetura — DONE

- Objetivo: projeto React + TS + Vite + Tailwind limpo com scripts de qualidade.
- Dependências: 02. Inclui remover o código do site anterior (histórico fica no Git), após autorização.
- Subtarefas: checar versões compatíveis; instalar só o necessário; estrutura de pastas; scripts
  `dev`, `build`, `lint`, `typecheck`, `test`; Prettier e ESLint.
- Arquivos: `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `src/**`.
- Aceite: `typecheck`, `lint`, `test` e `build` passam; página vazia sobe sem erro no console.
- Testes: rodar um comando por vez; abrir a página no navegador.
- Estado: base verificada no navegador. O corte do título provisório em 320 px foi corrigido,
  com regressão conferida em 11 larguras. Evidências em `QA_REPORT.md`.

## TASK 04 — Header e navegação — DONE

- Dependências: 03.
- Subtarefas: header desktop; menu mobile; seção ativa; contraste por seção; foco; Escape; scroll travado.
- Arquivos: `src/components/layout/*`, `src/hooks/useSecaoAtiva.ts`.
- Aceite: todos os links levam à seção; menu acessível por teclado; nada atrás do canvas.
- Testes: Vitest do hook; Playwright de abrir/fechar/Escape; teste manual em 375 e 1440.
- Estado: âncoras reais com títulos provisórios até a entrega das respectivas seções. A sobreposição
  com o canvas será conferida na TASK 05, quando a cena 3D entrar.

## TASK 05 — Hero principal — DONE

- Dependências: 04.
- Subtarefas: composição em camadas; timeline de entrada; busto 3D (`busto-marmore.glb`, ver `ASSETS.md`); cursor; fallback; reduced motion.
- Arquivos: `src/sections/hero/*`, `src/components/three/*`, `src/hooks/useCursorNormalizado.ts`.
- Aceite: H1 legível com modelo sobreposto; rotação dentro dos limites; sem `setState` por frame; sem WebGL funciona.
- Testes: mover cursor, sair da área, reduced motion, WebGL desligado, resize.

## TASK 06 — Transição cinematográfica 3D — DONE

- Dependências: 05.
- Subtarefas: `ScrollTrigger` com pin; timeline 0–20–50–80–100; grupos 3D independentes; versão leve para mobile.
- Arquivos: `src/sections/hero/Cinematica.tsx`, `src/components/three/*`, `src/animation/*`.
- Aceite: reversível, sem salto, sem hijacking, cleanup completo.
- Testes: rolar devagar e rápido, inverter, recarregar no meio, mobile, reduced motion.

## TASK 07 — Sobre — DONE

- Dependências: 06. Conteúdo: `CONTENT.md` (conclusão do curso a confirmar).
- Arquivos: `src/sections/about/*`.
- Aceite: seção clara, hierarquia editorial, conteúdo visível sem animação, sem dado inventado.
- Testes: leitor/DOM sem animação, contraste, 320 px.

## TASK 08 — Selected Work — DONE

- Dependências: 07. Projetos: EduTrack, Recicla Plus, CRM, Prospera Motors (dados a confirmar).
- Arquivos: `src/sections/projects/*`, `src/data/projetos.ts`.
- Aceite: campos completos ou marcados como pendentes; sem projeto em andamento como concluído;
  acessível por toque e teclado.
- Testes: hover e foco; links; imagens com tamanho declarado.

## TASK 09 — Experiência — DONE

- Dependências: 08. Transroni (atividades a confirmar).
- Arquivos: `src/sections/experience/*`, `src/data/experiencias.ts`.
- Aceite: sem métrica inventada, sem dado interno ou confidencial.
- Testes: revisão de conteúdo contra `CONTENT.md`.

## TASK 10 — Tech Stack — DONE

- Dependências: 09.
- Arquivos: `src/sections/stack/*`, `src/data/stack.ts`.
- Aceite: categorias por tipografia e linhas; sem barras de proficiência; faixa opcional respeita reduced motion.
- Testes: foco, reduced motion, 320 px.

## TASK 11 — Contato e rodapé — DONE

- Dependências: 10. Links reais pendentes (e-mail, LinkedIn, currículo).
- Arquivos: `src/sections/contact/*`, `src/data/contato.ts`.
- Aceite: copiar e-mail com feedback `aria-live`; retorno ao topo; sem formulário fictício; sem dependência de API externa.
- Testes: clipboard negado (fallback), teclado.

## TASK 12 — Responsividade e acessibilidade — DONE

- Dependências: 11.
- Subtarefas: matriz de viewports de `TESTING.md`; teclado; foco; contraste; reduced motion; sem WebGL.
- Aceite: sem overflow, sem corte, sem sobreposição; WCAG 2.2 AA verificado.
- Testes: Playwright em todos os viewports; axe; navegação por teclado.
- Estado: matriz de viewports, teclado, menu, movimento reduzido e sem WebGL verificados em
  2026-11-18 (`QA_REPORT.md`). Frase da cinemática corrigida em 2026-11-19: o leitor de tela
  passou a ler "CODE WITH PURPOSE."; Lighthouse de acessibilidade em 100.

## TASK 13 — Performance — IN_PROGRESS

- Dependências: 12.
- Subtarefas: code splitting; imagens e GLB otimizados; DPR adaptativo; pausar cena fora da tela; Lighthouse no build.
- Aceite: metas de `PROJECT.md` (RNF02) medidas e registradas com condições do teste, ou desvios justificados.
- Testes: Lighthouse mobile no `preview`; registro de throttling e viewport.
- Estado: primeira medição registrada (Performance 77, LCP 4,5 s). O LCP é a imagem do busto,
  que só carrega depois do JS. O antivírus da máquina interfere na medição.

## TASK 14 — SEO e metadados — TODO

- Dependências: 13.
- Subtarefas: title, description, Open Graph, favicon, `lang`, imagem de compartilhamento, canonical, `robots.txt`,
  JSON-LD Person só com dados confirmados.
- Aceite: sem placeholder em metadado.
- Testes: inspeção do HTML gerado; validação de Open Graph.
- Estado: o `index.html` atual só tem `title` e `color-scheme`. Faltam description, Open Graph,
  canonical e favicon (o navegador pede `/favicon.ico` e recebe 404).

## TASK 15 — GitHub Pages — DONE

- Dependências: 14.
- Subtarefas: `.github/workflows/deploy.yml` (checkout, Node, `npm ci`, typecheck, lint, test, build, upload, deploy);
  permissões mínimas; `base` correta; documentar Settings > Pages > GitHub Actions.
- Aceite: build com a base de produção abre sem 404 de asset; publicação só com autorização.
- Testes: `vite preview` com a base; checagem de caminhos.
- Observação: repositório atual `MaxRbrt/Portfolio` é de projeto, então base `/Portfolio/`.
- Estado: `.github/workflows/deploy.yml` publica a cada push na `main` (lint, testes, build,
  deploy). Primeiro deploy da versão nova em 2026-11-19, conferido no navegador. Actions em
  versões com Node 24. `dist/index.html` saiu do Git e a branch `fix/github-pages-animations`
  foi apagada (D16).
