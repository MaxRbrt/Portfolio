import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { etapasDaCidade, etapasDoBeco } from "./estadoCidade";
import { medirIndustria } from "./estadoIndustria";
import { CAMADA_DA_GALERIA, estadoPalco } from "./estadoPalco";
import { calcularFatorDeAmortecimento, ponteiroCena } from "./ponteiroCena";
import { fragmentoCidade, verticeCidade } from "./shadersCidade";
import {
  carregarTexturaDeAmbiente,
  enderecoDoAmbiente,
  lerAspectoDaTextura,
} from "./texturasAmbiente";

const SELETOR_CIDADE = "#trajetoria";
const SELETOR_CONTATO = "#contato";
const NOMES_DAS_CENAS = ["cidade-1", "cidade-3", "contato-1", "contato-faiscas"];
const ORDEM_ABAIXO_DA_INDUSTRIA = 8;
const RIGIDEZ_DA_PARALAXE = 3;

type SessaoCidade = {
  texturas: THREE.Texture[] | null;
  desfeita: boolean;
};

type GavetaCidade = { atual: SessaoCidade | null };

type QuadroCidade = {
  largura: number;
  altura: number;
  tempo: number;
  delta: number;
};

// ============================================================
// 1. TEXTURAS
// Cânion, vista de cima, beco e faíscas (estas em repetição).
// ============================================================
function carregarTexturasDaCidade() {
  return Promise.all(
    NOMES_DAS_CENAS.map((nome) =>
      carregarTexturaDeAmbiente(enderecoDoAmbiente(nome), nome === "contato-faiscas"),
    ),
  );
}

function marcarSecoes(valor: string) {
  [SELETOR_CIDADE, SELETOR_CONTATO].forEach((seletor) => {
    const secao = document.querySelector<HTMLElement>(seletor);
    if (secao) {
      secao.dataset.ambiente = valor;
    }
  });
}

// ============================================================
// 2. PLANO
// ============================================================
function criarMalhaDaCidade(geometria: THREE.PlaneGeometry) {
  const material = new THREE.ShaderMaterial({
    vertexShader: verticeCidade,
    fragmentShader: fragmentoCidade,
    uniforms: {
      uCanion: { value: null },
      uVista: { value: null },
      uFotoBeco: { value: null },
      uFaiscas: { value: null },
      uAspectoCena: { value: 16 / 9 },
      uTamanhoEmPixels: { value: new THREE.Vector2(1, 1) },
      uZoomCanion: { value: 1 },
      uBranco: { value: 0 },
      uMostraVista: { value: 0 },
      uDescida: { value: 0 },
      uBloco: { value: 0 },
      uBeco: { value: 0 },
      uRuido: { value: 0 },
      uTextoCanion: { value: 0 },
      uPonteiro: { value: new THREE.Vector2() },
      uTempo: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const malha = new THREE.Mesh(geometria, material);
  malha.layers.set(CAMADA_DA_GALERIA);
  malha.renderOrder = ORDEM_ABAIXO_DA_INDUSTRIA;
  malha.frustumCulled = false;
  malha.visible = false;
  return malha;
}

function aplicarTexturas(material: THREE.ShaderMaterial, texturas: THREE.Texture[]) {
  const uniforms = material.uniforms;
  const [canion, vista, beco, faiscas] = texturas;
  uniforms.uCanion.value = canion;
  uniforms.uVista.value = vista;
  uniforms.uFotoBeco.value = beco;
  uniforms.uFaiscas.value = faiscas;
  uniforms.uAspectoCena.value = lerAspectoDaTextura(canion);
}

// ============================================================
// 3. SESSÃO (STRICTMODE MONTA DUAS VEZES)
// ============================================================
function abrirSessaoDaCidade(gaveta: GavetaCidade) {
  const sessao: SessaoCidade = { texturas: null, desfeita: false };
  gaveta.atual = sessao;
  return sessao;
}

async function montarCidade(sessao: SessaoCidade, material: THREE.ShaderMaterial) {
  const texturas = await carregarTexturasDaCidade();
  if (sessao.desfeita) {
    texturas.forEach((textura) => textura.dispose());
    return;
  }
  sessao.texturas = texturas;
  aplicarTexturas(material, texturas);
  marcarSecoes("webgl");
}

function desfazerCidade(gaveta: GavetaCidade, sessao: SessaoCidade) {
  sessao.desfeita = true;
  sessao.texturas?.forEach((textura) => textura.dispose());
  if (gaveta.atual === sessao) {
    gaveta.atual = null;
  }
  estadoPalco.cidadeCobre = false;
  marcarSecoes("");
}

// ============================================================
// 4. QUADRO A QUADRO
// A cidade aparece por baixo da Indústria que sobe e fica em
// tela cheia até o fim da página. O avanço da #trajetoria conduz
// cânion, vista e bloco; a chegada do #contato troca o vermelho
// pelo beco e o fim dele desfaz tudo em ruído.
// ============================================================
function medirSecao(seletor: string, altura: number) {
  const secao = document.querySelector<HTMLElement>(seletor);
  if (!secao) {
    return null;
  }
  const retangulo = secao.getBoundingClientRect();
  return medirIndustria(retangulo.top, retangulo.bottom, retangulo.height, altura);
}

function seguirPonteiro(material: THREE.ShaderMaterial, delta: number) {
  const ponteiro = material.uniforms.uPonteiro.value as THREE.Vector2;
  const fator = calcularFatorDeAmortecimento(RIGIDEZ_DA_PARALAXE, delta);
  const alvoX = ponteiroCena.ativo ? ponteiroCena.x : 0;
  const alvoY = ponteiroCena.ativo ? -ponteiroCena.y : 0;
  ponteiro.x += (alvoX - ponteiro.x) * fator;
  ponteiro.y += (alvoY - ponteiro.y) * fator;
}

function aplicarEtapas(material: THREE.ShaderMaterial, avanco: number, entrada: number) {
  const uniforms = material.uniforms;
  const etapas = etapasDaCidade(avanco);
  const aindaNoCanion = etapas.vista === 0 ? 1 : 0;
  uniforms.uZoomCanion.value = etapas.zoomCanion;
  uniforms.uBranco.value = etapas.branco;
  uniforms.uMostraVista.value = etapas.vista;
  uniforms.uDescida.value = etapas.descida;
  uniforms.uBloco.value = etapas.bloco;
  uniforms.uTextoCanion.value = entrada * aindaNoCanion * (1 - etapas.branco);
}

function atualizarCidade(
  malha: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>,
  pronta: boolean,
  quadro: QuadroCidade,
) {
  const cidade = pronta ? medirSecao(SELETOR_CIDADE, quadro.altura) : null;
  const naTela = Boolean(cidade && cidade.crescimento > 0);
  malha.visible = naTela;
  estadoPalco.cidadeCobre = naTela && cidade !== null && cidade.crescimento >= 1;
  if (!naTela || !cidade) {
    return;
  }
  const material = malha.material;
  const uniforms = material.uniforms;
  const contato = medirSecao(SELETOR_CONTATO, quadro.altura);
  const beco = etapasDoBeco(contato?.crescimento ?? 0, contato?.avanco ?? 0);
  aplicarEtapas(material, cidade.avanco, cidade.crescimento);
  seguirPonteiro(material, quadro.delta);
  (uniforms.uTamanhoEmPixels.value as THREE.Vector2).set(quadro.largura, quadro.altura);
  uniforms.uBeco.value = beco.beco;
  uniforms.uRuido.value = beco.ruido;
  uniforms.uTempo.value = quadro.tempo;
}

// ============================================================
// 5. COMPONENTE
// Camada 1, abaixo da Indústria. Até as texturas chegarem, as
// seções mostram as fotos HTML.
// ============================================================
export default function CenaCidade() {
  const geometria = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const malha = useMemo(() => criarMalhaDaCidade(geometria), [geometria]);
  const gaveta = useMemo<GavetaCidade>(() => ({ atual: null }), []);

  useEffect(() => {
    const sessao = abrirSessaoDaCidade(gaveta);
    montarCidade(sessao, malha.material).catch((erro: unknown) => console.error(erro));
    return () => desfazerCidade(gaveta, sessao);
  }, [gaveta, malha]);

  useEffect(() => {
    return () => {
      malha.material.dispose();
      geometria.dispose();
    };
  }, [malha, geometria]);

  useFrame((estado, delta) => {
    const pronta = Boolean(gaveta.atual?.texturas);
    atualizarCidade(malha, pronta, {
      largura: estado.size.width,
      altura: estado.size.height,
      tempo: estado.clock.elapsedTime,
      delta,
    });
  });

  return <primitive object={malha} />;
}
