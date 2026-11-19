# Decisões

## D01 — Reconstrução do zero na mesma pasta (2026-11-18)

- Decisão: o novo portfólio substitui o atual na `main`, na pasta `Portfolio`.
- Justificativa: escolha do usuário.
- Alternativas: pasta nova ao lado; branch nova.
- Impacto: o site no ar será trocado quando o novo for publicado. A remoção do código antigo fica para
  o início da TASK 03 (não na TASK 00), para não deixar o repositório quebrado durante a documentação.
  Histórico do Git é o backup (`7c08401`).

## D02 — Notas de trabalho locais fora do Git (2026-11-18)

- Decisão: anotações pessoais de trabalho ficam só na máquina, fora do repositório.
- Impacto: os docs versionados descrevem apenas o projeto.

## D03 — Base do Vite `/Portfolio/` (2026-11-18)

- Decisão: repositório `MaxRbrt/Portfolio` é de projeto, então a URL é `https://maxrbrt.github.io/Portfolio/`.
- Impacto: assets via `import.meta.env.BASE_URL`; testar o build com a mesma base. Revisar se o repositório
  mudar para `MaxRbrt.github.io`.

## D04 — Cabeça 3D procedural provisória (2026-11-18)

- Decisão: sem GLB autorizado, usar geometria procedural e fallback estático autoral.
- Justificativa: não inventar arquivo nem usar asset sem licença.
- Impacto: modelo definitivo registrado como pendente em `ASSETS.md`.

## D05 — GSAP como único dono de scroll-driven (2026-11-18)

- Decisão: GSAP + ScrollTrigger controla timelines e pin. Motion e Lenis só com justificativa nova aqui.
- Justificativa: evitar conflito de dois controladores na mesma propriedade ou no scroll.
- Impacto: ver `ARCHITECTURE.md`.

## D06 — Dois grupos 3D independentes (2026-11-18)

- Decisão: `grupoScroll` (timeline) contém `grupoCursor` (mouse).
- Justificativa: cursor e scroll não disputam a mesma transformação.
- Alternativa: somar rotações num grupo só (mais frágil).

## D07 — Cabeça guiada pela posição do cursor, sem vídeo (2026-11-18)

- Decisão: a rotação da cabeça segue a posição normalizada do cursor dentro da seção. Não usamos
  vídeo nem o deslocamento acumulado do R01.
- Justificativa:
  - Um vídeo de terceiros não tem licença.
  - Com a posição absoluta, a cabeça sempre volta ao neutro.
  - Fica parecido com o "seguir o olhar".
  - Sem o vídeo, não há seek para sobrecarregar a página.
- Alternativa: vídeo navegado pelo cursor, como no R01, com um vídeo próprio. Fica para depois, se o
  modelo 3D não ficar bom.

## D08 — Preto e branco sem os tells de template (2026-11-18)

- Decisão:
  - Fica: preto e branco e tipografia monumental.
  - Saem:
    - rótulos mono em caixa alta;
    - numeração de seção ("01 / SOBRE");
    - linhas finas decorativas;
    - todos os cantos retos.
  - A numeração fica só nos projetos.
  - Botões viram pílula.
- Justificativa: o usuário já tinha rejeitado esses elementos como "cara de IA" em outros trabalhos e
  escolheu esta opção.
- Alternativas:
  - brutalismo literal do briefing;
  - preto e branco com um acento de cor.
- Impacto: substitui as regras de numeração, mono e bordas do briefing original.

## D09 — Fontes por @fontsource (2026-11-18)

- Decisão: instalar `@fontsource-variable/inter-tight` e `@fontsource/ibm-plex-mono` (só o peso 400)
  na TASK 03.
- Justificativa:
  - O Vite empacota os WOFF2 junto com o site, então nada é carregado do Google em tempo de execução.
  - Os pacotes trazem a licença OFL.
  - Dispensa baixar arquivos à mão.
- Alternativa: copiar os WOFF2 do repositório google/fonts para `public/fonts`.

## D10 — Cabeça 3D: modelo pronto antes do procedural (2026-11-18)

- Decisão: na TASK 05, procurar uma cabeça com licença CC0 ou CC-BY (Poly Haven, Kenney, Sketchfab
  CC0) e aplicar material monocromático. Se não houver modelo adequado, usar a procedural da D04.
- Justificativa: o usuário prefere modelo pronto e bonito a geometria feita em código.
- Impacto: toda origem precisa ser registrada em `ASSETS.md`.

## D11 — Alerta do picomatch aceito como risco de desenvolvimento (2026-11-18)

- Situação: o `npm audit` aponta severidade alta no `picomatch` 4.0.7, que entra pelo Vite, pelo
  Vitest e pelo typescript-eslint. Não existe versão corrigida, e a correção sugerida rebaixa o Vite.
- Decisão: manter as versões atuais. O pacote só roda na máquina de desenvolvimento e não vai para
  o site publicado.
- Revisar: quando sair uma versão corrigida, ou na TASK 15.

## D12 — Sem Lenis (2026-11-18)

- Decisão: a cinemática usa a rolagem nativa com ScrollTrigger (`scrub: 0.8`).
- Justificativa: o scrub já suaviza o movimento. A rolagem nativa preserva o teclado, as âncoras e
  o leitor de tela, e não acrescenta dependência.

## D13 — Todos os repositórios no Selected Work (2026-11-18)

- Pedido do autor: listar todos os 18 repositórios do GitHub, inclusive os privados, com imagem de
  qualidade, e a stack completa que aparece neles.
- Decisão: 6 destaques no layout grande, 10 na galeria em duas colunas e 2 só em texto (API Loja
  NX e E-commerce, que precisam de banco para rodar). Numeração contínua de 01 a 18.
- Privado não leva botão "Código"; mostra "Repositório privado" quando não há site.
- Imagens: captura automatizada local em 1440×846 com densidade 2, convertida para WebP em 720,
  1440 e 2880 px com `srcset`. Exceção pontual à regra de navegar só pela extensão, aprovada pelo
  autor. Projeto sem site rodou localmente sem banco e sem gravar dados.

## D14 — Lista recolhida e carrossel no celular (2026-11-18)

- Pedido do autor: tirar a Prospera Motors e não deixar a página extensa.
- Decisão: 17 projetos. A página abre só com os 5 destaques; o botão "Ver mais projetos (+12)"
  mostra os outros 12 e vira "Ver menos" (ajuste pedido pelo autor no mesmo dia).
- Celular (abaixo de 48rem): destaques e "Mais projetos" viram carrosséis de rolagem lateral nativa
  (scroll-snap), com setas e contador. Sem biblioteca de carrossel.

## D15 — Animações de rolagem e interação em quatro etapas (2026-11-18)

- Pedido do autor: mais movimento na rolagem, no nível das referências.
- Decisão, aprovada etapa por etapa:
  1. cinemática em três atos com pin de 300% e cortina circular (ANIM-CINE-01);
  2. títulos letra por letra e troca de tom entre seções (ANIM-TITULO-01, ANIM-TRANSICAO-01);
  3. projetos com máscara e parallax no desktop (ANIM-PROJ-01);
  4. cursor com rótulo, botões magnéticos e e-mail embaralhado (ANIM-CURSOR-01, ANIM-IMA-01,
     ANIM-EMAIL-01).
- Regras mantidas: GSAP único dono (D05), só `transform`, `opacity` e `clip-path`, interação só
  com ponteiro fino e nada com movimento reduzido.
- Impacto: substitui a linha do tempo 0–20–50–80–100 e o pin de 200% da TASK 06.

## D16 — Deploy por GitHub Actions (2026-11-19)

- Situação: o Pages publica pelo modo "workflow", mas o `deploy-pages.yml` saiu na TASK 03 e o
  site continuou na versão antiga.
- Decisão: `.github/workflows/deploy.yml` roda lint, testes e build e publica `dist/` a cada push
  na `main`. Actions em versões com Node 24.
- Limpeza autorizada pelo autor: `dist/index.html` sai do Git (já estava no `.gitignore`) e a
  branch remota `fix/github-pages-animations`, sem commit fora da `main` e com PR já mesclado,
  foi apagada.
