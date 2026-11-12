// ============================================================
// 1. ESTADO COMPARTILHADO DA CENA
// GSAP escreve, o quadro a quadro do rosto lê. Cada gatilho de
// rolagem tem o seu próprio valor para não brigarem entre si.
// montagem: 0 nada desenhado, 1 rosto todo em linhas (o contorno
// aparece antes do miolo).
// luz: 0 linhas azuladas, 1 rosto tomado de luz branca.
// foto: 0 linhas, 1 cores da foto.
// saidaHero: 0 no topo, 1 quando o hero já saiu da tela.
// voltaContato: 0 longe do contato, 1 com o contato na tela.
// grade: 0 apagada, 1 acesa do centro até as bordas.
// surgimento: 0 pontos invisíveis, 1 visíveis.
// recuo: 0 câmera perto do rosto, 1 afastada (transição).
// apagarGrade: 0 grade acesa, 1 grade apagada (transição).
// curvaGrade: 0 parede do cilindro, 1 bordas puxadas para a frente
// e para fora (a grade se curva quando o rosto quebra).
// ============================================================

export const estadoCena = {
  grade: 0,
  surgimento: 0,
  montagem: 0,
  luz: 0,
  foto: 0,
  saidaHero: 0,
  voltaContato: 0,
  recuo: 0,
  apagarGrade: 0,
  curvaGrade: 0,
};

export const OPACIDADE_NO_CONTATO = 0.45;
export const RECUO_MAXIMO_CAMERA = 1.2;

export function calcularDispersao(saidaHero: number, voltaContato: number) {
  return saidaHero * (1 - voltaContato);
}

export function calcularOpacidade(saidaHero: number, voltaContato: number) {
  const presencaNoHero = 1 - saidaHero * saidaHero;
  const presencaNoContato = saidaHero * voltaContato * OPACIDADE_NO_CONTATO;
  return presencaNoHero + presencaNoContato;
}

export function calcularRecuoCamera(recuo: number, voltaContato: number) {
  return recuo * (1 - voltaContato) * RECUO_MAXIMO_CAMERA;
}
