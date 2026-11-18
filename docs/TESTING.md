# Testes

## Estratégia

- Unitário (Vitest): hooks, utilitários, dados tipados, lógica de clamp e interpolação.
- E2E (Playwright): navegação, menu, cursor, scroll, viewports, reduced motion, sem WebGL.
- Validação visual no navegador real: obrigatória após toda task de front. Screenshot estática não
  prova animação; usar capturas sequenciais ou gravação.
- Auditoria: Lighthouse no build de produção; axe para acessibilidade.
- Rodar um comando pesado por vez (typecheck, lint, vitest, build), nunca em paralelo.

## Viewports

1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 375×667, 320 de largura.

## Cenários de interação

Mover o cursor e sair da área; clicar em todos os links; abrir e fechar o menu (clique, Escape, link);
rolar devagar e rápido; inverter a direção; recarregar no meio da página; navegar por Tab; reduced
motion ligado; WebGL indisponível; clipboard negado; redimensionar a janela com a página aberta.

## Protocolo de revisão por task

A. Revisão técnica: diff, typecheck, lint, testes relacionados, imports, cleanup de recursos.
B. Execução real: subir o servidor de dev e abrir no navegador.
C. Inspeção visual: comparar com design system, referências e screenshots anteriores.
D. Interação: executar os cenários acima.
E. Diagnóstico: console, rede (404), promessas rejeitadas, falha WebGL, listeners duplicados.
F. Correção: causa raiz, menor correção, repetir o teste que falhou, checar regressão.
G. Evidências: registrar em `QA_REPORT.md`.

Sem validação visual possível: registrar o bloqueio; a task não vira DONE.

## Métricas

Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. LCP ≤ 2,5 s,
CLS ≤ 0,1, INP ≤ 200 ms (meta). Registrar throttling, viewport e versão. Métrica simulada não é dado de
usuário real.

## Critérios de regressão

Cada task repete os cenários das anteriores que a alteração possa afetar. Animação já validada não é
simplificada sem motivo em `DECISIONS.md`. Screenshots de referência por seção ficam em `docs/qa/`
(a criar na TASK 03). Teste não executado é `NOT RUN`.
