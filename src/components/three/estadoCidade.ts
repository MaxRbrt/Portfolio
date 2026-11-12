import { MathUtils } from "three";

// ============================================================
// 1. ETAPAS DA CIDADE
// Lidas do avanço da seção #trajetoria (0 a 1, palco preso).
// zoomCanion: câmera entrando no cânion até a luz do fundo.
// branco: a luz toma a tela e depois abre na vista de cima.
// vista: 1 quando a vista de cima já está atrás do branco.
// descida: câmera descendo sobre a cidade.
// bloco: bloco vermelho do meio crescendo e partindo a cidade.
// ============================================================
export type EtapasCidade = {
  zoomCanion: number;
  branco: number;
  vista: number;
  descida: number;
  bloco: number;
};

export type EtapasBeco = {
  beco: number;
  ruido: number;
};

const TROCA_PARA_A_VISTA = 0.4;
const ZOOM_MAXIMO_DO_CANION = 2.1;

export function etapasDaCidade(avancoBruto: number): EtapasCidade {
  const avanco = MathUtils.clamp(avancoBruto, 0, 1);
  const entradaNoCanion = MathUtils.smoothstep(avanco, 0, TROCA_PARA_A_VISTA);
  const subidaDoBranco = MathUtils.smoothstep(avanco, 0.24, TROCA_PARA_A_VISTA);
  const aberturaDaVista = MathUtils.smoothstep(avanco, 0.42, 0.54);
  return {
    zoomCanion: 1 + (ZOOM_MAXIMO_DO_CANION - 1) * entradaNoCanion * entradaNoCanion,
    branco: subidaDoBranco * (1 - aberturaDaVista),
    vista: avanco >= TROCA_PARA_A_VISTA ? 1 : 0,
    descida: MathUtils.smoothstep(avanco, TROCA_PARA_A_VISTA, 0.8),
    bloco: MathUtils.smoothstep(avanco, 0.64, 1),
  };
}

// ============================================================
// 2. ETAPAS DO BECO
// chegada: topo do #contato subindo do pé ao alto da tela; o
// vermelho do bloco vira o beco.
// fim: rolagem dentro do contato; no último trecho o beco se
// desfaz em ruído vermelho.
// ============================================================
export function etapasDoBeco(chegada: number, fim: number): EtapasBeco {
  return {
    beco: MathUtils.smoothstep(chegada, 0.15, 0.85),
    ruido: MathUtils.smoothstep(fim, 0.7, 1),
  };
}
