import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COM_MOVIMENTO } from "../../hooks/useMidia";
import { prenderNaSecao, reordenarGatilhos } from "./palcoPreso";
import {
  desfazerTextoAnimado,
  esconderTextoAnimado,
  mostrarTextoAnimado,
  prepararTextoAnimado,
  type TextoAnimado,
} from "./textoAnimado";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ENTRADA_DA_FICHA = { duracao: 760, intervalo: 70, subida: 22 };
const TROCA_DE_CARTAO = {
  parado: 0.3,
  atrasoDaEntrada: 0.12,
  distanciaEmPorcento: 210,
  encolhido: 0.56,
  esticaoX: 1.12,
  esticaoY: 0.9,
  passaDoPonto: -4,
};

type FichaAnimada = {
  artigo: HTMLElement;
  texto: TextoAnimado;
  itemDaLista: HTMLElement | null;
};

type EstadoDoCarrossel = {
  fichas: FichaAnimada[];
  atual: number;
  visivel: boolean;
};

// ============================================================
// 1. FICHA DO PROJETO ATUAL
// O cartão inteiro entra junto com as linhas, para nunca
// aparecer cartão vazio. O nome fica marcado na lista. Ao sair,
// a ficha some de uma vez.
// ============================================================
function marcarFichaAtiva(ficha: FichaAnimada, ativa: boolean) {
  if (ativa) {
    ficha.artigo.dataset.ativo = "true";
    ficha.itemDaLista?.setAttribute("aria-current", "true");
    return;
  }
  delete ficha.artigo.dataset.ativo;
  ficha.itemDaLista?.removeAttribute("aria-current");
}

function mostrarFicha(ficha: FichaAnimada) {
  marcarFichaAtiva(ficha, true);
  mostrarTextoAnimado(ficha.texto);
}

function esconderFicha(ficha: FichaAnimada) {
  marcarFichaAtiva(ficha, false);
  esconderTextoAnimado(ficha.texto);
}

function desfazerFicha(ficha: FichaAnimada) {
  marcarFichaAtiva(ficha, false);
  desfazerTextoAnimado(ficha.texto);
}

function prepararFicha(artigo: HTMLElement, secao: HTMLElement): FichaAnimada {
  const cartaoDaFicha = artigo.querySelector<HTMLElement>(".projeto-ficha");
  const linhasDoTexto = Array.from(artigo.querySelectorAll<HTMLElement>("[data-linha-ficha]"));
  const linhas = cartaoDaFicha ? [cartaoDaFicha, ...linhasDoTexto] : linhasDoTexto;
  const itemDaLista = secao.querySelector<HTMLElement>(
    `[data-indice-galeria="${artigo.dataset.projeto}"]`,
  );
  return { artigo, texto: prepararTextoAnimado(linhas, ENTRADA_DA_FICHA), itemDaLista };
}

// ============================================================
// 2. PROJETO ATUAL PELA ROLAGEM
// A troca da ficha acontece no meio da passagem de um cartão
// para o seguinte.
// ============================================================
export function calcularProjetoAtual(progresso: number, quantidade: number) {
  if (!(quantidade > 0)) {
    throw new Error(`Quantidade de projetos "${quantidade}" inválida: esperado número maior que 0`);
  }
  const progressoLimitado = Math.min(1, Math.max(0, progresso));
  return Math.round(progressoLimitado * (quantidade - 1));
}

function trocarFichaAtual(estado: EstadoDoCarrossel, novoAtual: number) {
  if (novoAtual === estado.atual) {
    return;
  }
  const anterior = estado.fichas[estado.atual];
  estado.atual = novoAtual;
  if (!estado.visivel) {
    return;
  }
  esconderFicha(anterior);
  mostrarFicha(estado.fichas[novoAtual]);
}

function alternarFichaVisivel(estado: EstadoDoCarrossel, visivel: boolean) {
  estado.visivel = visivel;
  const ficha = estado.fichas[estado.atual];
  if (visivel) {
    mostrarFicha(ficha);
    return;
  }
  esconderFicha(ficha);
}

// ============================================================
// 3. TROCA ELÁSTICA DOS CARTÕES
// Cada trecho da rolagem passa de um projeto para o seguinte. O
// atual encolhe e sai pela esquerda, esticando na horizontal como
// elástico; o próximo vem da direita, passa um pouco do ponto e
// volta com mola. O plano WebGL segue o retângulo do quadro.
// ============================================================
function prepararCartoesForaDaTela(quadros: HTMLElement[]) {
  quadros.forEach((quadro, indice) => {
    const naFila = indice > 0;
    gsap.set(quadro, {
      xPercent: naFila ? TROCA_DE_CARTAO.distanciaEmPorcento : 0,
      scaleX: naFila ? TROCA_DE_CARTAO.encolhido : 1,
      scaleY: naFila ? TROCA_DE_CARTAO.encolhido : 1,
    });
  });
}

function tirarCartaoPelaEsquerda(linha: gsap.core.Timeline, quadro: HTMLElement, inicio: number) {
  const duracao = 1 - TROCA_DE_CARTAO.parado;
  const encolhido = TROCA_DE_CARTAO.encolhido;
  linha.to(
    quadro,
    {
      keyframes: {
        xPercent: [0, -24, -TROCA_DE_CARTAO.distanciaEmPorcento],
        scaleX: [1, TROCA_DE_CARTAO.esticaoX, encolhido],
        scaleY: [1, TROCA_DE_CARTAO.esticaoY, encolhido],
        easeEach: "sine.inOut",
      },
      ease: "power2.in",
      duration: duracao,
    },
    inicio,
  );
}

function trazerCartaoPelaDireita(linha: gsap.core.Timeline, quadro: HTMLElement, inicio: number) {
  const duracao = 1 - TROCA_DE_CARTAO.parado - TROCA_DE_CARTAO.atrasoDaEntrada;
  const chegada = inicio + TROCA_DE_CARTAO.atrasoDaEntrada;
  linha.to(
    quadro,
    {
      xPercent: TROCA_DE_CARTAO.passaDoPonto,
      scaleX: TROCA_DE_CARTAO.esticaoX,
      scaleY: TROCA_DE_CARTAO.esticaoY,
      ease: "power3.out",
      duration: duracao * 0.55,
    },
    chegada,
  );
  linha.to(
    quadro,
    {
      xPercent: 0,
      scaleX: 1,
      scaleY: 1,
      ease: "elastic.out(1, 0.45)",
      duration: duracao * 0.45,
    },
    chegada + duracao * 0.55,
  );
}

function montarTrocasDosCartoes(quadros: HTMLElement[]) {
  const linha = gsap.timeline({ paused: true });
  quadros.slice(0, -1).forEach((quadro, indice) => {
    const inicio = indice + TROCA_DE_CARTAO.parado / 2;
    tirarCartaoPelaEsquerda(linha, quadro, inicio);
    trazerCartaoPelaDireita(linha, quadros[indice + 1], inicio);
  });
  linha.set({}, {}, quadros.length - 1);
  return linha;
}

// ============================================================
// 4. LISTA E TECLADO
// Clique num nome da lista ou foco num link da ficha leva a
// rolagem até o ponto em que aquele cartão está parado no meio.
// ============================================================
function rolarAteProjeto(gatilho: ScrollTrigger, indice: number, quantidade: number) {
  const fracao = quantidade > 1 ? indice / (quantidade - 1) : 0;
  const destino = gatilho.start + (gatilho.end - gatilho.start) * fracao;
  const suavizador = ScrollSmoother.get();
  if (suavizador) {
    suavizador.scrollTo(destino, true);
    return;
  }
  window.scrollTo({ top: destino, behavior: "smooth" });
}

function criarNavegacaoDoCarrossel(gatilho: ScrollTrigger, artigos: HTMLElement[]) {
  const acharIndice = (alvo: EventTarget | null) => {
    const elemento = alvo instanceof HTMLElement ? alvo : null;
    const idDoLink = elemento?.closest<HTMLElement>("[data-indice-galeria]")?.dataset.indiceGaleria;
    const idDoArtigo = elemento?.closest<HTMLElement>("[data-projeto]")?.dataset.projeto;
    const id = idDoLink ?? idDoArtigo;
    return artigos.findIndex((artigo) => artigo.dataset.projeto === id);
  };

  const aoClicar = (evento: MouseEvent) => {
    const alvo = evento.target instanceof HTMLElement ? evento.target : null;
    const indice = acharIndice(alvo);
    if (!alvo?.closest("[data-indice-galeria]") || indice < 0) {
      return;
    }
    evento.preventDefault();
    evento.stopPropagation();
    rolarAteProjeto(gatilho, indice, artigos.length);
  };

  const aoFocar = (evento: FocusEvent) => {
    const alvo = evento.target instanceof HTMLElement ? evento.target : null;
    const indice = acharIndice(alvo);
    const focoNaFicha = Boolean(alvo?.matches(":focus-visible") && alvo.closest("[data-projeto]"));
    if (!focoNaFicha || indice < 0) {
      return;
    }
    rolarAteProjeto(gatilho, indice, artigos.length);
  };

  return { aoClicar, aoFocar };
}

// ============================================================
// 5. CARROSSEL PRESO
// Lista e palco ficam parados enquanto a seção passa (uma tela
// de rolagem por projeto). O último cartão fica no meio e é dele
// que a Indústria cresce.
// ============================================================
function montarCarrosselPreso() {
  const secao = document.querySelector<HTMLElement>("#projetos");
  const lateral = secao?.querySelector<HTMLElement>("[data-lateral-galeria]");
  const palco = secao?.querySelector<HTMLElement>("[data-palco-galeria]");
  if (!secao || !lateral || !palco) {
    return undefined;
  }
  const artigos = Array.from(secao.querySelectorAll<HTMLElement>("[data-projeto]"));
  const quadros = artigos
    .map((artigo) => artigo.querySelector<HTMLElement>("[data-quadro-galeria]"))
    .filter((quadro): quadro is HTMLElement => quadro !== null);
  if (artigos.length === 0 || quadros.length !== artigos.length) {
    return undefined;
  }
  secao.dataset.carrossel = "ativo";
  secao.dataset.fichas = "animadas";

  const estado: EstadoDoCarrossel = {
    fichas: artigos.map((artigo) => prepararFicha(artigo, secao)),
    atual: 0,
    visivel: false,
  };
  prepararCartoesForaDaTela(quadros);
  const trocas = montarTrocasDosCartoes(quadros);

  prenderNaSecao(secao, lateral);
  prenderNaSecao(secao, palco);
  const gatilho = ScrollTrigger.create({
    trigger: secao,
    start: "top top",
    end: "bottom bottom",
    animation: trocas,
    scrub: true,
    onUpdate: (atual) =>
      trocarFichaAtual(estado, calcularProjetoAtual(atual.progress, artigos.length)),
  });
  ScrollTrigger.create({
    trigger: secao,
    start: "top 55%",
    end: "bottom 90%",
    onToggle: (atual) => alternarFichaVisivel(estado, atual.isActive),
  });

  const navegacao = criarNavegacaoDoCarrossel(gatilho, artigos);
  lateral.addEventListener("click", navegacao.aoClicar);
  secao.addEventListener("focusin", navegacao.aoFocar);
  reordenarGatilhos();

  return () => {
    lateral.removeEventListener("click", navegacao.aoClicar);
    secao.removeEventListener("focusin", navegacao.aoFocar);
    estado.fichas.forEach(desfazerFicha);
    gsap.set(quadros, { clearProps: "transform" });
    delete secao.dataset.fichas;
    delete secao.dataset.carrossel;
  };
}

// ============================================================
// 6. GANCHO
// Movimento reduzido: cartões em coluna, ficha sempre visível
// embaixo de cada imagem.
// ============================================================
export function useRolagemGaleria() {
  useGSAP(() => {
    gsap.matchMedia().add(COM_MOVIMENTO, montarCarrosselPreso);
  });
}
