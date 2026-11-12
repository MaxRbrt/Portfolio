import { perfil } from "../../data/perfil";

const links = [
  { href: "#projetos", rotulo: "Projetos" },
  { href: "#sobre", rotulo: "Sobre" },
  { href: "#contato", rotulo: "Contato" },
];

export default function Navegacao() {
  return (
    <header className="navegacao">
      <a className="navegacao-marca" href="#inicio" aria-label={`${perfil.nome}, voltar ao início`}>
        {perfil.nome}
      </a>
      <nav aria-label="Seções">
        <ul className="navegacao-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.rotulo}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
