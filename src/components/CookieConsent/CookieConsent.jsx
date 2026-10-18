import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "armonia-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(STORAGE_KEY);
    setVisible(!storedConsent);
  }, []);

  const saveConsent = (value) => {
    window.localStorage.setItem(STORAGE_KEY, value);
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
          Guardamos cookies necesarias y de medición para entender cómo se usa esta web y mejorar nuestros servicios.
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
