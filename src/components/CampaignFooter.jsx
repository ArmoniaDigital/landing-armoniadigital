import { ArrowRight } from "lucide-react";
import { OPEN_CONSENT_EVENT } from "../lib/brand-analytics.mjs";

export default function CampaignFooter({ offerVisible }) {
  return <footer className="campaign-footer">
    <div className="vsl-container">
      {offerVisible && <div className="campaign-footer-cta"><div><p className="campaign-eyebrow">Tu siguiente paso</p><h2>Tu negocio creció.<br />Que tu web <span>lo demuestre.</span></h2></div><a className="vsl-button vsl-button-primary" href="#planes">Elegir mi plan <ArrowRight size={18} aria-hidden="true" /></a></div>}
      <div className="campaign-footer-main"><a href="#inicio" aria-label="Armonía Digital, inicio"><img src={`${import.meta.env.BASE_URL}vsl/logo-white.webp`} alt="Armonía Digital" width="288" height="91" loading="lazy" decoding="async" /></a><p>Estrategia, diseño y desarrollo.<br />Una web a la altura de tu negocio.</p></div>
      <section id="politica-privacidad" className="campaign-footer-privacy" aria-labelledby="campaign-privacy-title"><h3 id="campaign-privacy-title">Política de privacidad</h3><p>Usamos cookies y datos de navegación para mejorar la experiencia del sitio, medir visitas y entender qué contenidos ayudan mejor a nuestros clientes. No vendemos tu información personal.</p></section>
      <div className="campaign-footer-legal"><p>© {new Date().getFullYear()} Armonía Digital. Todos los derechos reservados.</p><p>Este sitio no forma parte de Facebook ni de Instagram y no está afiliado, patrocinado ni respaldado por Meta Platforms, Inc. Facebook e Instagram son marcas de sus respectivos titulares. Los servicios anunciados son ofrecidos por Armonía Digital.</p></div>
      <button className="campaign-cookie-settings" type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>Preferencias de cookies</button>
    </div>
  </footer>;
}
