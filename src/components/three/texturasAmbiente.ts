import * as THREE from "three";

export const PASTA_AMBIENTES = `${import.meta.env.BASE_URL}ambientes/`;

// ============================================================
// 1. TEXTURAS DOS AMBIENTES
// Fotos em 1376 px, sem conversão de cor (o shader devolve a cor
// como veio). Faíscas se repetem para descer sem emenda.
// ============================================================
export function enderecoDoAmbiente(nome: string) {
  return `${PASTA_AMBIENTES}${nome}-1376.webp`;
}

export async function carregarTexturaDeAmbiente(endereco: string, repetir = false) {
  const textura = await new THREE.TextureLoader().loadAsync(endereco);
  textura.colorSpace = THREE.NoColorSpace;
  textura.anisotropy = 4;
  if (repetir) {
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;
  }
  return textura;
}

export function lerAspectoDaTextura(textura: THREE.Texture) {
  const imagem: unknown = textura.image;
  const temMedidas = imagem instanceof HTMLImageElement && imagem.height > 0;
  return temMedidas ? imagem.width / imagem.height : 16 / 9;
}
