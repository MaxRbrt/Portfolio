// ============================================================
// 1. ESTADO COMPARTILHADO DA CENA
// GSAP escreve, o quadro a quadro do rosto lê. Cada gatilho de
// rolagem tem o seu próprio valor para não brigarem entre si.
// montagem: 0 espalhado, 1 rosto formado (entrada da página).
// saidaHero: 0 no topo, 1 quando o hero já saiu da tela.
// voltaContato: 0 longe do contato, 1 com o contato na tela.
// ============================================================

export const estadoCena = {
  montagem: 0,
  saidaHero: 0,
  voltaContato: 0,
};

export const OPACIDADE_NO_CONTATO = 0.45;

export function calcularDispersao(saidaHero: number, voltaContato: number) {
  return saidaHero * (1 - voltaContato);
}

export function calcularOpacidade(saidaHero: number, voltaContato: number) {
  const presencaNoHero = 1 - saidaHero * saidaHero;
  const presencaNoContato = saidaHero * voltaContato * OPACIDADE_NO_CONTATO;
  return presencaNoHero + presencaNoContato;
}
