# Portfólio — Marcos Roberto dos Santos Junior

Portfólio de desenvolvedor Full Stack: página única em preto e branco, tipografia monumental, cabeça
3D que acompanha o cursor e um trecho cinematográfico preso à rolagem. Site estático publicado no
GitHub Pages.

Em reconstrução. O site anterior está no histórico do Git (commit `7c08401`).

## Como rodar

Requisito: Node.js 22 ou superior.

```bash
npm install
npm run dev        # http://127.0.0.1:5173/Portfolio/
npm run typecheck  # TypeScript sem emitir arquivos
npm run lint       # ESLint
npm test           # Vitest
npm run build      # gera dist/
npm run preview    # serve o build em http://127.0.0.1:4173/Portfolio/
```

## Stack

React, TypeScript (strict), Vite, Tailwind CSS, GSAP + ScrollTrigger, Three.js + React Three Fiber,
Vitest e Playwright.

## Documentação

- `docs/PROJECT.md`: escopo e requisitos.
- `docs/DESIGN_SYSTEM.md`: paleta, tipografia e grid.
- `docs/ARCHITECTURE.md`: organização do código.
- `docs/TASKS.md`: backlog.
- `docs/CONTENT.md`: textos e dados.

## Restrições

- Sem backend.
- Nenhum asset sem licença registrada em `docs/ASSETS.md`.
- Nenhum dado profissional inventado.
