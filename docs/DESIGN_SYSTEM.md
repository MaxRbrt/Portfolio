# Design System: preto e branco editorial

Fechado em 2026-11-18 (TASK 02, decisão D08). A base é Minimalist Brutalism, mas os elementos que
parecem template genérico foram cortados (lista em "Proibido").

## Direção

Em uma linha: tipografia monumental em preto e branco, uma cabeça escultórica em primeiro plano e
alternância entre palco escuro e página clara.

O elemento assinatura é a cabeça 3D. Ela acompanha o olhar do visitante no Hero e atravessa o trecho
cinematográfico até o Sobre. Nenhuma outra seção repete esse recurso.

## Paleta (tokens CSS)

| Token | Valor | Uso |
|---|---|---|
| `--color-fundo` | #000000 | palco escuro: Hero, cinemática, contato |
| `--color-fundo-2` | #111111 | fundo secundário escuro: experiência, stack |
| `--color-superficie` | #1A1A1A | superfícies em fundo escuro (placeholder de imagem, botão secundário) |
| `--color-borda` | #333333 | divisor decorativo em fundo escuro |
| `--color-cinza` | #808080 | só decorativo ou texto ≥ 24 px em #000/#111 |
| `--color-texto-2` | #A3A3A3 | texto secundário em fundo escuro |
| `--color-claro` | #F2F2F2 | página clara: Sobre, projetos |
| `--color-branco` | #FFFFFF | texto principal no escuro, superfície no claro |

Texto secundário no fundo claro usa #333333. Não há token novo para isso.

### Contraste (WCAG, calculado em 2026-11-18)

| Texto \ fundo | #000 | #111 | #1A1A1A | #F2F2F2 | #FFF |
|---|---|---|---|---|---|
| #FFFFFF | 21,00 | 18,88 | 17,40 | — | — |
| #A3A3A3 | 8,33 | 7,49 | 6,90 | 2,25 ✗ | 2,52 ✗ |
| #808080 | 5,32 | 4,78 | 4,41 ✗ | 3,53 ✗ | 3,95 ✗ |
| #333333 | 1,66 ✗ | — | — | 11,29 | 12,63 |
| #000000 | — | — | — | 18,76 | 21,00 |

Regras que saem da tabela:

- #808080 nunca sobre #1A1A1A, nem como texto em fundo claro.
- #A3A3A3 só em fundo escuro.
- #333333 como linha sobre preto é decorativo (1,66). Se a linha for necessária para entender a
  interface, como a borda de um campo, usar #808080, que dá 5,32.

## Tipografia

- Principal: **Inter Tight** (OFL), variável, pesos 400 a 900. Fica auto-hospedada, empacotada pelo Vite.
- Apoio: **IBM Plex Mono** (OFL), só 400. Usada apenas em datas, período de experiência e tags de
  tecnologia, em caixa normal. Nada de rótulo mono em caixa alta com tracking largo.
- Títulos de seção: peso 800 a 900, letter-spacing −0,04em a −0,02em, line-height 0,85 a 0,95.
  - H1 do Hero: `clamp(56px, 13vw, 200px)`.
  - H2: `clamp(48px, 9vw, 160px)`.
- H3: `clamp(24px, 3vw, 40px)`, peso 700.
- Corpo: `clamp(15px, 1.1vw, 18px)`, line-height 1,6, largura máxima de 62 caracteres.
- Carregamento: `font-display: swap`. Preload só do arquivo variável da Inter Tight.

## Espaçamento

Escala de 4 e 8 px: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.

- Margem lateral da página: `clamp(20px, 5vw, 64px)`.
- Respiro vertical das seções: `clamp(64px, 12vw, 192px)`.

## Grid e breakpoints

| Faixa | Colunas | A partir de | Gutter |
|---|---|---|---|
| mobile | 4 | 0 | 16 px |
| tablet | 8 | 768 px | 24 px |
| desktop | 12 | 1024 px | 32 px |
| wide | 12, container máx. 1600 px | 1440 px | 32 px |

A assimetria vem de deslocar colunas. Por exemplo, o texto do Sobre começa na coluna 5 e o título
ocupa da 1 à 12. Nada fica em posição solta fora do grid.

## Hierarquia

- Um único H1, no Hero.
- Cada seção tem um H2 monumental. A seção se identifica pelo próprio título; não há rótulo
  "01 / SOBRE".
- H3 por item (projeto, experiência).
- Numeração aparece só onde é informação real: ordem dos projetos em Selected Work, em tamanho
  grande, como parte da composição.

## Formas e linhas

- Linhas só onde separam conteúdo de verdade: entre projetos e entre experiências. Têm 1 px, em
  #333333 no escuro e #000000 com 15% de opacidade no claro. Nada de grade decorativa nem molduras.
- Raios:
  - Botões e links de ação: pílula (9999px).
  - Imagens de projeto: 4 px.
  - Superfícies grandes: 0.

## Estados de interação

- Hover:
  - botão primário inverte (branco ↔ preto);
  - seta desloca 6 px;
  - imagem amplia para 1,03.

  Tudo em 150 a 250 ms, sem mexer no layout.
- Foco: anel de 2 px com offset de 3 px. No escuro é branco, no claro é preto. Sempre visível, também
  dentro do menu.
- Ativo: `translateY(1px)`.
- Desabilitado: opacidade 0,4, com `aria-disabled`.
- Hover nunca é o único caminho para uma informação. `cursor: pointer` em todo elemento clicável.

## Composição

Camadas do Hero:

1. fundo preto com luz cinza suave atrás da cabeça (gradiente radial monocromático);
2. H1 monumental;
3. cabeça 3D à frente, cobrindo parte da metade de baixo do título, mas deixando cada palavra
   legível.

Texto importante nunca vai dentro de imagem ou canvas.

Ritmo entre seções: Hero (preto) → cinemática (preto) → Sobre (claro) → Projetos (claro) →
Experiência (#111) → Stack (#111) → Contato (preto).

## Proibido

- Cor fora da escala de cinza.
- Gradiente colorido, neon, roxo, vidro desfocado, sombra colorida.
- Texto em gradiente.
- Rótulo mono em caixa alta, códigos tipo "FIG. 01" ou "A-01", numeração em tudo.
- Grade milimetrada, linhas finas decorativas, três cartões iguais, ponto "·" como separador.
- Itálico serifado decorativo.
- Ícone decorativo ou emoji como ícone.
- Barra de proficiência.

## Responsividade

- Mobile primeiro.
- Sem overflow horizontal de 320 a 1920 px.
- Alvos de toque de pelo menos 44 px.
- O canvas fica com `pointer-events: none` e nunca cobre um elemento interativo.
- No mobile: cabeça menor e estática, sem parallax pesado, cinemática leve.

## Componentes base

| Componente | Função |
|---|---|
| `Container` | margens e grid |
| `Secao` | variante escura ou clara, define o contraste do header |
| `TituloMonumental` | H1/H2 com máscara de revelação |
| `Botao` | primário e secundário, pílula |
| `LinkSeta` | link com seta que desloca |
| `Divisor` | linha que cresce na horizontal |
| `Etiqueta` | tag mono de tecnologia, caixa normal |
| `Faixa` | marquee opcional da stack |

Todos funcionam no fundo escuro e no claro.
