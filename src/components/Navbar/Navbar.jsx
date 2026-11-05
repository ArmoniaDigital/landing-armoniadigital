import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "./LOGO-01.png";

const hrefs = [
  "/",
  "#precios",
  "#portafolio",
  "#extras",
  "#testimonios",
  "#faq",
  "/blog",
  "#contacto",
];

function resolveNavHref(link, index, copy) {
  const normalized = String(link || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["login", "iniciar sesion", "publica tu propiedad"].includes(normalized)) {
    return copy.systemLoginHref || "https://crm.readyin72.com/login";
  }

  return hrefs[index] || "#inicio";
}

export default function Navbar({ copy }) {
  const isExternalContact = copy.contactHref?.startsWith("http");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      setScrolled(currentY > 120);
      setHidden(currentY > 220 && currentY > lastScrollY.current + 8);
      lastScrollY.current = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""} ${hidden ? "navbar-hidden" : ""} ${menuOpen ? "navbar-menu-open" : ""}`}>
      <div className="container nav-content">
        <a className="logo" href="#inicio" aria-label={copy.brand} onClick={closeMenu}>
          <img src={logo} alt="Armonia Digital" />
        </a>

        <nav>
          {copy.links.map((link, index) => {
            const href = resolveNavHref(link, index, copy);
            const isExternal = href.startsWith("http");

            return (
              <a
                key={link}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
              >
                {link}
              </a>
            );
          })}
        </nav>

        <a
          href={copy.contactHref || "#contacto"}
          className="whatsapp-btn"
          target={isExternalContact ? "_blank" : undefined}
          rel={isExternalContact ? "noreferrer" : undefined}
        >
          <MessageCircle size={17} />
          {copy.whatsapp}
        </a>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-top">
          <a className="mobile-menu-logo" href="#inicio" onClick={closeMenu} aria-label={copy.brand}>
            <img src={logo} alt="Armonia Digital" />
          </a>
          <button type="button" onClick={closeMenu} aria-label="Cerrar menu">
            <X size={24} />
          </button>
        </div>

        <div className="mobile-menu-label">
          <span>Navega la web</span>
          <small>Armonia Digital</small>
        </div>

        <div className="mobile-menu-links">
          {copy.links.map((link, index) => {
            const href = resolveNavHref(link, index, copy);
            const isExternal = href.startsWith("http");

            return (
              <a
                key={link}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                onClick={closeMenu}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{link}</strong>
                <ArrowRight size={22} />
              </a>
            );
          })}
        </div>

        <a
          href={copy.contactHref || "#contacto"}
          className="mobile-menu-cta"
          target={isExternalContact ? "_blank" : undefined}
          rel={isExternalContact ? "noreferrer" : undefined}
          onClick={closeMenu}
        >
          {copy.whatsapp}
          <ArrowRight size={19} />
        </a>
      </div>
    </header>
  );
}
