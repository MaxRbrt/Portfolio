# Redesign cinematográfico do portfólio

Data: 12/11/2026, revisado no mesmo dia para **fidelidade ao vídeo**. Referência visual: vídeo de
18 s guardado fora do repositório (descrição quadro a quadro na seção 2). Imagens dos ambientes em
`references/ambientes/` (fora do git).

Itens marcados **[decisão minha]** foram escolhidos por quem escreveu este documento e podem ser
revistos.

## 1. Intenção

O Marcos pediu: "refaz tudo fiel ao vídeo, abertura também". O vídeo deixa de ser inspiração e
passa a ser o roteiro: mesma ordem de cenas, mesma composição de tela, mesmos efeitos. Muda só o
conteúdo, que continua sendo o dele (nome, projetos, textos de `src/data/`).

A versão anterior (fases 3 a 5) ficou "parecida" com o vídeo: rosto em pontos, galeria horizontal
plana. Este documento troca isso pelo que o vídeo mostra de fato.

### Objetivos

- Cada cena do vídeo reproduzida na mesma ordem, com a mesma composição e o mesmo tipo de efeito.
- Rolagem como "câmera": nenhuma troca seca de seção; uma cena vira a próxima.
- Continuar só com fatos reais do Marcos.
- Metas de qualidade mantidas: Lighthouse Performance 90+, Acessibilidade/Boas práticas/SEO 95+,
  LCP até 2,5 s, INP até 200 ms, CLS até 0,1.

### Não objetivos

- Copiar o conteúdo do dono do vídeo (nome, textos, imagens dos projetos dele).
- Biblioteca nova de 3D ou animação, backend, formulário, página por projeto.

### Antiobjetivos

- Dados inventados: métrica, cliente, funcionalidade ou contato que não exista.
- Informação interna da Transroni além do que já está em `perfil.ts`/`trajetoria.ts`.
- Celular recebendo o desktop espremido.
- Ficar "parecido" de novo: se uma cena não sair como no vídeo, avisar em vez de entregar outra
  coisa.

## 2. O vídeo, quadro a quadro

| Tempo | Cena |
|---|---|
| 0–1,2 s | Tela preta. No centro, "LOADING" pequeno com uma barra fina embaixo |
| 1,3 s | Acende uma grade curva em volta (linhas verticais que se curvam como o lado de dentro de um cilindro, mais horizontais). A cabeça aparece só como contorno e linhas verticais claras, ciano esbranquiçado, como scanner |
| 1,9 s | O miolo da cabeça enche de luz branca. Entram os textos: nome pequeno no canto superior esquerdo, nome grande à esquerda no meio com subtítulo, parágrafo curto à direita no meio, navegação no canto superior direito |
| 2,6 s | A luz vira a foto real do rosto, ainda riscada por linhas verticais. Em volta do cursor, uma lente redonda com separação de cores (vermelho/azul) deforma a imagem |
| 3,5 s | Início da rolagem: a grade entorta mais, o rosto se deforma e se desfaz em lascas/partículas |
| 3,7–8,6 s | Fundo off-white. "SELECTED WORK" fixo à esquerda no meio, com a lista dos projetos embaixo (o atual marcado). Imagens dos projetos sobem numa coluna central e se curvam nas bordas de cima e de baixo, como numa tela de tubo (CRT). Rolagem rápida separa as cores. Uma imagem cresce até quase a tela cheia e o conteúdo dela vira a cena |
| 9,4–10,4 s | Linha de produção industrial vista de cima, câmera andando para frente. Bloco de texto pequeno no canto inferior esquerdo ("about") |
| 11,2–12,2 s | Cânion de prédios azul, luz branca forte no fundo do meio. Bloco de texto à esquerda entre colchetes, com "saiba mais" |
| 13,2 s | Vista de cima da cidade azul à noite, câmera descendo; um risco vermelho no meio |
| 14 s | Um bloco vermelho iluminado no centro cresce; pedaços da cidade voam para fora em volta |
| 14,8–17,6 s | Beco vermelho em tela cheia. "LET'S TALK ABOUT / YOUR NEXT PROJECT" em branco, centralizado; frase pequena embaixo; linha de links; rodapé pequeno no centro de baixo. No fim a imagem se desfaz em ruído vermelho |

Tipografia do vídeo: tudo em caixa alta, fonte estreita e fina, letras espaçadas; o nome e a
chamada do contato maiores e mais pesados.

## 3. Restrições

- Stack atual mantida: Vite 8, React 19, TypeScript, React Three Fiber 9, three 0.186, GSAP 3.15
  (ScrollTrigger, SplitText, ScrollSmoother), `@gsap/react`, anime.js só no que já usa, CSS
  próprio com tokens em `global.css`. Nenhuma dependência nova.
- Deploy no GitHub Pages pelo CI, base path do Pages.
- Conteúdo só em `src/data/*`.
- Estado de cena: objeto compartilhado escrito pelo GSAP e lido a cada quadro (como
  `estadoCena.ts`). Nada de `setState` por quadro.
- **Um único canvas WebGL fixo** atrás da página inteira, trocando de cena conforme a rolagem
  (rosto, galeria, ambientes, contato) **[decisão minha]**. O texto continua em HTML por cima, para
  leitura, foco e SEO. Motivo: as passagens do vídeo (imagem que vira cena, bloco vermelho que vira
  beco) só ficam contínuas se tudo estiver no mesmo canvas.
- `dpr` máximo 1,5 no desktop, 1 no celular. Cena fora da faixa ativa não renderiza.
- Movimento reduzido e falta de WebGL têm versão própria, estática e completa.
- Regras de código do Marcos: nomes em português, comentários só em caixa numerada, sem `any`,
  funções curtas. Testes versionados ficam e passam; testes novos são temporários.
- Trabalho em fases, com relatório e validação ao fim de cada uma.

## 4. Cena por cena

Ordem: Carregamento → Abertura → Galeria → Indústria → Cidade (cânion, vista de cima, bloco
vermelho) → Contato.

Destino das seções atuais **[decisão minha]**:

| Hoje | Vai para |
|---|---|
| Hero | Abertura |
| Manifesto | Sai. A passagem para o claro é o rosto se desfazendo, como no vídeo |
| Projetos | Galeria "Projetos selecionados" |
| Sobre + Stack | Texto da Indústria |
| Trajetória | Texto do cânion |
| Contato | Beco vermelho |

### 4.1 Carregamento

- Tela preta, "CARREGANDO" pequeno e em negrito no centro, e logo embaixo uma barra de vida igual
  à do vídeo: moldura em pílula de 132 × 12 px, enchimento afastado da moldura, ponta clara na
  frente e brilho azulado. Enche pelo progresso real do `rosto.bin`. Substitui o "MR." atual.
- Fica no mínimo 1,2 s na tela (para a barra ser vista encher) e sai quando o rosto está pronto
  ou após 4 s. O fundo some antes, revelando a cena; a barra some logo depois.

### 4.2 Abertura

Sequência de ~2,5 s, uma vez por visita (segunda visita na aba, mais rápida, como hoje):

1. **Grade cilíndrica**: linhas verticais e horizontais num cilindro visto por dentro, finas,
   cinza claro, mais fortes perto do centro. Acende junto com o rosto.
2. **Rosto em linhas**: as partículas do `rosto.bin` passam a ser desenhadas como linhas
   verticais (colunas de pontos alongados), ciano esbranquiçado, primeiro só o contorno e as
   bordas fortes (onde a profundidade muda), depois o miolo.
3. **Luz**: o miolo satura em branco por ~0,4 s.
4. **Foto**: a cor de cada linha passa do branco para a cor real da foto; as linhas verticais
   continuam visíveis por cima, como no vídeo.
5. **Textos**: nome pequeno no canto superior esquerdo; nome grande à esquerda no meio com o
   cargo embaixo; `perfil.posicionamento` curto à direita no meio; navegação no canto superior
   direito.

Cursor (só mouse): lente redonda que deforma e separa as cores do rosto e da grade em volta do
ponteiro, mais o giro de cabeça que já existe.

Saída na rolagem (seção presa ~1 tela): grade entorta mais, rosto se desfaz em lascas que se
espalham e somem, o fundo vai do preto ao off-white. A galeria já está entrando por baixo.

### 4.3 Galeria "Projetos selecionados"

- Fundo off-white. À esquerda, no meio, fixo: "PROJETOS SELECIONADOS" e embaixo a lista dos
  projetos com imagem (`vitrine: true`: EduTrack, TicketFlow, ReciclaPlus, Vinicio Campos), o que
  está no centro marcado.
- Coluna central: as imagens dos projetos como planos WebGL, uma atrás da outra, subindo com a
  rolagem. Shader:
  - curvatura nas bordas de cima e de baixo da tela (o plano se dobra como um cilindro deitado);
  - forma de tubo (barril) e cantos arredondados;
  - separação de cores proporcional à velocidade da rolagem.
- Na imagem do centro: nome do projeto, categoria, tecnologias e links (HTML por cima, alinhados
  ao plano).
- No fim da galeria, a última imagem cresce até a tela cheia e dá lugar à Indústria (a imagem
  "vira a cena").
- Projetos sem imagem (Aplicativo Mobile, E-commerce, Este portfólio): entram na lista lateral,
  sem plano, com link **[decisão minha]**.
- Clique na lista leva a rolagem até o projeto; foco por teclado faz o mesmo.

### 4.4 Indústria

- Imagens `industrial-1/2/3` e `industrial-luzes` como planos no mesmo canvas, com câmera
  avançando: zoom contínuo e troca cruzada 1 → 2 → 3, luzes em mistura aditiva por cima, poeira
  fria em partículas.
- Texto pequeno no canto inferior esquerdo: "SOBRE" + `perfil.sobre` resumido e os grupos da
  stack em uma linha cada.

### 4.5 Cidade

1. **Cânion** (`cidade-1`): zoom para dentro até a luz branca do fundo tomar a tela. Texto à
   esquerda entre colchetes: trajetória (estágio, curso) com "saiba mais" levando ao LinkedIn.
2. **Vista de cima** (`cidade-3`): abre do branco e a câmera desce.
3. **Bloco vermelho**: o centro vermelho cresce; pedaços da imagem em volta se partem em lascas
   que voam para fora; o vermelho enche a tela e vira o beco.

### 4.6 Contato

- `contato-1` em tela cheia, parallax leve ao cursor, `contato-faiscas` em mistura aditiva,
  brasas subindo.
- Chamada central em branco, caixa alta: "VAMOS CONVERSAR SOBRE / O SEU PRÓXIMO PROJETO"
  (português, decisão do Marcos).
- Frase pequena embaixo, linha de links (LinkedIn, GitHub, e-mail; sem WhatsApp), rodapé pequeno
  no centro de baixo.
- No fim da rolagem a imagem se desfaz em ruído vermelho, como no último quadro.

## 5. Tipografia e textos de interface

Vídeo: caixa alta, fonte estreita, letras espaçadas. Proposta **[decisão minha]**: Geist com
`font-stretch` condensado e `letter-spacing` aberto para rótulos, Geist pesada para nome e
chamada. Sem fonte nova.

Textos de interface em português ("CARREGANDO", "PROJETOS SELECIONADOS", "SOBRE", "SAIBA MAIS").

## 6. Imagens

- Ambientes: os `public/ambientes/*.webp` já gerados (1376 e 800 px). Se ficarem moles em tela
  grande dentro do WebGL, gerar de novo maiores (aviso antes).
- Projetos: as imagens reais que já existem em `projetos.ts`. Nenhum placeholder.
- Rosto: `rosto.bin` atual (posição, profundidade e cor). Se a cor não estiver no binário, o
  script `npm run rosto` passa a gravá-la **[a confirmar na implementação]**.

## 7. Arquitetura

```
src/components/
  cena/             Canvas único fixo: CenaPrincipal, controle de qual cena desenha
    abertura/       GradeCilindrica, RostoEmLinhas, LenteCursor
    galeria/        PlanosGaleria + shader (curvatura, barril, cores)
    ambientes/      PlanoAmbiente (imagem com zoom/troca), Lascas, Particulas
  abertura/         Carregamento (HTML), sequência
  motion/           um gancho de rolagem por cena, escrevendo em estadoCena
  sections/         HTML por cima: Hero, Projetos, Sobre, Trajetoria, Contato
```

- `estadoCena`: progresso de cada cena (0..1), velocidade da rolagem, cursor. Escrito pelo GSAP,
  lido nos `useFrame`.
- Cada cena só desenha quando o progresso dela está entre 0 e 1 (com folga).
- Texturas carregadas por cena, uma antes de precisar.

## 8. Celular, movimento reduzido e sem WebGL

| Situação | Comportamento |
|---|---|
| Celular | Canvas com menos partículas e sem lente; galeria em coluna com as imagens planas e curvatura leve no shader; ambientes com zoom curto; sem lascas |
| Movimento reduzido | Sem canvas animado: rosto estático (`rosto-estatico.webp`), galeria em coluna, ambientes como imagem parada com o texto, contato com imagem parada |
| Sem WebGL | Igual ao movimento reduzido |

Acessibilidade: ordem de leitura igual à visual, títulos semânticos, foco visível, links
alcançáveis por teclado mesmo com seção presa, contraste AA (véu onde precisar), `alt` vazio nas
imagens de ambiente e `alt` real nas de projeto.

## 9. Fases (refeitas)

1. Canvas único + carregamento + abertura (grade cilíndrica, rosto em linhas, luz, foto, lente,
   textos).
2. Saída do rosto em lascas + passagem para o claro + galeria WebGL.
3. Imagem da galeria virando a Indústria + Indústria.
4. Cidade (cânion, vista de cima, bloco vermelho).
5. Contato.
6. Celular, movimento reduzido, sem WebGL.
7. Performance, acessibilidade, revisão visual.

Cada fase termina com relatório (o que mudou, arquivos, testes, verificação no navegador lado a
lado com o quadro do vídeo) e espera validação.

## 10. Decisões do Marcos

12/11/2026:

1. Galeria só com os projetos atuais de `projetos.ts`; TCC CRM, ProsperaMotors e
   kurio-nft-marketplace ficam de fora.
2. Chamada do contato em português.
3. Sem WhatsApp.
4. Tudo fiel ao vídeo, abertura inclusive.

## 11. A cargo de quem implementar

Curvas e durações exatas, quantidade de partículas e lascas, parâmetros dos shaders, pontos de
corte da rolagem, desde que o resultado bata com o quadro correspondente do vídeo na validação.
