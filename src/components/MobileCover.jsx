import { Play } from "lucide-react";

export default function MobileCover({ failed, children }) {
  return <div className="mobile-vsl-cover">
    <div className="mobile-cover-heading"><span>Diseño web por Armonía</span><span>01 / Presencia</span></div>
    <div className="mobile-cover-message" aria-hidden="true">Tu valor.<br /><span>A primera vista.</span></div>
    {children ? <div className="mobile-cover-player">{children}</div> : <figure className="mobile-cover-work">
      <img src={`${import.meta.env.BASE_URL}vsl/aurinel-portfolio.avif`} alt="Web de Aurinel Martínez incluida en el portafolio de Armonía Digital" width="1896" height="908" fetchPriority="high" decoding="async" />
      <figcaption>Del portafolio: Aurinel Martínez</figcaption>
    </figure>}
    <div className="mobile-cover-bottom">
      {!children && <button type="button" className="mobile-cover-play" disabled aria-label="Video en preparación" title="El video todavía no está disponible"><Play size={24} fill="currentColor" aria-hidden="true" /></button>}
      <div role={children ? undefined : "status"}>{!children && <strong>{failed ? "No pudimos cargar el video" : "Video en preparación"}</strong>}<span>Una web que represente lo que haces.</span></div>
    </div>
  </div>;
}
