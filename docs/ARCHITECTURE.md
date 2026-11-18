# Arquitetura

Estado: base React/Vite em `src/app/`. Tailwind, tokens e estilos base entram por
`src/styles/index.css`. Os demais diretórios estão planejados para as próximas tasks.

## Diretórios

```
src/
  app/            App, providers, ponto de entrada
  components/
    layout/       Header, Menu mobile, Rodape
    ui/           Botao, LinkSeta, RotuloSecao, Linha, MetaMono
    animation/    TituloMascara, Revelar, Faixa
    three/        CenaHero, Cabeca, Luzes, fallback sem WebGL
  sections/       hero, about, projects, experience, stack, contact
  hooks/          useReducedMotion, useSecaoAtiva, useCursorNormalizado, useWebGL, useNaTela
  data/           projetos.ts, experiencias.ts, stack.ts, contato.ts
  styles/         tokens.css, base.css, fontes.css
  types/          tipos de domínio (Projeto, Experiencia, Contato)
  utils/          funções puras
  assets/
public/           models/, images/, fonts/
tests/            Playwright e2e
docs/
.github/workflows/deploy.yml
```

## Responsabilidades

- `sections/*`: compõem conteúdo e animação da seção; não conhecem outras seções.
- `components/ui`: apresentação pura, sem GSAP.
- `components/animation`: encapsulam GSAP; recebem conteúdo por `children`.
- `components/three`: tudo de Three.js; expõe um componente `CenaHero` carregado com `lazy`.
- `data/*`: dados tipados, sem JSX.
- `hooks/*`: efeitos reutilizáveis com cleanup completo.

## Camada de animações

Configuração central em `src/animation/config.ts` (durações, easings, distâncias) alimentada por
`ANIMATIONS.md`. GSAP é o único dono de scroll-driven e timelines. `gsap.registerPlugin(ScrollTrigger)`
uma vez. Cada seção cria suas timelines dentro de `useGSAP` com escopo e cleanup (`gsap.context`).
Motion fica fora, salvo microinteração localizada justificada. Lenis só entra se a decisão em
`DECISIONS.md` mostrar ganho; nesse caso, `ScrollTrigger.update` no tick do Lenis e nenhum outro
controlador de scroll.

## Assets

Imports resolvidos pelo Vite ou `import.meta.env.BASE_URL` para o que está em `public/`. Fontes locais
em WOFF2. Imagens em WebP/AVIF com dimensões declaradas. GLB com Draco/Meshopt, texturas 1K a 2K.
Inventário em `ASSETS.md`.

## Integração Three.js

- React Three Fiber, canvas único, `frameloop="demand"` ou pausado fora da tela.
- Cursor e progresso de scroll entram por `ref` mutável (nunca `useState` por frame).
- Hierarquia: `grupoScroll` (rotação, escala, posição da timeline) contém `grupoCursor` (giro leve
  pelo cursor) contém a malha. Dois grupos independentes evitam disputa pela mesma transformação.
- DPR adaptativo (1 a 2, cai em dispositivo fraco). Tone mapping ACES, luz controlada pela timeline.
- `dispose` de geometrias, materiais e texturas no unmount.
- Sem WebGL ou reduced motion: imagem estática autoral e modelo parado.
- Modelo definitivo pendente: usar cabeça procedural provisória, documentada.

## Estratégia de carregamento

Hero com HTML e fontes imediatos (LCP é texto). Chunk do Three.js carregado após o primeiro paint
(`lazy` + `Suspense` + `requestIdleCallback`). Seções abaixo da dobra com imagens `loading="lazy"`.
Code splitting por `import()` para a cena.

## Decisões sobre bibliotecas

Registradas em `DECISIONS.md`. Regra: biblioteca nova só com necessidade demonstrada e tamanho medido.
