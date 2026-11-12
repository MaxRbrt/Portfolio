const PASTA_AMBIENTES = `${import.meta.env.BASE_URL}ambientes/`;

// ============================================================
// 1. FOTO DE AMBIENTE EM HTML
// Fundo de quem não tem o palco no WebGL (movimento reduzido,
// sem WebGL) e enquanto as texturas não chegam.
// ============================================================
type PropsCamadaAmbiente = {
  nome: string;
  classe: string;
};

export default function CamadaAmbiente({ nome, classe }: PropsCamadaAmbiente) {
  return (
    <div className={classe} aria-hidden="true">
      <img
        src={`${PASTA_AMBIENTES}${nome}-1376.webp`}
        srcSet={`${PASTA_AMBIENTES}${nome}-800.webp 800w, ${PASTA_AMBIENTES}${nome}-1376.webp 1376w`}
        sizes="100vw"
        alt=""
        width={1376}
        height={768}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
