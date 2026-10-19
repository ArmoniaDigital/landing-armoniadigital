import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { analytics } from "../../services/analytics.js";
import { OPEN_CONSENT_EVENT } from "../../services/analytics.mjs";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!analytics.getConsent());
    const open = () => setVisible(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    const unsubscribe = analytics.subscribe(() => setVisible(false));
    return () => { window.removeEventListener(OPEN_CONSENT_EVENT, open); unsubscribe(); };
  }, []);

  const saveConsent = (value) => {
    analytics.setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <div className="cookie-consent__icon" aria-hidden="true">
        <ShieldCheck size={22} strokeWidth={2.2} />
      </div>

      <div className="cookie-consent__copy">
        <strong>Usamos cookies para mejorar tu experiencia.</strong>
        <p>
          Las cookies opcionales de medición y publicidad nos ayudan a mejorar la web y nuestras campañas.
          Puedes aceptar o rechazar su uso. Consulta nuestra{" "}
          <a href="#politica-privacidad">política de privacidad</a>.
        </p>
      </div>

      <div className="cookie-consent__actions">
        <button type="button" className="cookie-consent__secondary" onClick={() => saveConsent("rejected")}>
          Rechazar
        </button>
        <button type="button" className="cookie-consent__primary" onClick={() => saveConsent("accepted")}>
          Aceptar cookies
        </button>
      </div>

      <button
        type="button"
        className="cookie-consent__close"
        aria-label="Cerrar aviso de cookies"
        onClick={() => saveConsent("dismissed")}
      >
        <X size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}
