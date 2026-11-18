# Referências

Visitadas no navegador em 2026-11-18 (TASK 01). Os prompts estavam públicos e foram lidos, mas não
foram copiados para o repositório. Aqui ficam só resumos e parâmetros técnicos, com as diferenças
intencionais.

Restrição geral: as referências são estudo de comportamento. Não copiar texto, marca, cor, vídeo,
imagem nem fonte delas. Os vídeos e imagens são de terceiros, ficam num CDN externo e não têm licença
declarada, então nenhum entra no projeto. A identidade do portfólio vale mais que a referência.

## R01 — 3D Character Studio

- Tutorial: https://motionsites.ai/lesson/cursor-tracking-website-with-motionsites
- Demonstração: https://motionsites.ai/?prompt=3d-character-studio
- A busca por "retrofuturist" não retornou nada no dia. O tutorial cita esse nome, mas o template é o
  "3D Character Studio", achado com a busca "character".
- Prompt: público, lido.
- Técnica: um vídeo em tela cheia, sem autoplay, avança e volta conforme o cursor anda na
  horizontal. O deslocamento do mouse vira deslocamento no tempo do vídeo:
  `delta / larguraJanela * 0,8 * duração`. A posição é limitada entre 0 e a duração do vídeo. Um novo
  seek só é pedido depois do evento `seeked` do anterior, para não sobrecarregar.
- Observado: com o cursor no lado esquerdo, o personagem olha para a câmera. Levando o cursor ao
  centro e à direita, a cabeça vira de forma contínua, para um dos lados. O personagem ocupa a metade
  direita da tela e o texto fica à esquerda.
- Também observado: o texto aparece com efeito de máquina de escrever, há um rótulo desfocado acima
  dele e botões em formato de pílula.
- Mobile: não foi verificado. O prompt não define comportamento de toque, e sem `mousemove` o vídeo
  fica parado.
- Uso no portfólio: a cabeça do Hero (ANIM-HERO-03).
- Diferença intencional: no lugar do vídeo, a cabeça é 3D em tempo real. A rotação depende da posição
  absoluta do cursor dentro da seção, e não do deslocamento acumulado. Os limites são ±20° na
  horizontal e ±10° na vertical, com interpolação suave e volta à posição neutra. Ficam de fora a
  máquina de escrever, o desfoque e as pílulas, que não combinam com brutalismo.
- Aproveitado: a ideia de nunca atualizar mais rápido do que o renderizador aguenta. Aqui vale um
  update por frame, feito no loop do R3F.

## R02 — NOVA AI

- Tutorial: https://motionsites.ai/lesson/build-scroll-animated-website-with-ai
- Prompt: público, lido.
- Técnica: um vídeo fixo ao fundo é controlado pelo scroll.
  - O progresso é `scrollY / (alturaDoDocumento - alturaDaJanela)`, entre 0 e 1.
  - Ele é suavizado a cada `requestAnimationFrame`: `suave += (alvo - suave) * 0,12`.
  - Até 90 quadros são extraídos para `ImageBitmap`, com largura máxima de 960 px, e desenhados num
    canvas com a lógica de `object-cover`.
  - Fallback: seek direto no vídeo quando a diferença passa de 0,04 s.
  - DPR limitado a `min(devicePixelRatio, 2)`.
  - Um espaçador de 80vh dá tempo de scroll para a animação acontecer.
- Revelação de blocos: IntersectionObserver com threshold 0,15. O bloco sobe 32 px e vai de
  opacidade 0 a 1 em 700 ms, com atraso escalonado.
- Visual: fundo escuro, rótulos mono em caixa alta com tracking largo, painéis de vidro (que ficam de
  fora daqui).
- Uso no portfólio: lógica de fluidez da ANIM-CINE-01 e das revelações (ANIM-ABOUT-01).
- Diferenças intencionais:
  - O progresso vem da seção fixada, via ScrollTrigger, e não da página inteira.
  - No lugar do vídeo, a cena 3D é reaproveitada do Hero, o que dispensa a extração de quadros.
  - O `scrub` numérico do GSAP (≈0,6 a 1 s) faz o papel do lerp de 0,12.
  - Sem glassmorphism.
  - O DPR máximo de 2 é aproveitado.

## R03 — Lumenvox Atelier

- Tutorial: https://motionsites.ai/lesson/build-animated-website-with-ai
- Prompt: público, lido. É uma landing de imóveis de luxo, com navbar e hero.
- Fonte: Inter Tight, a mesma escolhida aqui. Isso confirma a escolha da TASK 02.
- Técnica de parallax: `useScroll` na própria seção (do início dela até quando ela sai pelo topo)
  mapeado para um deslocamento vertical de 0 a 8%. São quatro camadas:
  - céu ao fundo;
  - título gigante em `clamp(3rem, 14vw, 14rem)`;
  - subtextos;
  - prédio na frente, sobrepondo o título.

  O céu e o prédio se movem e o título fica parado, o que cria a profundidade.
- Menu mobile:
  - Hambúrguer de 3 barras. As barras de cima e de baixo giram ±45° e a do meio some, em 0,3 s com
    curva `[0.25, 0.1, 0.25, 1]`.
  - Overlay em tela cheia.
  - Os links entram com opacidade 0 para 1, sobem 20 px e saem de um desfoque de 4 px. Duração 0,35 s,
    intervalo de 0,06 s entre links, atraso inicial de 0,1 s. A saída inverte a ordem.
  - O scroll da página fica travado enquanto o menu está aberto.
- Uso no portfólio: título monumental com objeto à frente (composição do Hero), ANIM-PARALLAX-01 e
  ANIM-MENU-01.
- Diferenças intencionais:
  - Sem cores da marca, gradiente lilás, `mix-blend-mode` decorativo nem pílula de vidro.
  - Overlay preto sólido.
  - Barras retas.
  - Links entram sem desfoque, só com transform e opacidade, por desempenho.

## R04 — 3D Scroll Website

- Tutorial: https://motionsites.ai/lesson/build-3d-scroll-animated-website-with-ai
- Prompt: não há prompt de site. O tutorial descreve um fluxo de trabalho.
- Conteúdo:
  - Gerar o modelo a partir de 4 vistas (frente, costas e laterais) com uma ferramenta de imagem para 3D.
  - Exportar em GLB com texturas de 1K a 2K.
  - Fixar a página, deixar o scroll levar da cena 1 para a cena 2 e espalhar as letras do título
    para cima.
  - Aplicar tone mapping, que evita o modelo escuro e "lamacento".
- Uso no portfólio: a seção fixada da TASK 06, texturas de 1K a 2K e tone mapping ACES.
- Diferenças intencionais:
  - Só um trecho fica fixado, o resto da página rola normalmente.
  - Nada de letras espalhadas que quebrem a leitura do H1.
  - O modelo de 4 vistas fica como opção para o asset definitivo (ver `ASSETS.md`). Só vale com uma
    imagem de origem própria ou com licença.

## R05 — 3D Portfolio ("Jack")

- Demonstração: https://motionsites.ai/?prompt=3d-jack-portfolio-hero
- Prompt: "Copy prompt" público, lido (13.877 caracteres). "Copy source code" está bloqueado (pago)
  e não foi acessado.
- Composição observada:
  - Nome gigante em caixa alta, com cerca de 17,5vw no desktop e sem quebra de linha, ocupando a
    largura toda no topo.
  - A cabeça 3D fica centralizada, à frente e sobrepondo a metade de baixo do título.
  - No rodapé, à esquerda, uma descrição curta em caixa alta e fonte leve; à direita, o CTA de contato.
  - Navegação com 4 links distribuídos por toda a largura.
- Técnica:
  - A imagem do personagem fica dentro de um efeito "magnético" que acompanha o mouse: área de
    ativação de 150 px, força 3, transição de 0,3 s com o cursor dentro e de 0,6 s ao sair.
  - Entrada escalonada com fade e deslocamento: nav (0 s, y −20), título (0,15 s, y 40), texto
    (0,35 s), botão (0,5 s), retrato (0,6 s, y 30).
  - O título usa texto com gradiente cinza.
- Uso no portfólio:
  - A relação objeto e tipografia do Hero: título monumental atrás e cabeça à frente sobrepondo parte
    dele.
  - A ordem e o ritmo da ANIM-HERO-01.
- Diferenças intencionais:
  - Cabeça escultórica monocromática, não personagem cartoon.
  - Título branco sólido, sem gradiente.
  - Rotação 3D no lugar do deslocamento magnético 2D.
  - Fonte Inter Tight.
- Não verificado: as seções abaixo do hero (Marquee, About, Services, Projects) foram lidas só pelo
  prompt, não observadas.

## Limitações da pesquisa

- Screenshots foram vistas durante a inspeção, mas não salvas em `docs/qa/`, porque essa pasta ainda
  não existe. Novas capturas entram na TASK 03 se forem precisas.
- Os tutoriais não mostram como os templates se comportam no mobile, então nada disso foi verificado.
- Nenhum vídeo, imagem, fonte ou URL de CDN das referências entra no projeto.
