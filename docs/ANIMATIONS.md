# Catálogo de animações

Valores são metas iniciais, a calibrar na TASK da seção. Regras gerais:

- Só `transform` e `opacity` no DOM. GSAP único dono de scroll e timelines.
- Reduced motion: sem movimento; estado final visível, no máximo fade curto (≤ 150 ms).
- Fallback geral: se a animação falhar, o conteúdo fica visível e legível.
- Scroll reverso: toda animação ligada a scroll usa `scrub` e inverte sozinha.
- Aceite geral: sem salto, sem erro no console, conteúdo legível com animação desligada.

Pela D08, nenhuma animação usa rótulo de seção numerado. Os "separadores" só aparecem onde há
`Divisor` real, entre projetos e entre experiências.

## ANIM-MENU-01 — Menu mobile

- Seção: header. Objetivo: abrir overlay fullscreen com links em sequência.
- Elementos: botão Menu, diálogo em tela inteira, botão Fechar e links. Propriedades: `transform`
  e `opacity` nos links.
- Entrada por ponteiro: links sobem 8 px e passam de 75% a 100% de opacidade em 180 ms, com
  20 ms entre itens e curva `--ease-saida`. Teclado e movimento reduzido abrem sem animação.
- Escape, botão Fechar ou seleção de link fecham imediatamente. A rolagem da página fica
  bloqueada enquanto o menu está aberto. No desktop, a navegação é exibida no cabeçalho.
- Foco: vai ao primeiro link ao abrir. Ao fechar pelo botão ou Escape, volta ao acionador.
  Ao escolher um link, o foco vai para a seção de destino.

## ANIM-HERO-01 — Entrada do Hero

- Objetivo: revelar título, nome, modelo, CTA em até ~1,5 s sem bloquear conteúdo.
- Elementos: linhas do H1 (máscara), nome, subtítulo, CTA, indicador. Propriedades: transform, opacity, clip-path.
- Inicial: linhas 100% abaixo da máscara, opacidade 0. Final: posição natural, opacidade 1.
- Duração: total ≤ 1,5 s, 80 a 120 ms entre linhas. Easing: `expo.out`. Trigger: primeiro paint.
- Ordem (ritmo de R05): header 0 s, título 0,15 s, descrição 0,35 s, CTA 0,5 s, modelo 0,6 s.
- Reverso: n/a (executa uma vez). Mobile: igual, distâncias menores. Reduced motion: estado final direto.
- Fallback: texto visível sem JS. Aceite: LCP não piora; H1 legível durante e depois.

## ANIM-HERO-02 — Entrada do modelo

- Objetivo: entrada suave da cabeça 3D por último. Propriedades: opacidade do canvas, escala 0,96 → 1.
- Duração: ~900 ms, easing `power2.out`, começa após o título. Mobile: composição estática.
- Reduced motion: modelo parado, sem entrada. Fallback: imagem estática. Aceite: sem flash de canvas vazio.

## ANIM-HERO-03 — Cabeça segue o cursor

- Objetivo: rotação responsiva ao cursor. Elemento: `grupoCursor`. Propriedades: rotation.x/y.
- Estado: neutro (0,0); limite ±20° (y) e ±10° (x). Interpolação por frame (lerp, fator ~0,08, a calibrar).
- Trigger: `pointermove` na seção Hero, coordenadas normalizadas em ref. Sai do cursor: volta ao neutro.
- Scroll reverso: n/a. Desktop: completa. Mobile: estática ou leve por scroll. Reduced motion: parado.
- Fallback: sem WebGL, imagem estática. Aceite: sem `setState` por frame; sem giro instantâneo.

## ANIM-CINE-01 — Seção cinematográfica fixada

- Objetivo: ligar Hero → Sobre numa seção fixada com `ScrollTrigger` (`pin`, `scrub`).
- Elementos: textos do Hero, `grupoScroll`, luzes, frase "CODE WITH PURPOSE.".
- Implementado em `src/sections/hero/Cinematica.tsx` (D15). Pin de 300% da altura, `scrub: 0.8`,
  a partir de 64rem:
  - Ato 1 (0–30%): letras do título voam em ordem aleatória; o busto aproxima.
  - Ato 2 (30–65%): o busto vai de perfil para a direita; a frase entra letra por letra.
  - Ato 3 (65–100%): a frase cresce para 1,1; o busto recua; um círculo claro nasce do ponto
    final de "PURPOSE." e cobre o palco, emendando no Sobre. A partir de 90% o cabeçalho troca
    para o tema claro.
- Abaixo de 64rem: sem pin; o título se desfaz e o busto recua enquanto o Hero sai; as letras da
  frase sobem com a rolagem.
- Reverso: simétrico, pelo `scrub`. Reduced motion: sem pin, frase estática.
- Risco anotado (QA, TASK 12): na escala 1,1 a frase passa 67 px da borda direita em 1440 px. O
  `overflow-x: clip` do `body` corta e o usuário não rola na horizontal.
- Aceite: sem scroll hijacking, sem salto, sem sobreposição, limpeza total no unmount.

## ANIM-ABOUT-01 — Revelação ao entrar na tela

- Implementado em `src/hooks/useRevelacaoAoEntrar.ts`, usado em todas as seções depois do Hero.
- Marcação no HTML: `data-revelar="bloco"` sobe 24 px e aparece (700 ms); `"imagem"` abre a
  máscara de baixo para cima (800 ms); `"mascara"` usa a ANIM-TITULO-01.
- Easing `power3.out`, início em `top 85%`, uma vez só.
- Reduced motion: nenhuma media query do GSAP casa e o conteúdo já está visível no DOM.

## ANIM-TITULO-01 — Títulos letra por letra

- SplitText em palavras e letras, com `aria: "none"`; as letras sobem de dentro da máscara
  (`yPercent` 115, rotação 6°, 900 ms, `power4.out`, 20 ms entre letras).
- No fim, o SplitText é desfeito para o leitor de tela ler a linha inteira.

## ANIM-TRANSICAO-01 — Troca de tom entre seções

- Seção com `data-transicao`: o fundo próprio (`.secao-fundo`) entra como cartão arredondado
  (`inset(6% 3% 0% 3% round 2rem)`) e abre até a borda com a rolagem (`scrub: 0.6`).

## ANIM-WORK-01 — Imagens de projeto

- Máscara de revelação (clip-path) 800 ms, zoom de hover 1 → 1,04 em 400 ms, parallax limitado ≤ 8% vertical.
- Setas deslocam 8 px no hover; mudança de contraste suave. Mobile: sem hover, sem parallax pesado.
- Reduced motion: sem zoom e sem parallax. Aceite: links e informações acessíveis por toque e teclado.

## ANIM-PROJ-01 — Projetos em destaque (implementado)

- `src/hooks/useMovimentoProjetos.ts`. Desktop (≥ 64rem): a imagem abre de
  `inset(12% 8% 12% 8%)` até a borda; a foto (escala 1,16) desliza de −8% a 8%; o número sobe de
  30% a −30%; os detalhes sobem 32 px com 70 ms entre si.
- Abaixo de 64rem: sem parallax; a imagem abre de baixo e os detalhes sobem.
- Reduced motion: nada animado.

## ANIM-CURSOR-01 — Cursor com rótulo sobre os projetos

- `src/components/layout/CursorProjeto.tsx`. Círculo de 88 px que segue o ponteiro (`quickTo`,
  350 ms) e mostra o texto de `data-cursor`. Só com `(hover: hover) and (pointer: fine)` e sem
  movimento reduzido; fora disso, `display: none`.

## ANIM-IMA-01 — Botões pílula magnéticos

- `src/hooks/useBotoesMagneticos.ts`. A pílula anda 30% da distância até o ponteiro (400 ms) e
  volta com `elastic.out(1, 0.45)` ao sair. Mesma condição de ponteiro fino e sem movimento
  reduzido.

## ANIM-EMAIL-01 — E-mail embaralhado ao copiar

- `src/sections/contact/Contato.tsx`. Depois de copiar, o endereço embaralha e volta
  (ScrambleText, 600 ms). Com movimento reduzido, não embaralha.

## ANIM-PARALLAX-01 — Parallax vertical

- Camadas tipográficas com movimento até 8% da altura, `scrub`, só transform. Mobile: reduzido ou desligado.

## ANIM-STACK-01 — Faixa de tecnologias (opcional)

- Marquee discreto, CSS ou GSAP, pausa no hover/foco, `aria-hidden` na cópia duplicada.
- Reduced motion: desligada, lista estática.

## ANIM-CONTACT-01 — Contato e retorno ao topo

- Título "LET'S TALK." com máscara; botão copiar e-mail com feedback (`aria-live="polite"`);
  retorno ao topo com rolagem suave nativa. Reduced motion: salto direto.
