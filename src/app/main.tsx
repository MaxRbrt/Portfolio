import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter-tight";
import "@fontsource/ibm-plex-mono/400.css";
import "../styles/index.css";
import { App } from "./App";

// ============================================================
// 1. PONTO DE ENTRADA
// ============================================================
const elementoRaiz = document.getElementById("root");

if (!elementoRaiz) {
  throw new Error('Elemento "#root" não encontrado no index.html: esperado <div id="root">');
}

createRoot(elementoRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
