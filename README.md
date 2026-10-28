# Portfólio — Marcos Roberto

Site pessoal publicado em https://maxrbrt.github.io/Portfolio/.

A página abre com o meu rosto formado por cerca de 60 mil pontos de luz. Ao rolar, o rosto se desfaz
em poeira e dá lugar a seções editoriais em preto e off-white: manifesto, projetos numa galeria curva,
sobre, stack, trajetória e contato. No contato, o rosto volta a se formar.

Todo o texto existe no HTML. Sem WebGL, com "reduzir movimento" ligado ou se o arquivo do rosto falhar,
a página continua completa.

## Como rodar

Requisito: Node.js 22.15 ou superior (o script do rosto usa `--use-system-ca`).

```bash
npm install
npm run dev       # http://127.0.0.1:5173/Portfolio/
npm run build     # gera dist/
npm run preview   # serve o build em http://127.0.0.1:4173/Portfolio/
npm test          # testes (Vitest)
npm run lint      # ESLint
```

Depois do build, `npm run test:pages` confere se os caminhos usam o prefixo `/Portfolio/`.

## Publicação

Todo push na `main` dispara `.github/workflows/deploy-pages.yml`, que roda o build e publica no GitHub
Pages. A pasta `dist/` não vai para o repositório.

## Trocar o rosto

1. Coloque uma foto em `references/` (jpg, png ou webp). A pasta é ignorada pelo Git.
2. Rode `npm run rosto`.
3. O script grava `public/rosto/rosto.bin` (os pontos) e `public/rosto/rosto-estatico.webp` (a imagem
   usada sem WebGL). Esses dois arquivos vão para o repositório; a foto não.

Tudo roda no computador: o script recorta a pessoa do fundo (modelo MODNet) e estima a profundidade
(Depth Anything V2 Small) com modelos abertos baixados uma vez para o cache do `node_modules`. A foto não é
enviada a nenhum serviço.

Foto boa para o efeito: de frente, rosto bem iluminado, fundo simples, ombros aparecendo, sem objeto na
frente do rosto, pelo menos 1000 px de lado. Sem foto em `references/`, o script usa o avatar de 192 px e
avisa que o resultado é provisório.

Limite: com uma foto só, o rosto é fiel de frente e tem profundidade aproximada. Por isso o giro com o
mouse fica limitado a 8 graus para os lados e 5 para cima e para baixo. A cabeça gira
inteira, o pescoço acompanha em degradê e os ombros ficam parados (pesos em
`src/components/three/pesosAnatomicos.ts`, giro no shader).

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Nome, cargo, frases, e-mail, links | `src/data/perfil.ts` |
| Projetos (texto, links, imagem, se entra na galeria) | `src/data/projetos.ts` |
| Grupos da stack | `src/data/stack.ts` |
| Trajetória | `src/data/trajetoria.ts` |
| Cores, fontes, raios, tempos | tokens no topo de `src/styles/global.css` |
| Layout das seções | `src/styles/secoes.css` e `src/components/sections/` |
| Pontos do rosto (shader, enquadramento, mouse) | `src/components/three/` |
| Rosto e rolagem | `src/components/motion/useRolagemRosto.ts` |
| Títulos revelados e galeria curva | `src/components/motion/useMovimentoEditorial.ts` |
| Geração da nuvem de pontos | `scripts/rosto/` |
| Tags de prévia (`og:*`) | `index.html` e `public/assets/brand/og.jpg` |

Em `projetos.ts`, `vitrine: true` coloca o projeto na galeria com imagem; os demais vão para "Outros
projetos". `site` e `codigo` são opcionais. Prints de site em 1440×846, em WebP.

## Padrões

- Vite, React, TypeScript, React Three Fiber e GSAP (ScrollTrigger e SplitText). Tailwind só na base.
- A cena 3D é carregada sob demanda (`React.lazy`), então o texto aparece antes do three.js.
- Um objeto `estadoCena` é escrito pelo GSAP e lido a cada quadro pelo rosto; nada de `setState` no
  quadro a quadro.
- O canvas só desenha quando o hero ou o contato estão na tela.
- Rolagem nativa, sem biblioteca de rolagem suave. Entradas de 700 ms com `expo.out`, hover de 200 ms,
  sem mola nem quique.
- Galeria curva só em tela de 1024 px ou mais e sem "reduzir movimento"; no resto, fila deslizável.
- Celular recebe 25 mil pontos; computador, 60 mil.
- Nomes e comentários em português; comentário só em caixa numerada no começo do bloco.
- Prettier formata só o arquivo tocado: `npx prettier --write caminho/do/arquivo`.

## Créditos

Modelos de recorte e profundidade: MODNet e Depth Anything V2 Small, via transformers.js.
