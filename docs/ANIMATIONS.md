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
- Linha do tempo (progresso da seção):
  - 0–20%: textos do Hero saem; modelo muda de posição levemente.
  - 20–50%: rotação progressiva, mudança de escala, luz controlada, transição tipográfica.
  - 50–80%: frase editorial entra; modelo reposiciona para composição final.
  - 80–100%: cena sai; pin é liberado; entrada natural em Sobre.
- Easing: lineares com suavização do progresso (`scrub` numérico ≈0,6–1 s no lugar do lerp 0,12 de R02).
  Duração: pelo scroll. Tone mapping ACES na cena (R04).
- Reverso: obrigatório e simétrico. Desktop: completa. Mobile/dispositivo fraco: versão leve sem pin longo.
- Reduced motion: sem pin; frase aparece estática. Fallback: seções empilhadas normais.
- Aceite: sem scroll hijacking, sem salto, sem sobreposição, limpeza total no unmount.

## ANIM-ABOUT-01 — Revelação do Sobre

- Revelação por linhas (entrada na viewport, como o threshold 0,15 de R02), deslocamento vertical 24 px, máscara nos títulos, linhas que crescem na horizontal.
- Duração 600 a 800 ms, easing `power3.out`, trigger entrada na viewport (início 85%). Reverso: não repete.
- Sem fragmentar caracteres de forma que quebre leitor de tela (usar `aria-label` no bloco ou dividir por linhas).
- Reduced motion: visível direto. Aceite: conteúdo presente no DOM e legível com animação desligada.

## ANIM-WORK-01 — Imagens de projeto

- Máscara de revelação (clip-path) 800 ms, zoom de hover 1 → 1,04 em 400 ms, parallax limitado ≤ 8% vertical.
- Setas deslocam 8 px no hover; mudança de contraste suave. Mobile: sem hover, sem parallax pesado.
- Reduced motion: sem zoom e sem parallax. Aceite: links e informações acessíveis por toque e teclado.

## ANIM-PARALLAX-01 — Parallax vertical

- Camadas tipográficas com movimento até 8% da altura, `scrub`, só transform. Mobile: reduzido ou desligado.

## ANIM-STACK-01 — Faixa de tecnologias (opcional)

- Marquee discreto, CSS ou GSAP, pausa no hover/foco, `aria-hidden` na cópia duplicada.
- Reduced motion: desligada, lista estática.

## ANIM-CONTACT-01 — Contato e retorno ao topo

- Título "LET'S TALK." com máscara; botão copiar e-mail com feedback (`aria-live="polite"`);
  retorno ao topo com rolagem suave nativa. Reduced motion: salto direto.
