import logoWhite from "./Logo_blanco.png";
import { MessageCircle } from "lucide-react";
import { OPEN_CONSENT_EVENT } from "../../services/analytics.mjs";

export default function Footer({ copy }) {
  const isExternalContact = copy.contactHref?.startsWith("http");

  return (
    <footer className="footer" id="contacto">
      <div className="footer-cta-wrap">
        <div className="container footer-cta">
          <div className="footer-cta-copy">
            <h2>
              ¿CUÁNDO ESTARÁS LISTO <br />
              PARA QUE TU NEGOCIO <span>CREZCA?</span>
            </h2>
            <p>
              Hablemos de tu proyecto y hagámoslo realidad <br />
              rápido, claro y sin complicaciones.
            </p>
          </div>

          <div className="footer-cta-action">
            <a
              className="footer-whatsapp"
              href={copy.contactHref || "#contacto"}
              target={isExternalContact ? "_blank" : undefined}
              rel={isExternalContact ? "noreferrer" : undefined}
            >
              <MessageCircle size={18} strokeWidth={2.4} />
              AGENDA GRATIS
            </a>
            <p>Te respondemos en menos de 2 horas.</p>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <a className="footer-logo" href="#inicio" aria-label={copy.brand}>
          <img src={logoWhite} alt={copy.brand} />
        </a>

        <p className="footer-rights">{copy.rights}</p>

        <div className="footer-links">
          <a href="#precios">{copy.links[0]}</a>
          <a href="#faq">{copy.links[1]}</a>
          <a href="#blog">{copy.links[2]}</a>
          <a href="#politica-privacidad">{copy.links[3]}</a>
          <button type="button" className="footer-cookie-settings" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>Preferencias de cookies</button>
        </div>
      </div>

      <div className="container privacy-note" id="politica-privacidad">
        <h3>Política de privacidad</h3>
        <p>
          Usamos cookies y datos de navegación para mejorar la experiencia del sitio, medir visitas y entender qué
          contenidos ayudan mejor a nuestros clientes. No vendemos tu información personal.
        </p>
      </div>
    </footer>
  );
}
