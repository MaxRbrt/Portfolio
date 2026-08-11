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
