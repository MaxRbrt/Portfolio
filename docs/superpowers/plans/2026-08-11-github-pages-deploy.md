# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the compiled Vite portfolio below `/Portfolio/` so GSAP, Three.js, icons, project cards, and local assets work on GitHub Pages.

**Architecture:** Vite builds project-site-safe URLs with `base: "/Portfolio/"`. Static assets live in Vite's standard `public/` directory, while JavaScript-generated asset URLs use `import.meta.env.BASE_URL`. A two-job GitHub Actions workflow builds `dist/`, uploads the Pages artifact, and deploys it to the `github-pages` environment.

**Tech Stack:** Vite 8, Node.js 24, npm, GitHub Actions, GitHub Pages, GSAP, Three.js

## Global Constraints

- Public URL remains exactly `https://maxrbrt.github.io/Portfolio/`.
- Do not alter visual design, animation timing, source application behavior, or contact form behavior.
- Preserve existing Tailwind plugin and Rollup chunk configuration.
- Keep existing tracked `dist/` content out of commits; GitHub Actions owns future production builds.
- Workflow permissions must be limited to `contents: read`, `pages: write`, and `id-token: write`.
- Use official documented action majors: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, and `actions/deploy-pages@v4`.

---

## File Structure

- `vite.config.js`: declares GitHub project-site base path.
- `public/assets/**`: static brand, profile, and project images copied into the Vite build.
- `index.html`: uses Vite `%BASE_URL%` replacement for static HTML and fallback asset URLs.
- `src/data/projects.js`: builds project image URLs from `import.meta.env.BASE_URL`.
- `scripts/check-pages-build.mjs`: regression check for root-relative production assets.
- `scripts/check-pages-workflow.mjs`: static contract check for Pages workflow structure and permissions.
- `package.json`: exposes `test:pages` and `test:workflow` verification commands.
- `.github/workflows/deploy-pages.yml`: builds and deploys `dist/`.

### Task 1: Add failing GitHub Pages build regression

**Files:**
- Create: `scripts/check-pages-build.mjs`
- Modify: `package.json`
- Test: `scripts/check-pages-build.mjs`

**Interfaces:**
- Consumes: generated `dist/index.html` and `dist/assets/*.js` files.
- Produces: `npm run test:pages`, which exits nonzero when production output contains root-relative `/assets/` URLs or lacks `/Portfolio/assets/` URLs.

- [ ] **Step 1: Create regression script**

```js
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const html = await readFile(path.join(distDir, "index.html"), "utf8");
const assetFiles = await readdir(path.join(distDir, "assets"));
const javascript = (
  await Promise.all(
    assetFiles
      .filter((file) => file.endsWith(".js"))
      .map((file) => readFile(path.join(distDir, "assets", file), "utf8")),
  )
).join("\n");
const productionOutput = `${html}\n${javascript}`;

assert.match(
  html,
  /(?:src|href)=["']\/Portfolio\/assets\//,
  "compiled HTML must load assets below /Portfolio/",
);
assert.doesNotMatch(
  productionOutput,
  /(["'`])\/assets\//,
  "production output must not contain root-relative /assets/ URLs",
);

console.log("GitHub Pages build paths are valid.");
```

- [ ] **Step 2: Add package command**

Add this entry after `preview` in `package.json`:

```json
"test:pages": "node scripts/check-pages-build.mjs"
```

Remember to add a comma after the existing `preview` entry.

- [ ] **Step 3: Build current code**

Run: `npm ci && npm run build`

Expected: build succeeds and produces `dist/`.

- [ ] **Step 4: Verify regression is red**

Run: `npm run test:pages`

Expected: FAIL with `compiled HTML must load assets below /Portfolio/` or `production output must not contain root-relative /assets/ URLs`.

**Anti-pattern guards:** Do not weaken the assertion to accept `/assets/`. Do not assert hashed filenames, because hashes legitimately change between builds.

### Task 2: Make Vite output project-site-safe

**Files:**
- Move: `assets/**` to `public/assets/**`
- Modify: `vite.config.js:4`
- Modify: `index.html:10-11,112-114`
- Modify: `src/data/projects.js:1-78`
- Test: `scripts/check-pages-build.mjs`

**Interfaces:**
- Consumes: Vite's documented `base` option, `%BASE_URL%` HTML replacement, and `import.meta.env.BASE_URL` JavaScript constant.
- Produces: `dist/` whose runtime URLs remain below `/Portfolio/`.

- [ ] **Step 1: Move static assets into Vite public directory**

Run:

```bash
git mv assets public/assets
```

Expected: Git records moves only; file contents remain unchanged.

- [ ] **Step 2: Set Vite public base**

Add `base` before `plugins` in `vite.config.js`:

```js
export default defineConfig({
  base: "/Portfolio/",
  plugins: [tailwindcss()],
```

- [ ] **Step 3: Make HTML static URLs explicit**

Replace favicon and profile paths in `index.html` with:

```html
<link rel="icon" href="%BASE_URL%assets/brand/favicon.svg" type="image/svg+xml" />
<link rel="alternate icon" href="%BASE_URL%assets/brand/icon.png" type="image/png" />
```

```html
src="%BASE_URL%assets/profile/avatar.png"
alt="Foto de perfil de Marcos"
```

- [ ] **Step 4: Make generated project URLs base-aware**

Add at top of `src/data/projects.js`:

```js
const projectAsset = (filename) => `${import.meta.env.BASE_URL}assets/projects/${filename}`;
```

Replace each project `image` value with this form:

```js
image: projectAsset("aplicativo-mobile.svg"),
```

Apply same call to `teste-animacoes.svg`, `prompt-calculadora.svg`, `projeto-financias.svg`, `projeto-vue.svg`, `ecommerce.svg`, and `portfolio.svg`.

- [ ] **Step 5: Build corrected code**

Run: `npm run build`

Expected: build succeeds without unresolved local asset warnings.

- [ ] **Step 6: Verify regression is green**

Run: `npm run test:pages`

Expected: PASS with `GitHub Pages build paths are valid.`

- [ ] **Step 7: Inspect production references**

Run:

```powershell
Select-String -Path dist/index.html,dist/assets/*.js -Pattern '(["''`])/assets/'
Select-String -Path dist/index.html -Pattern '/Portfolio/assets/'
```

Expected: first command returns no matches; second returns compiled asset references.

- [ ] **Step 8: Remove generated build changes from commit scope**

Run:

```bash
git restore --worktree dist
```

Expected: `dist/` matches repository baseline; source, public assets, test, and configuration remain modified.

- [ ] **Step 9: Commit build-path fix**

```bash
git add -A -- assets public/assets
git add package.json scripts/check-pages-build.mjs vite.config.js index.html src/data/projects.js
git commit -m "fix: build portfolio for GitHub Pages"
```

Expected: one focused commit; `git status --short` is clean.

**Documentation references:** [Vite shared `base` option](https://vite.dev/config/shared-options.html#base), [Vite public base path](https://vite.dev/guide/build#public-base-path), approved design `docs/superpowers/specs/2026-08-11-github-pages-deploy-design.md`.

**Anti-pattern guards:** Do not hardcode the repository base separately in every project object. Do not add a copy plugin. Do not commit regenerated `dist/`. Do not change GSAP or Three.js source.

### Task 3: Add tested Pages deployment workflow

**Files:**
- Create: `scripts/check-pages-workflow.mjs`
- Modify: `package.json`
- Create: `.github/workflows/deploy-pages.yml`
- Test: `scripts/check-pages-workflow.mjs`

**Interfaces:**
- Consumes: `npm ci`, `npm run build`, and the generated `dist/` directory.
- Produces: `npm run test:workflow` and a `github-pages` deployment from pushes to `main`.

- [ ] **Step 1: Create workflow contract test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(".github/workflows/deploy-pages.yml", "utf8");
const requiredFragments = [
  "actions/checkout@v7",
  "actions/setup-node@v7",
  "actions/configure-pages@v5",
  "actions/upload-pages-artifact@v4",
  "actions/deploy-pages@v4",
  "contents: read",
  "pages: write",
  "id-token: write",
  "path: ./dist",
  "name: github-pages",
  "needs: build",
];

for (const fragment of requiredFragments) {
  assert.ok(workflow.includes(fragment), `workflow must contain: ${fragment}`);
}

console.log("GitHub Pages workflow contract is valid.");
```

- [ ] **Step 2: Add workflow test command**

Add to `package.json` scripts:

```json
"test:workflow": "node scripts/check-pages-workflow.mjs"
```

- [ ] **Step 3: Verify workflow test is red**

Run: `npm run test:workflow`

Expected: FAIL with `ENOENT` because `.github/workflows/deploy-pages.yml` does not exist.

- [ ] **Step 4: Create official Pages workflow**

```yaml
name: Deploy Vite site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - name: Configure Pages
        uses: actions/configure-pages@v5
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Verify workflow test is green**

Run: `npm run test:workflow`

Expected: PASS with `GitHub Pages workflow contract is valid.`

- [ ] **Step 6: Run complete local verification**

Run:

```bash
npm run build
npm run test:pages
npm run test:workflow
git diff --check
```

Expected: all commands pass without warnings or whitespace errors.

- [ ] **Step 7: Restore generated `dist/` and commit workflow**

```bash
git restore --worktree dist
git add package.json scripts/check-pages-workflow.mjs .github/workflows/deploy-pages.yml
git commit -m "ci: deploy portfolio with GitHub Pages"
```

Expected: one focused commit; `git status --short` is clean.

**Documentation references:** [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [deploy-pages usage](https://github.com/actions/deploy-pages#usage), [setup-node usage](https://github.com/actions/setup-node#usage).

**Anti-pattern guards:** Do not combine build and deploy into an undocumented custom action. Do not grant `contents: write`. Do not omit `needs: build`, environment URL, or OIDC permission. Do not upload repository root.

### Task 4: Publish and enable Actions as Pages source

**Files:**
- External repository state: `MaxRbrt/Portfolio` `main` branch and Pages settings.

**Interfaces:**
- Consumes: two verified local commits after design commit `0dd23b7`.
- Produces: GitHub workflow run deploying to `https://maxrbrt.github.io/Portfolio/`.

- [ ] **Step 1: Review exact outgoing commits**

Run:

```bash
git log --oneline origin/main..HEAD
git diff --stat origin/main..HEAD
git status --short
```

Expected: design, build-path fix, and workflow commits only; clean worktree.

- [ ] **Step 2: Request action-time confirmation**

State exact external effects: push commits to public `MaxRbrt/Portfolio`, enable GitHub Actions as Pages source, and start public deployment. Wait for explicit confirmation.

- [ ] **Step 3: Push commits**

Run: `git push origin main`

Expected: remote `main` advances. If Git credentials are unavailable, apply same commits through authenticated GitHub UI; do not expose credentials or create tokens.

- [ ] **Step 4: Select GitHub Actions Pages source**

Open `https://github.com/MaxRbrt/Portfolio/settings/pages`, set **Source** to **GitHub Actions**, and verify setting persists.

- [ ] **Step 5: Observe deployment run**

Open repository Actions page and wait for `Deploy Vite site to Pages` to finish.

Expected: build and deploy jobs succeed; deployment reports `https://maxrbrt.github.io/Portfolio/`.

**Anti-pattern guards:** Do not force-push. Do not create or reveal a personal access token. Do not change repository visibility or custom domain settings.

### Task 5: Verify production behavior

**Files:**
- Read-only production site and browser state.

**Interfaces:**
- Consumes: deployed Pages URL.
- Produces: evidence that compiled JavaScript and animation runtime work.

- [ ] **Step 1: Load production site without cache dependency**

Open `https://maxrbrt.github.io/Portfolio/` and reload after deployment.

Expected: title remains `Marcos | Desenvolvedor Full Stack`; styles load immediately.

- [ ] **Step 2: Verify resource base and console**

Inspect loaded script and stylesheet URLs.

Expected: local resources start with `https://maxrbrt.github.io/Portfolio/assets/`; no console errors or 404 responses for `/src/main.js` or `/assets/`.

- [ ] **Step 3: Verify motion and 3D runtime**

Confirm:

- Hero title and reveal elements animate on load.
- Scroll-triggered service/project content reveals.
- Hero and lab canvases match rendered containers rather than default `300x150` fallback.
- Lab mode buttons update Three.js scene.
- Desktop project track animates horizontally where viewport qualifies.

- [ ] **Step 4: Verify static and interactive content**

Confirm icons render, project cards contain images, profile image resolves, mobile menu toggles, and service cards expand.

- [ ] **Step 5: Record final state**

Report deployed workflow status, public URL, and verification results. Mention any behavior intentionally skipped because current viewport does not qualify.

**Anti-pattern guards:** Do not submit contact form during verification. Do not infer animation success only from DOM presence; observe state change or runtime sizing.

## Final Verification Checklist

- [ ] `npm run build` passes.
- [ ] `npm run test:pages` passes.
- [ ] `npm run test:workflow` passes.
- [ ] `git diff --check` passes.
- [ ] Production resources use `/Portfolio/assets/`.
- [ ] GitHub Actions build and deployment jobs pass.
- [ ] GSAP and Three.js behavior is visible in production.
- [ ] No unrelated source, visual, visibility, domain, or form changes were made.
