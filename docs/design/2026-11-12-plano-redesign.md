# Plano de implementação: redesign cinematográfico

**Objetivo:** construir a narrativa de rolagem do documento de design, uma fase por vez, com
validação do Marcos ao fim de cada fase.

**Arquitetura:** stack atual (Vite, React 19, TypeScript, R3F, three, GSAP com ScrollTrigger e
SplitText). Ambientes imersivos são camadas de imagem com CSS e GSAP, mais partículas three.js
leves. Estado de cena compartilhado, lido a cada quadro, no padrão de `estadoCena.ts`.

**Design:** `docs/design/2026-11-12-redesign-cinematografico.md` (ler junto com este plano).

## Como este plano está dividido

O design pede validação visual ao fim de cada fase, e o que ele aprovar ou rejeitar muda a fase
seguinte. Por isso só a **Fase 2** está detalhada em tarefas. Cada fase seguinte ganha sua seção
detalhada aqui quando a anterior for validada.

| Fase | Entrega                                                                                | Seções do design |
| ---- | -------------------------------------------------------------------------------------- | ---------------- |
| 2    | Sistema visual: CSS dividido, tokens dos ambientes, imagens em WebP, cursor contextual | 3, 5, 6          |
| 3    | Carregamento e abertura (grade curva, sequência de entrada, cursor, ocioso)            | 4.1, 4.2         |
| 4    | Transição escuro → claro com o manifesto                                               | 4.3              |
| 5    | Galeria horizontal de projetos                                                         | 4.4              |
| 6    | Ambientes Indústria e Cidade, `estadoAmbiente`, partículas de ambiente                 | 4.5, 4.6, 6      |
| 7    | Contato vermelho                                                                       | 4.7              |
| 8    | Celular                                                                                | 7                |
| 9    | Performance e acessibilidade (Lighthouse, Web Vitals)                                  | 1, 7             |
| 10   | Revisão visual completa e testes                                                       | tudo             |

## Regras globais

- Nenhuma dependência nova. `sharp` (já em devDependencies) converte imagens.
- Nomes em português; comentário só em caixa numerada (`// ====` / `/* ====`); sem `any`;
  funções curtas; 2 espaços; aspas duplas como nos arquivos atuais.
- Testes novos (`*.test.ts` / `*.test.mjs`) são temporários: escrever, ver falhar, implementar,
  ver passar, apagar antes da entrega. Testes já versionados ficam e precisam passar.
- Toda fase termina com `npm run build`, `npm run lint`, `npm test`, `npm run dev` e conferência
  no navegador pela extensão do Chrome, com prints.
- `npm run build` altera `dist/index.html` e `tsconfig.tsbuildinfo` rastreados: restaurar com
  `git show HEAD:<arquivo> > <arquivo>` antes de entregar.
- Commit só com a senha do Marcos; mensagem sem linha de coautoria.
- Texto pequeno em fonte normal (Geist). Proibido: monoespaçada em caixa alta, códigos tipo
  "FIG. 01", grade de fundo fora da abertura.

## Pontos de atenção da Fase 2

1. Divisão do CSS mudando a ordem das regras: o CSS gerado precisa sair igual ao de antes.
2. `.rodape` aparece em duas caixas do `secoes.css` (2 e 7): as duas regras ficam, na mesma ordem.
3. Cursor contextual em tela de toque ou com "reduzir movimento": não pode aparecer nem esconder
   o cursor do sistema.
4. Cursor sobre link dentro da imagem do projeto: o clique continua indo para o link
   (o círculo não pode capturar ponteiro).
5. Script de imagens rodado duas vezes: sobrescreve sem erro e não deixa arquivo velho com outro
   nome.

---

## Fase 2: sistema visual

### Tarefa 1: dividir `secoes.css` por seção, sem mudar o resultado

**Arquivos:**

- Criar: `src/styles/secoes/navegacao.css`, `hero.css`, `manifesto.css`, `projetos.css`,
  `sobre-stack.css`, `trajetoria.css`, `contato.css`, `telas-estreitas.css`, `galeria-curva.css`
- Modificar: `src/styles/global.css:2` (trocar `@import "./secoes.css";` pelos 9 imports, nesta
  ordem)
- Apagar: `src/styles/secoes.css`

Cada arquivo recebe exatamente uma caixa numerada do arquivo atual, na ordem: 1 navegação,
2 hero, 3 manifesto, 4 projetos, 5 sobre e stack, 6 trajetória, 7 contato e rodapé, 8 telas
estreitas, 9 galeria curva. Conteúdo copiado sem edição.

- [ ] **Passo 1:** `npm run build` e copiar o CSS gerado: `cp dist/assets/index-*.css
<scratchpad>/css-antes.css`.
- [ ] **Passo 2:** criar os 9 arquivos, trocar o import, apagar `secoes.css`.
- [ ] **Passo 3:** `npm run build` e `diff <scratchpad>/css-antes.css dist/assets/index-*.css`.
      Esperado: nenhuma diferença.
- [ ] **Passo 4:** restaurar `dist/index.html` e `tsconfig.tsbuildinfo`.

### Tarefa 2: tokens dos ambientes e texto de legenda

**Arquivos:**

- Modificar: `src/styles/global.css` (caixas 1. TOKENS e 3. TIPOGRAFIA; nova caixa 6. AMBIENTES no fim, antes do bloco de movimento reduzido)

Tokens novos em `@theme` (valores tirados das imagens de `references/ambientes/`):

| Token                | Valor                            | Uso                                       |
| -------------------- | -------------------------------- | ----------------------------------------- |
| `--color-azul-noite` | `#0b1622`                        | fundo da Cidade antes da imagem carregar  |
| `--color-aco`        | `#9fb3c8`                        | texto secundário sobre a Indústria        |
| `--color-vermelho`   | `#c4161c`                        | fundo do Contato antes da imagem carregar |
| `--color-brasa`      | `#ff7a3d`                        | destaque no Contato                       |
| `--ease-cena`        | `cubic-bezier(0.65, 0, 0.35, 1)` | transições presas na rolagem              |

Classes novas:

- `.texto-legenda`: `font: 500 13px/1.45 var(--font-texto)`, `letter-spacing: 0.01em`,
  `color: var(--cor-secundaria)`, sem `text-transform`.
- `.faixa-ambiente`: mesmas variáveis de `.faixa` com `--cor-primaria: var(--color-off-white)`,
  `--cor-secundaria: var(--color-aco)`, `min-height: 100svh`, `overflow: clip`, `isolation:
isolate`, padding de `.faixa`, fundo `var(--color-preto)`.
- `.ambiente-camada`: `position: absolute; inset: 0; z-index: -1`; imagem filha com
  `width: 100%; height: 100%; object-fit: cover`.
- `.ambiente-camada-luz`: herda `.ambiente-camada` e usa `mix-blend-mode: screen`.
- `.ambiente-veu`: `position: absolute; inset: 0; z-index: -1; background: linear-gradient(to
top, rgb(0 0 0 / 0.55), transparent 55%)`.

- [ ] **Passo 1:** adicionar tokens e classes.
- [ ] **Passo 2 (fazer depois da Tarefa 3, que gera as imagens):** página temporária de
      conferência, criada em `public/teste-ambientes.html` porque só `public/` é servido no dev, que
      usa uma imagem da Tarefa 3 com `.faixa-ambiente` + camadas + `.texto-legenda`. Conferir no navegador: texto legível,
      luz somando por cima, sem rolagem horizontal em 390 px. Apagar o arquivo depois.

### Tarefa 3: imagens dos ambientes em WebP

**Arquivos:**

- Criar: `scripts/ambientes/converter-ambientes.mjs`
- Modificar: `package.json` (script `"ambientes": "node scripts/ambientes/converter-ambientes.mjs"`)
- Saída: `public/ambientes/<nome>-1376.webp` e `public/ambientes/<nome>-800.webp`
- Teste temporário: `scripts/ambientes/converter-ambientes.test.mjs`

**Interface:**

- Produz: `export function listarSaidasAmbiente(nomeArquivo: string): { largura: number;
caminho: string }[]` (caminhos relativos a `public/ambientes/`), usada pelo script e, nas
  fases 6 e 7, como convenção de nome (`<nome>-1376.webp`, `<nome>-800.webp`).
- Entrada: os 8 arquivos `references/ambientes/*.jpg` (industrial-1, industrial-2, industrial-3,
  industrial-luzes, cidade-1, cidade-3, contato-1, contato-faiscas).

- [ ] **Passo 1: teste que falha**

```js
import { describe, expect, it } from "vitest";
import { listarSaidasAmbiente } from "./converter-ambientes.mjs";

describe("listarSaidasAmbiente", () => {
  it("gera as duas larguras com o nome sem extensão", () => {
    expect(listarSaidasAmbiente("cidade-1.jpg")).toEqual([
      { largura: 1376, caminho: "cidade-1-1376.webp" },
      { largura: 800, caminho: "cidade-1-800.webp" },
    ]);
  });

  it("recusa nome fora do padrão com mensagem que mostra o valor", () => {
    expect(() => listarSaidasAmbiente("Foto Final.png")).toThrow(
      'Imagem "Foto Final.png" inválida: esperado nome-em-minusculas.jpg',
    );
  });
});
```

- [ ] **Passo 2:** `npx vitest run scripts/ambientes` — esperado: FALHA (módulo não existe).
- [ ] **Passo 3:** implementar `listarSaidasAmbiente` e o script: lê `references/ambientes/*.jpg`,
      para cada saída `sharp(entrada).resize({ width }).webp({ quality: 80 }).toFile(...)`,
      cria `public/ambientes/` se faltar, sobrescreve arquivos existentes, imprime nome e tamanho em
      KB. O código do script só roda quando chamado direto (`import.meta.url` igual ao arquivo
      executado), para o teste poder importar a função.
- [ ] **Passo 4:** `npx vitest run scripts/ambientes` — esperado: PASSA.
- [ ] **Passo 5:** `npm run ambientes` duas vezes — esperado: 16 arquivos em `public/ambientes/`,
      nenhum acima de 400 KB, segunda execução sem erro.
- [ ] **Passo 6:** apagar `scripts/ambientes/converter-ambientes.test.mjs`.

### Tarefa 4: cursor contextual

**Arquivos:**

- Criar: `src/components/layout/CursorContextual.tsx`, `src/components/layout/rotuloCursor.ts`
- Modificar: `src/App.tsx` (renderizar `<CursorContextual />` depois de `<Navegacao />`),
  `src/components/sections/PainelProjeto.tsx:10` (`data-cursor="Ver"` no `div.painel-imagem`),
  `src/styles/secoes/navegacao.css` (estilo do círculo, nova caixa)
- Teste temporário: `src/components/layout/rotuloCursor.test.ts`

**Interface:**

- Produz: `export function lerRotuloCursor(alvo: AlvoCursor | null): string | null`, com
  `type AlvoCursor = { closest(seletor: string): { getAttribute(nome: string): string | null } | null }`.
  Convenção para as próximas fases: qualquer elemento com `data-cursor="<texto>"` mostra o círculo
  com esse texto.

- [ ] **Passo 1: teste que falha**

```ts
import { describe, expect, it } from "vitest";
import { lerRotuloCursor } from "./rotuloCursor";

const alvoCom = (rotulo: string | null) => ({
  closest: () => (rotulo === null ? null : { getAttribute: () => rotulo }),
});

describe("lerRotuloCursor", () => {
  it("devolve o texto do data-cursor mais próximo", () => {
    expect(lerRotuloCursor(alvoCom("Ver"))).toBe("Ver");
  });

  it("devolve null sem alvo, sem data-cursor ou com texto vazio", () => {
    expect(lerRotuloCursor(null)).toBeNull();
    expect(lerRotuloCursor(alvoCom(null))).toBeNull();
    expect(lerRotuloCursor(alvoCom("  "))).toBeNull();
  });
});
```

- [ ] **Passo 2:** `npx vitest run src/components/layout` — esperado: FALHA.
- [ ] **Passo 3:** implementar `lerRotuloCursor` (usa `closest("[data-cursor]")`, apara o texto).
- [ ] **Passo 4:** `npx vitest run src/components/layout` — esperado: PASSA.
- [ ] **Passo 5:** implementar `CursorContextual`:
  - não renderiza nada com `usePonteiroGrosso()` ou `useMovimentoReduzido()` verdadeiros;
  - círculo de 84 px, fundo `--color-preto`, texto `--color-off-white` 13 px, `position: fixed`,
    `pointer-events: none`, `aria-hidden="true"`, `z-index` acima da navegação;
  - posição por `gsap.quickTo` (x e y, `duration: 0.35`, `ease: "power3.out"`) a partir de
    `pointermove` na `window`;
  - escala 0 → 1 quando `lerRotuloCursor(evento.target)` devolve texto, 1 → 0 quando devolve null
    (0,25 s); o cursor do sistema continua visível;
  - limpa ouvinte e tweens ao desmontar (`useGSAP` com escopo).
- [ ] **Passo 6:** conferir no navegador: círculo "Ver" sobre as imagens da galeria, some fora
      delas, clique nos links "Ver site"/"Ver código" continua funcionando, nada aparece com o
      DevTools emulando toque.
- [ ] **Passo 7:** apagar `src/components/layout/rotuloCursor.test.ts`.

### Tarefa 5: fechamento da fase

- [ ] `npm run build`, `npm run lint`, `npm test` (testes versionados) — tudo passando.
- [ ] Restaurar `dist/index.html` e `tsconfig.tsbuildinfo`.
- [ ] Conferir que nenhum teste temporário nem `public/teste-ambientes.html` ficou.
- [ ] Atualizar `docs/CLAUDE.md` (arquitetura de estilos, script `ambientes`, cursor).
- [ ] Relatório ao Marcos: o que mudou, arquivos, dependências (nenhuma), testes, prints,
      problemas restantes. Esperar validação. Commit sugerido (com a senha dele):
      `feat: sistema visual do redesign (estilos por seção, ambientes em webp, cursor contextual)`.

---

## Pontos de atenção da Fase 3

1. Rosto que não carrega (erro, sem WebGL, rede lenta): a tela de carregamento some em até 4 s e
   o texto do hero aparece mesmo assim.
2. Servidor sem `Content-Length` ou com gzip (tamanho recebido maior que o anunciado): barra nunca
   passa de 100% nem fica com valor inválido.
3. Rosto que chega depois dos 4 s: monta com animação própria, sem aparecer pronto de repente.
4. Segunda visita na mesma aba (`sessionStorage` bloqueado inclusive): sequência mais curta, sem
   erro.
5. LCP: o nome entra no máximo ~1,5 s depois do fim do carregamento (meta 2,5 s, medida na Fase 9).

## Fase 3: carregamento e abertura

### Tarefa 1: progresso real do `rosto.bin` e estado da abertura

**Arquivos:**

- Criar: `src/components/abertura/estadoAbertura.ts`
- Modificar: `src/components/three/carregarRosto.ts` (ler por partes e avisar o progresso)
- Teste temporário: `src/components/abertura/estadoAbertura.test.ts`,
  `src/components/three/progressoRosto.test.ts`

**Interface:**

- `calcularProgressoCarga(recebidos: number, total: number | null): number | null` — fração
  0..1 limitada; `null` sem total válido.
- `carregarRosto(limite: number, aoProgredir?: (recebidos: number, total: number | null) => void)`.
- `estadoAbertura`: `{ progresso: number | null; rostoResolvido: boolean; liberada: boolean;
concluida: boolean }`, com `assinarAbertura(avisar)`, `lerAbertura()`,
  `informarProgresso(recebidos, total)`, `resolverRosto()`, `liberarAbertura()`,
  `concluirAbertura()`. Cada mudança cria objeto novo (para `useSyncExternalStore`).

Testes: fração limitada a 1 com gzip; `null` com total 0/nulo/NaN; `carregarRosto` com `fetch`
falso em partes chama `aoProgredir` e devolve os pontos; tamanho em bytes fora de múltiplo de 4
dá erro com o tamanho recebido; estado avisa assinantes e não avisa quando nada muda.

### Tarefa 2: tela de carregamento

- Criar `src/components/abertura/Carregamento.tsx` + caixa em `src/styles/secoes/abertura.css`.
- Preto, "MR." e barra fina (`scaleX` = progresso; sem total, barra parada em 15% pulsando).
- Some quando `rostoResolvido` ou após 4 s; esmaece 0,5 s (nada com movimento reduzido); ao sumir
  chama `liberarAbertura()` e desmonta. `aria-hidden`, sem foco.
- `CenaRosto` chama `informarProgresso` e `resolverRosto` (pronto, estático ou erro).

### Tarefa 3: grade curva, poeira e efeitos de cursor no rosto

- Criar `src/components/three/GradeCurva.tsx` com `criarLinhasGrade(colunas, fileiras, segmentos)`
  (posições + profundidade 0..1 por vértice; piso que sobe em curva no fundo) e shader próprio:
  acende de perto para longe (`uAcendimento`), some na distância, some com `saidaHero`.
  Só computador.
- Criar `src/components/three/PoeiraAbertura.tsx`: poucas centenas de pontos subindo devagar.
- `shaders.ts`: `uSurgimento` (pontos espalhados aparecem), `uVarredura` (faixa de luz de cima para
  baixo), `uCursor` + `uForcaCursor` (pontos perto do cursor se afastam e clareiam), variação lenta
  de luz.
- `ParticulasRosto`: posição do cursor projetada no plano do rosto, suavizada; câmera acompanha de
  leve.
- `estadoCena` ganha `grade`, `surgimento`, `varredura`.

### Tarefa 4: sequência de entrada e novo texto do hero

- Criar `src/components/abertura/useSequenciaAbertura.ts`: espera `liberada`; linha do tempo GSAP:
  grade → surgimento → montagem → varredura → nome, cargo, navegação; ao fim `concluirAbertura()`.
  Segunda visita (`sessionStorage`, em try/catch): 2,5x mais rápida. Movimento reduzido: tudo em 1
  sem animação.
- Montagem sai do `CenaRosto`; rosto que chega depois da abertura concluída monta sozinho.
- `Hero.tsx`: nome e cargo no alto à esquerda, posicionamento e botões embaixo à esquerda, dica de
  rolagem embaixo à direita. Entrada do hero sai do `useMovimentoEditorial`.

### Tarefa 5: fechamento

Igual à Fase 2: build, lint, testes versionados, navegador com prints (primeira visita, segunda
visita, celular 375, movimento reduzido), restaurar `dist/index.html` e `tsconfig.tsbuildinfo`,
apagar testes temporários, atualizar `docs/CLAUDE.md`, relatório e esperar validação.

---

## Pontos de atenção da Fase 4

1. Rolar de volta no meio da transição: cena, véu e frase desfazem na mesma ordem, sem salto.
2. Âncora `#projetos` pela navegação: cai no título da galeria, com o hero já escondido e sem
   botão clicável por baixo do véu.
3. Celular (< 1024 px): sem prender a rolagem; a frase entra quando chega na tela.
4. Movimento reduzido: sem prender, frase parada, texto do hero só esmaece.
5. Palavras escondidas desde o primeiro quadro (antes da etapa da frase começar).

## Fase 4: transição escuro → claro

### Tarefa 1: etapas encadeadas

- Criar `src/components/motion/etapasTransicao.ts`:
  `encadearEtapas(duracoes: number[]): { inicio: number; duracao: number }[]` — cada etapa começa
  na metade da anterior; tudo normalizado para a última terminar em 1.
- Teste temporário: inícios 0 / 0,25 / 0,5 para `[2, 2, 2]`; lista vazia e duração 0 dão erro com
  o valor recebido.

### Tarefa 2: cena 3D

- `estadoCena`: `recuo` (câmera) e `apagarGrade`; `calcularRecuoCamera(recuo, voltaContato)`
  (recuo some quando o rosto volta no contato). Teste temporário da função.
- `ParticulasRosto`: câmera em `DISTANCIA_CAMERA + recuo`. `GradeCurva`: opacidade por
  `apagarGrade`. `shaders.ts`: pontos soltos sobem.

### Tarefa 3: frase palavra por palavra (anime.js)

- Criar `src/components/motion/palavrasManifesto.ts`: `criarPalavrasManifesto(frase)` devolve
  `{ posicionar(avanco), tocar(), recolher(), desfazer() }`. `splitText` com máscara por palavra e
  linha do tempo parada do anime.js; estado inicial escondido com `set`.

### Tarefa 4: presa na rolagem

- Criar `src/components/motion/useRolagemTransicao.ts`: `gsap.matchMedia`. Computador sem
  movimento reduzido: hero + manifesto na mesma célula (`.transicao[data-transicao="ativa"]`),
  presos por 150%, véu off-white, frase movida pela rolagem. Resto: sem prender.
- `useRolagemRosto` fica só com a volta do rosto no contato.
- `App.tsx`: invólucro `.transicao`; `Manifesto.tsx`: véu e sem `data-revelar`;
  `manifesto.css`: caixa da transição presa.

### Tarefa 5: fechamento

Igual às fases anteriores.

---

# Refação fiel ao vídeo (12/11/2026)

Especificação: `2026-11-12-redesign-cinematografico.md` (revisada). As fases 3 a 5 acima ficam
substituídas pelas fases R1 a R7 da seção 9 da especificação. Execução na própria sessão, uma
fase por vez, com validação do Marcos entre elas.

## Fase R1: carregamento e abertura

Restrições: nenhuma dependência nova; nomes em português; comentário só em caixa; testes
versionados continuam passando; teste novo é temporário.

Pontos de atenção na revisão:

1. `rosto-cor.bin` ausente ou com tamanho errado: rosto aparece em cinza, sem erro na tela.
2. Rosto que resolve antes de 1,2 s: a barra ainda enche inteira antes de sair.
3. Rosto que não resolve em 4 s: a barra enche e a página libera.
4. Movimento reduzido: sem sequência, tudo pronto.
5. Toque: sem lente e sem grade.

### Tarefa 1: cor e borda de cada ponto

- `scripts/rosto/amostragem.mjs`: exportar `calcularBordas`.
- `scripts/rosto/gerar-rosto.mjs`: gravar `public/rosto/rosto-cor.bin`, 4 bytes por ponto
  `[r, g, b, borda]`, mesma ordem do `rosto.bin`. Borda = Sobel da máscara + profundidade.
- `src/components/three/carregarRosto.ts`:
  `recortarCores(bytes: Uint8Array, totalPontos: number): Uint8Array | null` e
  `carregarCoresRosto(totalPontos: number): Promise<Uint8Array | null>` (falha vira `null`).
- Teste temporário: tamanho menor que o pedido e não múltiplo de 4 devolvem `null`.

### Tarefa 2: carregamento em barra de vida

- `Carregamento.tsx` + `abertura.css`: "CARREGANDO" com brilho, barra com contorno em pílula e
  miolo que enche. Valor mostrado persegue o real; sai só depois de encher (mínimo 1,2 s, máximo
  4 s). O fundo some primeiro e a sequência já roda por trás; texto e barra somem depois.
- `perfil.ts` não muda; rótulo em `src/data/interface.ts` (`textosInterface.carregando`).

### Tarefa 3: grade cilíndrica

- `linhasGrade.ts`: `criarLinhasGrade(colunas, fileiras, segmentos)` passa a gerar a parede de
  dentro de um cilindro de eixo vertical. `GradeCurva.tsx`: acende do centro para as bordas.

### Tarefa 4: rosto em linhas, luz e foto

- `estadoCena`: sai `varredura`; entram `luz` e `foto` (0..1). `montagem` passa a ser o desenho
  (contorno primeiro, miolo depois).
- `shaders.ts` + `ParticulasRosto.tsx`: pontos presos em colunas e alongados na vertical;
  atributos `aCor` e `aBorda`; rosto centralizado na tela.
- `useSequenciaAbertura.ts`: grade, contorno, miolo, luz, foto, textos, navegação.

### Tarefa 5: lente do cursor

- Criar `src/components/three/LenteCursor.tsx`: desenha a cena numa textura e depois na tela com
  deformação e separação de cores em volta do ponteiro. Só com mouse e sem movimento reduzido.

### Tarefa 6: textos do hero e navegação

- `Hero.tsx`, `hero.css`, `Navegacao.tsx`, `navegacao.css`: nome pequeno no canto superior
  esquerdo, nome à esquerda no meio com cargo, posicionamento à direita no meio, tudo em caixa
  alta estreita e espaçada. Botões do hero saem (os links seguem na navegação e no contato).

### Tarefa 7: fechamento

`tsc`, `lint`, testes, build, navegador (computador e iframe 375 px) lado a lado com os quadros
do vídeo, restaurar `dist/index.html` e `tsconfig.tsbuildinfo`, atualizar `docs/CLAUDE.md`.

## Fase R2: saída do rosto, passagem para o claro e galeria

Quadros do vídeo (3,4 s a 8,6 s): o hero inteiro vira uma folha preta que sobe curvada (mais
larga em cima), o fundo claro aparece por baixo, e a coluna de imagens abauladas sobe com a
rolagem; "PROJETOS SELECIONADOS" e a lista ficam parados à esquerda, no meio da tela.

### Tarefa 1: estado do palco

- Criar `src/components/three/estadoPalco.ts`: `estadoPalco { subida, clara, velocidade }`,
  `calcularSubidaDaFolha(topoDaGaleria, alturaDaTela)`, `galeriaEstaNaTela(topo, base, altura)`,
  `converterRetanguloParaTela(retangulo, largura, altura)`, `suavizarVelocidade(...)`.
- Teste temporário primeiro (falha, implementa, passa, apaga).

### Tarefa 2: rosto em lascas e grade mais curva

- `shaders.ts`: pontos agrupados em lascas (células inclinadas); cada lasca parte na sua hora,
  gira, se afasta do centro e some.
- `estadoCena.ts`: `curvaGrade`. `GradeCurva.tsx`: bordas da grade vêm para a frente.
- `useRolagemTransicao.ts`: presa de 120%: textos saem, câmera recua, grade curva, rosto em
  lascas. Sem manifesto. A grade só apaga depois que a galeria cobre a tela.

### Tarefa 3: folha do hero e fundo claro

- `LenteCursor.tsx` vira `ComposicaoCena.tsx`: mesma lente, mais a folha: a cena sobe junto com
  o topo da galeria, alargando para as bordas de cima e de baixo; fora da folha, off-white.
  Montada em tela de 1024 px ou mais, sem movimento reduzido. Lente só com mouse.

### Tarefa 4: galeria

- `Projetos.tsx`, `PainelProjeto.tsx`, `projetos.css`: lista lateral parada (todos os projetos,
  o atual marcado; sem imagem leva ao repositório), coluna com um projeto por tela (imagem no
  meio, ficha ao lado). Celular: coluna simples com imagens planas.
- Criar `src/components/three/GaleriaCurva.tsx` + `shadersGaleria.ts`: um plano por imagem, na
  posição do quadro HTML; curvatura do palco, bojo e cantos redondos, separação de cor pela
  velocidade da rolagem. Quando as texturas chegam, a seção fica transparente e a imagem HTML
  some (`data-galeria="webgl"`); sem WebGL fica a imagem HTML.
- `useRolagemGaleria.ts`: lateral presa, projeto atual marcado, ficha entra linha a linha
  (anime.js).
- Apagar `Manifesto.tsx`, `manifesto.css`, `palavrasManifesto.ts`, `galeria-presa.css`,
  `rolagemGaleria.ts`.

### Tarefa 5: fechamento

Igual à tarefa 7 da R1. Fica para a R3: última imagem crescer até a tela cheia.

## Fase R3: imagem que vira a Indústria

Quadros do vídeo (8,2 s a 10,6 s): a última imagem da galeria, ainda curva, já mostra a fábrica
e cresce até a tela cheia; depois a câmera anda para frente pela linha de produção, a imagem
escurece e as luzes verdes e vermelhas tomam conta. Texto pequeno no canto inferior esquerdo.

### Tarefa 1: estado da Indústria

- Criar `src/components/three/estadoIndustria.ts`: `medirIndustria(topo, base, altura, alturaDaTela)`
  devolve `{ crescimento, avanco, saida }` (0 a 1 cada); `pesosDasCenas(avanco)` devolve o peso
  de `industrial-1/2/3`; `estadoPalco` ganha `expansao` e `industriaCobre`.
- Teste temporário primeiro (falha, implementa, passa, apaga).

### Tarefa 2: cena no canvas

- Criar `src/components/three/CenaIndustria.tsx` + `shadersIndustria.ts`: um plano na camada 1
  que nasce no lugar do último quadro da galeria (mesma curva e cantos) com a imagem do projeto,
  cresce até a tela cheia trocando para `industrial-1`; depois zoom contínuo, troca 1 → 2 → 3,
  `industrial-luzes` somada por cima, poeira fria em partículas (campo de pontos no shader).
  Sobe junto com o fim da seção. Montado com o palco (>=1024 px, sem movimento reduzido).
- `GaleriaCurva`: esconde o último plano quando a expansão começa. `ComposicaoCena`: não desenha
  a cena 3D enquanto a Indústria cobre a tela. `CenaRosto`: `#sobre` entra nas seções com palco.

### Tarefa 3: seção Sobre na Indústria

- Criar `src/components/sections/Industria.tsx` (`section#sobre`), `industria.css` e
  `motion/useRolagemIndustria.ts`. Substitui `Sobre.tsx`, `Stack.tsx` e `sobre-stack.css`.
- Texto: "Sobre", resumo de `perfil.sobre` (`perfil.resumoSobre`, só fatos já escritos) e um
  grupo da stack por linha. Entra linha a linha (anime.js).
- Tela larga: seção de 380svh, palco preso; lista e ficha da galeria somem enquanto a imagem
  cresce. Sem WebGL: as imagens HTML (`industrial-1` + luzes). Celular: zoom curto na imagem
  HTML. Movimento reduzido: imagem parada com o texto.

### Tarefa 4: fechamento

Igual à tarefa 7 da R1.

## Fases R4 a R7: cidade, beco, celular e revisão (feitas em 12/11/2026)

- R4 cidade: `etapasDaCidade(avanco)` (zoom do cânion, branco, vista, descida, bloco) com teste
  temporário; plano único em `CenaCidade.tsx` + `shadersCidade.ts`; texto entre colchetes no
  cânion com "saiba mais" para o LinkedIn; seção 420svh com palco preso.
- R5 contato: `etapasDoBeco(chegada, fim)`; vermelho do bloco vira o beco (paralaxe, faíscas,
  brasas) e o fim vira ruído vermelho; chamada central, frase, links (LinkedIn, GitHub, e-mail,
  copiar) e rodapé pequeno no centro de baixo; seção 200svh presa. `Rodape` e
  `useRolagemRosto` removidos.
- R6: celular com zoom curto nas fotos HTML e véu mais forte, sem estilhaços; movimento reduzido e
  sem WebGL com fotos paradas e texto visível.
- R7: foco do teclado mostra o texto escondido das seções presas; `alt` vazio nas fotos de
  ambiente; tsc, eslint, prettier, 25 testes e build ok; conferido no navegador (desktop e iframe
  de 375 px) sem erro no console.

## Ajustes depois da R7 (12/11/2026)

- Foto do rosto em preto e branco.
- Galeria escura com grão (sem clarear); `estadoPalco.clara` virou `galeriaNaTela`.
- Projeto cresce até cobrir a tela inteira, com véu dos lados.
- Sobre com texto centralizado; zooms da Indústria e do cânion menores.
- Segunda rodada: projetos sem canto redondo; transição Sobre → Trajetória pela luz do fim do
  corredor abrindo do centro (`uSaida`), sem cortina; tipografia do Sobre (destaque, parágrafo
  cinza, stack em grade) e da Trajetória (título e etapas maiores, sombra escura à esquerda).
  Corrigido `medirCanto` (cobertura 0.5 com raio 0 deixava a cidade vazar pela fábrica).
- Terceira rodada: galeria sem curva, em cartões retos num carrossel preso (um projeto por tela;
  sai pela esquerda com esticão elástico, o próximo entra pela direita com mola); último cartão
  cresce até a fábrica sem salto; cursor "Ver" acompanha a rolagem com o mouse parado; textos de
  Projetos, Sobre, Trajetória e Contato em cartão escuro com desfoque (hero sem cartão);
  colchetes da Trajetória removidos.

## Paridade celular e revisão (12/11/2026)

- Celular com as mesmas animações do desktop: carrossel preso em retrato, fábrica crescendo do
  cartão, luz da cidade, vista aérea e beco no WebGL. Zoom curto do celular removido.
- Revisão de reuso, simplificação, desempenho e altura: helpers comuns de texto, palco preso e
  amortecimento; código morto removido (`useMidia` interno, `velocidade` do palco, `.etiquetas`,
  regra repetida de `pointer-events`); ganhos na lente, no beco, na galeria e na carga do rosto.
- Validado: tsc, eslint, 25 testes, build, desktop 1536 px e iframe de 375 px sem erro no
  console.
