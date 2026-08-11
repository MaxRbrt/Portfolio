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
