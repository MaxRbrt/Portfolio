# GitHub Pages deployment design

## Goal

Restore all portfolio behavior at `https://maxrbrt.github.io/Portfolio/`, including GSAP motion, Three.js canvases, icons, project cards, and local assets.

## Root cause

GitHub Pages currently publishes the repository root. The source `index.html` references `/src/main.js`, so the browser requests `https://maxrbrt.github.io/src/main.js` instead of a file below `/Portfolio/`. Vite never runs in production, and JavaScript-driven behavior does not start.

## Chosen approach

Use GitHub Actions as the Pages publishing source. A workflow triggered by pushes to `main` will install locked dependencies, build the Vite application, upload `dist/` as the Pages artifact, and deploy that artifact.

Set Vite `base` to `/Portfolio/`. This makes generated JavaScript, CSS, favicon, image, and other asset URLs resolve below the project-site prefix.

## Components

- `vite.config.js`: define `base: "/Portfolio/"` while preserving existing Tailwind and chunk configuration.
- `.github/workflows/deploy-pages.yml`: build and deploy `dist/` with official GitHub Pages actions.
- GitHub repository Pages settings: change source from branch deployment to GitHub Actions.

## Deployment flow

1. Push lands on `main`.
2. Workflow checks out repository and configures Node.
3. `npm ci` installs versions from `package-lock.json`.
4. `npm run build` produces `dist/` with `/Portfolio/`-prefixed asset URLs.
5. Pages artifact uploads and deploys to the `github-pages` environment.
6. Public URL serves compiled application.

## Permissions and safety

Workflow receives only required permissions: repository contents read, Pages write, and OIDC token write. Deployment uses GitHub's `github-pages` environment and its reported URL.

No source assets, application behavior, contact form behavior, or visual design will be changed.

## Verification

Before publication:

- Run a regression check that fails while `dist/index.html` points outside `/Portfolio/`.
- Run `npm ci` and `npm run build`.
- Confirm generated script, stylesheet, favicon, and image URLs use `/Portfolio/`.

After publication:

- Confirm Pages workflow completes successfully.
- Load public URL without browser console errors.
- Confirm GSAP reveal/scroll behavior runs.
- Confirm hero and lab Three.js canvases render at real viewport dimensions.
- Confirm icons, project cards, profile image, and navigation interactions work.

## Rollback

Revert workflow and Vite configuration commit, then restore Pages source to `main` `/ (root)`. Existing tracked `dist/` remains untouched by this change.
