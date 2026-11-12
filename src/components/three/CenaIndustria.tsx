import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { medirIndustria, pesosDasCenas } from "./estadoIndustria";
import {
  CAMADA_DA_GALERIA,
  converterRetanguloParaTela,
  estadoPalco,
  SELETOR_QUADRO_GALERIA,
} from "./estadoPalco";
import { fragmentoIndustria, verticeIndustria } from "./shadersIndustria";
import {
  carregarTexturaDeAmbiente,
  enderecoDoAmbiente,
  lerAspectoDaTextura,
} from "./texturasAmbiente";

const SELETOR_INDUSTRIA = "#sobre";
const SELETOR_PALCO_DA_GALERIA = "[data-palco-galeria]";
const NOMES_DAS_CENAS = ["industrial-1", "industrial-2", "industrial-3", "industrial-luzes"];
const ORDEM_POR_CIMA_DA_GALERIA = 10;
const RAIO_DO_CANTO = 0;
const MEIO_DA_TELA = new THREE.Vector2(0, 0);
const TELA_CHEIA = new THREE.Vector2(2.02, 2.02);
const TELA_EM_PIXELS = new THREE.Vector2();

type TexturasIndustria = {
  projeto: THREE.Texture;
  cenas: THREE.Texture[];
};

type SessaoIndustria = {
  texturas: TexturasIndustria | null;
  desfeita: boolean;
};

type GavetaIndustria = { atual: SessaoIndustria | null };

// ============================================================
// 1. TEXTURAS
// As três fotos e as luzes em 1376 px. A imagem do último
// projeto sai do quadro HTML (já no cache); sem galeria, a
// primeira foto da fábrica entra no lugar.
// ============================================================
function lerEnderecoDoUltimoProjeto() {
  const quadros = document.querySelectorAll<HTMLElement>(SELETOR_QUADRO_GALERIA);
  const imagem = quadros[quadros.length - 1]?.querySelector("img");
  return imagem?.currentSrc || imagem?.src || null;
}

async function carregarTexturas(): Promise<TexturasIndustria> {
  const enderecos = NOMES_DAS_CENAS.map(enderecoDoAmbiente);
  const enderecoDoProjeto = lerEnderecoDoUltimoProjeto() ?? enderecos[0];
  const [projeto, ...cenas] = await Promise.all(
    [enderecoDoProjeto, ...enderecos].map((endereco) => carregarTexturaDeAmbiente(endereco)),
  );
  return { projeto, cenas };
}

function descartarTexturas(texturas: TexturasIndustria) {
  texturas.projeto.dispose();
  texturas.cenas.forEach((textura) => textura.dispose());
}

// ============================================================
// 2. PLANO
// ============================================================
function criarMalhaDaIndustria(geometria: THREE.PlaneGeometry) {
  const material = new THREE.ShaderMaterial({
    vertexShader: verticeIndustria,
    fragmentShader: fragmentoIndustria,
    uniforms: {
      uProjeto: { value: null },
      uCena1: { value: null },
      uCena2: { value: null },
      uCena3: { value: null },
      uLuzes: { value: null },
      uPesos: { value: new THREE.Vector3(1, 0, 0) },
      uAspectoProjeto: { value: 1440 / 846 },
      uAspectoCena: { value: 16 / 9 },
      uCentro: { value: new THREE.Vector2() },
      uTamanho: { value: new THREE.Vector2(2, 2) },
      uTamanhoEmPixels: { value: new THREE.Vector2(1, 1) },
      uRaioEmPixels: { value: RAIO_DO_CANTO },
      uCrescimento: { value: 0 },
      uAvanco: { value: 0 },
      uSaida: { value: 0 },
      uTempo: { value: 0 },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const malha = new THREE.Mesh(geometria, material);
  malha.layers.set(CAMADA_DA_GALERIA);
  malha.renderOrder = ORDEM_POR_CIMA_DA_GALERIA;
  malha.frustumCulled = false;
  malha.visible = false;
  return malha;
}

function aplicarTexturas(material: THREE.ShaderMaterial, texturas: TexturasIndustria) {
  const uniforms = material.uniforms;
  const [cena1, cena2, cena3, luzes] = texturas.cenas;
  uniforms.uProjeto.value = texturas.projeto;
  uniforms.uCena1.value = cena1;
  uniforms.uCena2.value = cena2;
  uniforms.uCena3.value = cena3;
  uniforms.uLuzes.value = luzes;
  uniforms.uAspectoProjeto.value = lerAspectoDaTextura(texturas.projeto);
  uniforms.uAspectoCena.value = lerAspectoDaTextura(cena1);
}

// ============================================================
// 3. SESSÃO (STRICTMODE MONTA DUAS VEZES)
// ============================================================
function abrirSessaoDaIndustria(gaveta: GavetaIndustria) {
  const sessao: SessaoIndustria = { texturas: null, desfeita: false };
  gaveta.atual = sessao;
  return sessao;
}

async function montarIndustria(sessao: SessaoIndustria, material: THREE.ShaderMaterial) {
  const texturas = await carregarTexturas();
  if (sessao.desfeita) {
    descartarTexturas(texturas);
    return;
  }
  sessao.texturas = texturas;
  aplicarTexturas(material, texturas);
  const secao = document.querySelector<HTMLElement>(SELETOR_INDUSTRIA);
  if (secao) {
    secao.dataset.industria = "webgl";
  }
}

function desfazerIndustria(gaveta: GavetaIndustria, sessao: SessaoIndustria) {
  sessao.desfeita = true;
  if (sessao.texturas) {
    descartarTexturas(sessao.texturas);
  }
  if (gaveta.atual === sessao) {
    gaveta.atual = null;
  }
  estadoPalco.expansao = 0;
  estadoPalco.industriaCobre = false;
  const secao = document.querySelector<HTMLElement>(SELETOR_INDUSTRIA);
  if (secao) {
    secao.dataset.industria = "";
  }
}

// ============================================================
// 4. QUADRO A QUADRO
// O plano parte do último cartão da galeria e vai até a tela
// cheia (curva suave nas duas pontas). A origem é o cartão no
// palco preso: quando o palco solta e sobe com a página, o
// deslocamento dele é descontado e o plano cresce do mesmo lugar.
// ============================================================
function suavizarCrescimento(valor: number) {
  return valor < 0.5 ? 4 * valor ** 3 : 1 - (-2 * valor + 2) ** 3 / 2;
}

function medirSubidaDoPalco() {
  const palco = document.querySelector<HTMLElement>(SELETOR_PALCO_DA_GALERIA);
  return palco ? palco.getBoundingClientRect().top : 0;
}

function lerRetanguloDeOrigem(largura: number, altura: number) {
  const quadros = document.querySelectorAll<HTMLElement>(SELETOR_QUADRO_GALERIA);
  const ultimo = quadros[quadros.length - 1];
  const retangulo = ultimo?.getBoundingClientRect();
  if (!retangulo || retangulo.width === 0) {
    return { tela: { centroX: 0, centroY: 0, largura: 2, altura: 2 }, largura, altura };
  }
  const noPalcoPreso = {
    left: retangulo.left,
    top: retangulo.top - medirSubidaDoPalco(),
    width: retangulo.width,
    height: retangulo.height,
  };
  return {
    tela: converterRetanguloParaTela(noPalcoPreso, largura, altura),
    largura: retangulo.width,
    altura: retangulo.height,
  };
}

function posicionarPlano(
  material: THREE.ShaderMaterial,
  crescimento: number,
  largura: number,
  altura: number,
) {
  const uniforms = material.uniforms;
  const origem = lerRetanguloDeOrigem(largura, altura);
  const centro = uniforms.uCentro.value as THREE.Vector2;
  const tamanho = uniforms.uTamanho.value as THREE.Vector2;
  const tamanhoEmPixels = uniforms.uTamanhoEmPixels.value as THREE.Vector2;
  centro.set(origem.tela.centroX, origem.tela.centroY).lerp(MEIO_DA_TELA, crescimento);
  tamanho.set(origem.tela.largura, origem.tela.altura).lerp(TELA_CHEIA, crescimento);
  TELA_EM_PIXELS.set(largura, altura);
  tamanhoEmPixels.set(origem.largura, origem.altura).lerp(TELA_EM_PIXELS, crescimento);
  uniforms.uCrescimento.value = crescimento;
}

function atualizarIndustria(
  malha: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>,
  pronta: boolean,
  largura: number,
  altura: number,
  tempo: number,
) {
  const secao = document.querySelector<HTMLElement>(SELETOR_INDUSTRIA);
  if (!pronta || !secao) {
    malha.visible = false;
    return;
  }
  const retangulo = secao.getBoundingClientRect();
  const medidas = medirIndustria(retangulo.top, retangulo.bottom, retangulo.height, altura);
  const naTela = medidas.crescimento > 0 && medidas.saida < 1;
  malha.visible = naTela;
  estadoPalco.expansao = naTela ? medidas.crescimento : 0;
  estadoPalco.industriaCobre = naTela && medidas.crescimento >= 1;
  if (!naTela) {
    return;
  }
  const uniforms = malha.material.uniforms;
  posicionarPlano(malha.material, suavizarCrescimento(medidas.crescimento), largura, altura);
  (uniforms.uPesos.value as THREE.Vector3).fromArray(pesosDasCenas(medidas.avanco));
  uniforms.uAvanco.value = medidas.avanco;
  uniforms.uSaida.value = medidas.saida;
  uniforms.uTempo.value = tempo;
}

// ============================================================
// 5. COMPONENTE
// Camada 1, desenhado pela ComposicaoCena depois da galeria.
// Até as texturas chegarem, a seção mostra as imagens HTML.
// ============================================================
export default function CenaIndustria() {
  const geometria = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const malha = useMemo(() => criarMalhaDaIndustria(geometria), [geometria]);
  const gaveta = useMemo<GavetaIndustria>(() => ({ atual: null }), []);

  useEffect(() => {
    const sessao = abrirSessaoDaIndustria(gaveta);
    montarIndustria(sessao, malha.material).catch((erro: unknown) => console.error(erro));
    return () => desfazerIndustria(gaveta, sessao);
  }, [gaveta, malha]);

  useEffect(() => {
    return () => {
      malha.material.dispose();
      geometria.dispose();
    };
  }, [malha, geometria]);

  useFrame((estado) => {
    const { width: largura, height: altura } = estado.size;
    const pronta = Boolean(gaveta.atual?.texturas);
    atualizarIndustria(malha, pronta, largura, altura, estado.clock.elapsedTime);
  });

  return <primitive object={malha} />;
}
