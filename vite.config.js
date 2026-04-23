import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "vendor-3d";
          if (id.includes("node_modules/gsap")) return "vendor-motion";
          if (id.includes("node_modules/lucide")) return "vendor-icons";
          return undefined;
        },
      },
    },
  },
});
