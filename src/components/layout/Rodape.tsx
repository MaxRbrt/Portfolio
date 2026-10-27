import { perfil } from "../../data/perfil";

export default function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="rodape">
      <p>
        © {ano} {perfil.nome}
      </p>
      <p>Feito com React, three.js e GSAP.</p>
    </footer>
  );
}
