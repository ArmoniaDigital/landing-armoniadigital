import { useEffect, useRef, useState } from "react";
import { CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";

/**
 * Botón de pago Bold (checkout embebido).
 *
 * Usa la librería oficial `boldPaymentButton.js`, que expone `window.BoldCheckout`.
 * La firma de integridad se pide al CRM (`/api/landing/bold-signature`), nunca se
 * calcula en el navegador: la llave secreta vive solo en el servidor.
 *
 * Requisitos antes de usarlo en producción:
 *  1. `VITE_BOLD_SIGNATURE_URL` debe apuntar al CRM (por defecto el CRM de producción).
 *     El CRM solo responde a orígenes de su lista blanca (`brandForOrigin`).
 *  2. `amount` va en unidades menores de `currency` (COP no tiene decimales:
 *     39900 = $39.900 COP). El importe y la divisa son decisiones de negocio,
 *     por eso son props obligatorias y no hay valores por defecto.
 *
 * Ejemplo:
 *   <BoldPaymentButton amount={39900} currency="COP" description="Plan Launch" />
 */

const LIBRARY_URL = "https://checkout.bold.co/library/boldPaymentButton.js";
const DEFAULT_SIGNATURE_URL = "https://crm-readyin72.vercel.app/api/landing/bold-signature";

let libraryPromise = null;

function loadBoldLibrary() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("El pago con Bold solo está disponible en el navegador."));
  }
  if (window.BoldCheckout) return Promise.resolve(window.BoldCheckout);
  if (libraryPromise) return libraryPromise;

  libraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = LIBRARY_URL;
    script.async = true;
    script.onload = () => {
      if (window.BoldCheckout) resolve(window.BoldCheckout);
      else reject(new Error("La librería de Bold cargó pero no expuso BoldCheckout."));
    };
    script.onerror = () => reject(new Error("No pudimos cargar la librería de pago de Bold."));
    document.head.appendChild(script);
  }).catch((error) => {
    libraryPromise = null;
    throw error;
  });

  return libraryPromise;
}

async function requestSignature({ signatureUrl, orderId, amount, currency }) {
  const response = await fetch(signatureUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, amount, currency }),
    signal: AbortSignal.timeout(20000),
  });

  const data = await response.json().catch(() => null);
  const signature = data?.integritySignature;

  if (!response.ok || typeof signature !== "string" || !/^[0-9a-f]{64}$/i.test(signature)) {
    throw new Error("No pudimos preparar el pago seguro. Inténtalo de nuevo.");
  }

  return signature;
}

export default function BoldPaymentButton({
  orderId,
  amount,
  currency = "COP",
  description = "",
  signatureUrl = "",
  renderMode = "embedded",
  onCheckoutEvent,
  disabled = false,
  className = "vsl-button vsl-button-primary",
  children = "Pagar ahora",
}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const configRef = useRef(null);

  const endpoint = (signatureUrl || import.meta.env.VITE_BOLD_SIGNATURE_URL || DEFAULT_SIGNATURE_URL).trim();
  const amountInteger = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0;

  useEffect(() => {
    let cancelled = false;

    // Validación estricta: SIN orderId, NO hay pago.
    if (!orderId) {
      setStatus("error");
      setError("Error de sincronización: ID de pedido no encontrado.");
      return () => {
        cancelled = true;
      };
    }

    if (amountInteger <= 0) {
      setStatus("error");
      setError("Monto inválido.");
      return () => {
        cancelled = true;
      };
    }

    setStatus("preparing");
    setError("");

    Promise.all([
      loadBoldLibrary(),
      requestSignature({ signatureUrl: endpoint, orderId, amount: amountInteger, currency }),
    ])
      .then(([, integritySignature]) => {
        if (cancelled) return;
        configRef.current = {
          orderId,
          amount: String(amountInteger),
          currency,
          description,
          integritySignature,
          renderMode,
        };
        setStatus("ready");
      })
      .catch((prepareError) => {
        if (cancelled) return;
        setStatus("error");
        setError(prepareError?.message || "No pudimos preparar el pago.");
      });

    return () => {
      cancelled = true;
    };
  }, [
    amountInteger,
    currency,
    description,
    endpoint,
    orderId,
    renderMode
  ]);

  useEffect(() => {
    if (!onCheckoutEvent) return undefined;

    function onMessage(event) {
      if (event?.data?.type === "BOLD_CHECKOUT_EVENT") onCheckoutEvent(event.data);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onCheckoutEvent]);

  async function openCheckout() {
    if (disabled || status !== "ready" || !configRef.current) return;

    try {
      const BoldCheckout = await loadBoldLibrary();
      new BoldCheckout({ ...configRef.current }).open();
    } catch (openError) {
      setStatus("error");
      setError(openError?.message || "No pudimos abrir el pago.");
    }
  }

  return (
    <div className="vsl-bold">
      <button
        type="button"
        className={className}
        onClick={openCheckout}
        disabled={disabled || status === "preparing" || status === "error"}
      >
        {status === "preparing" ? (
          <LoaderCircle className="vsl-spin" size={18} aria-hidden="true" />
        ) : (
          <CreditCard size={18} aria-hidden="true" />
        )}
        {status === "preparing" ? "Preparando pago seguro…" : children}
      </button>

      {status === "error" && (
        <p className="vsl-bold-error" role="alert">
          {error}
        </p>
      )}

      <p className="vsl-bold-note">
        <ShieldCheck size={15} aria-hidden="true" />
        Pago procesado por Bold. No almacenamos datos de tu tarjeta.
      </p>
    </div>
  );
}
