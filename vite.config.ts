import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// ============================================================
// 1. CONFIGURAÇÃO DO VITE
// Repositório de projeto no GitHub Pages: o site vive em
// https://maxrbrt.github.io/Portfolio/, por isso a base.
// ============================================================
export default defineConfig({
  base: "/Portfolio/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
