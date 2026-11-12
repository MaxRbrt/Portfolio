import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  CAMADA_DA_GALERIA,
  converterRetanguloParaTela,
  calcularSubidaDaFolha,
  estadoPalco,
  galeriaEstaNaTela,
  SELETOR_QUADRO_GALERIA,
} from "./estadoPalco";
import { fragmentoGaleria, verticeGaleria } from "./shadersGaleria";
import { carregarTexturaDeAmbiente } from "./texturasAmbiente";

const SELETOR_GALERIA = "#projetos";
const RAIO_DO_CANTO = 0;

type QuadroGaleria = {
  elemento: HTMLElement;
  malha: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  textura: THREE.Texture;
};

type MemoriaGaleria = {
  quadros: QuadroGaleria[];
  desfeita: boolean;
};

type GavetaGaleria = { atual: MemoriaGaleria | null };

// ============================================================
// 1. PLANO DE CADA IMAGEM
// A textura sai da própria imagem HTML (mesmo arquivo, já no
// cache do navegador). Cor crua, sem conversão: o shader só
// repassa a cor da imagem.
// ============================================================
function lerEnderecoDaImagem(elemento: HTMLElement) {
  const imagem = elemento.querySelector("img");
  const endereco = imagem?.currentSrc || imagem?.src;
  if (!endereco) {
    throw new Error(`Quadro "${elemento.id || elemento.className}" sem imagem: esperado <img src>`);
  }
  return endereco;
}

function criarMalhaDoQuadro(textura: THREE.Texture, geometria: THREE.PlaneGeometry) {
  const material = new THREE.ShaderMaterial({
    vertexShader: verticeGaleria,
    fragmentShader: fragmentoGaleria,
    uniforms: {
      uImagem: { value: textura },
      uCentro: { value: new THREE.Vector2() },
      uTamanho: { value: new THREE.Vector2(1, 1) },
      uTamanhoEmPixels: { value: new THREE.Vector2(1, 1) },
      uRaioEmPixels: { value: RAIO_DO_CANTO },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const malha = new THREE.Mesh(geometria, material);
  malha.layers.set(CAMADA_DA_GALERIA);
  malha.frustumCulled = false;
  malha.visible = false;
  return malha;
}

async function carregarQuadro(elemento: HTMLElement, geometria: THREE.PlaneGeometry) {
  const textura = await carregarTexturaDeAmbiente(lerEnderecoDaImagem(elemento));
  return { elemento, textura, malha: criarMalhaDoQuadro(textura, geometria) };
}

// ============================================================
// 2. MONTAGEM E LIMPEZA
// Só troca as imagens HTML pelas do WebGL quando todas chegam.
// Erro em qualquer uma: fica tudo em HTML.
// ============================================================
async function montarQuadros(
  memoria: MemoriaGaleria,
  grupo: THREE.Group,
  geometria: THREE.PlaneGeometry,
) {
  const secao = document.querySelector<HTMLElement>(SELETOR_GALERIA);
  const elementos = Array.from(document.querySelectorAll<HTMLElement>(SELETOR_QUADRO_GALERIA));
  if (!secao || elementos.length === 0) {
    return;
  }
  const quadros = await Promise.all(
    elementos.map((elemento) => carregarQuadro(elemento, geometria)),
  );
  if (memoria.desfeita) {
    quadros.forEach(descartarQuadro);
    return;
  }
  memoria.quadros = quadros;
  quadros.forEach((quadro) => grupo.add(quadro.malha));
  secao.dataset.galeria = "webgl";
}

function descartarQuadro(quadro: QuadroGaleria) {
  quadro.malha.removeFromParent();
  quadro.malha.material.dispose();
  quadro.textura.dispose();
}

function abrirSessaoDaGaleria(gaveta: GavetaGaleria) {
  const memoria: MemoriaGaleria = { quadros: [], desfeita: false };
  gaveta.atual = memoria;
  return memoria;
}

function desfazerGaleria(gaveta: GavetaGaleria, memoria: MemoriaGaleria) {
  memoria.desfeita = true;
  memoria.quadros.forEach(descartarQuadro);
  memoria.quadros = [];
  if (gaveta.atual === memoria) {
    gaveta.atual = null;
  }
  estadoPalco.subida = 0;
  estadoPalco.galeriaNaTela = false;
  const secao = document.querySelector<HTMLElement>(SELETOR_GALERIA);
  if (secao) {
    secao.dataset.galeria = "";
  }
}

// ============================================================
// 3. QUADRO A QUADRO
// Lê a posição da galeria e de cada quadro HTML (já com a
// rolagem suave aplicada) e leva para o palco e os planos.
// ============================================================
function atualizarPalco(altura: number) {
  const secao = document.querySelector<HTMLElement>(SELETOR_GALERIA);
  if (!secao) {
    return;
  }
  const retangulo = secao.getBoundingClientRect();
  estadoPalco.galeriaNaTela = galeriaEstaNaTela(retangulo.top, retangulo.bottom, altura);
  estadoPalco.subida = calcularSubidaDaFolha(retangulo.top, altura);
}

function posicionarQuadro(
  quadro: QuadroGaleria,
  largura: number,
  altura: number,
  viraIndustria: boolean,
) {
  const retangulo = quadro.elemento.getBoundingClientRect();
  const naTela = galeriaEstaNaTela(retangulo.top, retangulo.bottom, altura);
  const trocadoPelaIndustria = viraIndustria && estadoPalco.expansao > 0;
  quadro.malha.visible = naTela && !trocadoPelaIndustria;
  if (!quadro.malha.visible) {
    return;
  }
  const posicao = converterRetanguloParaTela(retangulo, largura, altura);
  const uniforms = quadro.malha.material.uniforms;
  (uniforms.uCentro.value as THREE.Vector2).set(posicao.centroX, posicao.centroY);
  (uniforms.uTamanho.value as THREE.Vector2).set(posicao.largura, posicao.altura);
  (uniforms.uTamanhoEmPixels.value as THREE.Vector2).set(retangulo.width, retangulo.height);
}

// ============================================================
// 4. COMPONENTE
// Os planos ficam na camada 1, desenhados pela ComposicaoCena
// por cima do fundo escuro. O último some quando a CenaIndustria
// assume o lugar dele e cresce.
// ============================================================
export default function GaleriaCurva() {
  const grupo = useMemo(() => new THREE.Group(), []);
  const geometria = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const gaveta = useMemo<GavetaGaleria>(() => ({ atual: null }), []);

  useEffect(() => {
    const memoria = abrirSessaoDaGaleria(gaveta);
    montarQuadros(memoria, grupo, geometria).catch((erro: unknown) => console.error(erro));
    return () => desfazerGaleria(gaveta, memoria);
  }, [gaveta, grupo, geometria]);

  useEffect(() => {
    return () => geometria.dispose();
  }, [geometria]);

  useFrame((estado) => {
    const memoria = gaveta.atual;
    if (!memoria) {
      return;
    }
    const { width: largura, height: altura } = estado.size;
    atualizarPalco(altura);
    if (!estadoPalco.galeriaNaTela) {
      memoria.quadros.forEach((quadro) => {
        quadro.malha.visible = false;
      });
      return;
    }
    const ultimo = memoria.quadros.length - 1;
    memoria.quadros.forEach((quadro, indice) =>
      posicionarQuadro(quadro, largura, altura, indice === ultimo),
    );
  });

  return <primitive object={grupo} />;
}
