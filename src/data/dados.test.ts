import { describe, expect, it } from "vitest";
import { perfil } from "./perfil";
import { projetos } from "./projetos";
import { gruposStack } from "./stack";
import { trajetoria } from "./trajetoria";

const linkSeguro = /^https:\/\//;

describe("dados do portfólio", () => {
  it("projetos têm ids únicos", () => {
    const ids = projetos.map((projeto) => projeto.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links de projeto usam https", () => {
    const links = projetos.flatMap((projeto) => [projeto.site, projeto.codigo]);
    const preenchidos = links.filter((link): link is string => Boolean(link));
    preenchidos.forEach((link) => expect(link).toMatch(linkSeguro));
  });

  it("projeto da vitrine tem imagem com descrição", () => {
    const vitrine = projetos.filter((projeto) => projeto.vitrine);
    expect(vitrine.length).toBeGreaterThanOrEqual(4);
    vitrine.forEach((projeto) => {
      expect(projeto.imagem).toBeTruthy();
      expect(projeto.descricaoImagem).toBeTruthy();
    });
  });

  it("trajetória não tem texto vazio", () => {
    expect(trajetoria.length).toBeGreaterThan(0);
    trajetoria.forEach((etapa) => {
      Object.values(etapa).forEach((valor) => expect(valor.trim()).not.toBe(""));
    });
  });

  it("perfil tem contatos válidos", () => {
    expect(perfil.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(perfil.linkedin).toMatch(linkSeguro);
    expect(perfil.github).toMatch(linkSeguro);
  });

  it("stack não repete tecnologia entre grupos", () => {
    const todas = gruposStack.flatMap((grupo) => grupo.itens);
    expect(new Set(todas).size).toBe(todas.length);
  });
});
