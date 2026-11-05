import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { sendCrmEvent, validateLead } from "../lib/crm";
import { track } from "../lib/analytics";
import { plans } from "../data/plans";
import BoldPaymentButton from "../lib/BoldPaymentButton";

const CALENDLY_URL = (import.meta.env.VITE_CALENDLY_URL || "").trim();
const WHATSAPP_URL = (import.meta.env.VITE_WHATSAPP_URL || "").trim();
const PRIVACY_URL = "#politica-privacidad";

const copy = {
  call: {
    kicker: "Agenda tu llamada",
    title: "Evaluemos tu proyecto.",
    text: "Cuéntanos quién eres y el nombre de tu negocio. Después podrás elegir el horario para revisar tu objetivo y el alcance de tu web, sin compromiso.",
    submit: "Continuar para agendar",
    sending: "Guardando solicitud…",
    successTitle: "Ya recibimos tus datos.",
    successText: "Ahora elige el horario que mejor te quede para tu llamada.",
    successFallback: "Un asesor te escribirá para coordinar el horario de tu llamada.",
    successAction: "Elegir horario",
    pixel: "Contact",
  },
  checkout: {
    kicker: "Solicitar servicio",
    title: "Tu próxima web empieza aquí.",
    text: "Déjanos tus datos para registrar tu solicitud de pago. En este paso no se realiza ningún cobro.",
    submit: "Solicitar instrucciones de pago",
    sending: "Guardando solicitud…",
    successTitle: "Solicitud registrada.",
    successText: "El proyecto se activa cuando confirmemos tu pago. Después recibirás el formulario con los detalles de tu web.",
    successFallback: "Un asesor te contactará con las instrucciones de pago.",
    successAction: "Pagar ahora",
    pixel: "InitiateCheckout",
  },
};

export default function LeadModal({ mode = "call", plan: initialPlan = null, onClose }) {
  const text = copy[mode];
  const titleId = useId();
  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const submitting = useRef(false);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [planId, setPlanId] = useState(initialPlan?.id || "");
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
  });

  const selectedPlan = plans.find((plan) => plan.id === planId) || null;
  const isCheckout = mode === "checkout";

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 60);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      window.clearTimeout(timer);
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [onClose]);

  function update(name) {
    return (event) => {
      setFields((current) => ({ ...current, [name]: event.target.value }));
      if (error) setError("");
    };
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;

    const payload = {
      ...fields,
      selectedPlan: planId || undefined,
    };

    const validation = validateLead({
      firstName: payload.firstName,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      selectedPlan: payload.selectedPlan,
      requirePlan: isCheckout,
    });

    if (validation) {
      setError(validation);
      return;
    }

    submitting.current = true;
    setStatus("sending");
    setError("");

    try {
      await sendCrmEvent(isCheckout ? "checkout_payment_requested" : "appointment_requested", {
        ...payload,
        meta: {
          mode,
          plan: selectedPlan?.name || planId || "",
          url: window.location.href,
        },
      });

      setStatus("success");
      track(text.pixel, {
        content_name: selectedPlan?.name || "VSL",
        content_category: "vsl_plan",
        value: selectedPlan?.price || undefined,
        currency: "USD",
      });
    } catch (submitError) {
      setStatus("error");
      setError(
        submitError?.message ||
          "No pudimos confirmar tu solicitud. Tus datos siguen aquí; inténtalo de nuevo."
      );
    } finally {
      submitting.current = false;
    }
  }

  const configuredLink = selectedPlan ? boldLinks[selectedPlan.id] : "";
  const boldLink = /^https:\/\//i.test(configuredLink) ? configuredLink : "";
  const successHref = isCheckout ? boldLink : CALENDLY_URL;
  const successAction = text.successAction;

  function renderSuccess() {
    return (
      <div className="vsl-modal-success" role="status">
        <CheckCircle2 size={40} aria-hidden="true" />
        <h2 id={titleId}>{text.successTitle}</h2>
        <p>{text.successText}</p>

        <div className="vsl-modal-summary">
          <div>
            <span>Contacto</span>
            <strong>
              {fields.firstName} {fields.lastName}
            </strong>
          </div>
          {selectedPlan && (
            <div>
              <span>Plan</span>
              <strong>
                {selectedPlan.name} · {selectedPlan.priceLabel} USD
              </strong>
            </div>
          )}
        </div>

        {successHref ? (
          <a className="vsl-button vsl-button-primary" href={successHref} target="_blank" rel="noopener noreferrer">
            {successAction}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        ) : (
          <p className="vsl-modal-fallback">{text.successFallback}</p>
        )}

        {WHATSAPP_URL && (
          <a className="vsl-modal-link" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </a>
        )}

        <button type="button" className="vsl-modal-close-link" onClick={onClose}>
          {isCheckout ? "Volver a los planes" : "Cerrar"}
        </button>
      </div>
    );
  }

  return (
    <div className="vsl-modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="vsl-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef}>
        <button type="button" className="vsl-modal-x" onClick={onClose} aria-label="Cerrar formulario">
          <X size={20} aria-hidden="true" />
        </button>

        <div className="vsl-modal-scroll">
        {status === "success" ? (
          renderSuccess()
        ) : (
          <>
            <header className="vsl-modal-head">
              <span className="vsl-kicker">{text.kicker}</span>
              <h2 id={titleId}>{text.title}</h2>
              <p>{text.text}</p>
              {isCheckout && selectedPlan && <p className="vsl-checkout-plan"><strong>{selectedPlan.name}</strong><span>{selectedPlan.priceLabel} USD · pago único</span></p>}
            </header>

            <form className="vsl-modal-form" onSubmit={submit} noValidate>
              <div className="vsl-field-row">
                <label className="vsl-field">
                  <span>Nombre *</span>
                  <input
                    ref={firstFieldRef}
                    name="firstName"
                    autoComplete="given-name"
                    value={fields.firstName}
                    onChange={update("firstName")}
                    maxLength={100}
                  />
                </label>
                <label className="vsl-field">
                  <span>Apellido</span>
                  <input
                    name="lastName"
                    autoComplete="family-name"
                    value={fields.lastName}
                    onChange={update("lastName")}
                    maxLength={100}
                  />
                </label>
              </div>

              <label className="vsl-field">
                <span>Correo electrónico *</span>
                <input
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={update("email")}
                  maxLength={254}
                />
              </label>

              <div className="vsl-field-row">
                {isCheckout && <label className="vsl-field">
                  <span>Teléfono</span>
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+57 300 123 4567"
                    value={fields.phone}
                    onChange={update("phone")}
                    maxLength={40}
                  />
                </label>}
                <label className="vsl-field">
                  <span>Negocio o proyecto *</span>
                  <input
                    name="company"
                    autoComplete="organization"
                    value={fields.company}
                    onChange={update("company")}
                    maxLength={200}
                  />
                </label>
              </div>

              {isCheckout && <label className="vsl-field">
                <span>{isCheckout ? "Plan seleccionado *" : "Plan de interés"}</span>
                <select name="plan" value={planId} onChange={(event) => setPlanId(event.target.value)}>
                  <option value="">{isCheckout ? "Selecciona un plan" : "Todavía no lo sé"}</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.priceLabel} USD
                    </option>
                  ))}
                </select>
              </label>}

              {isCheckout && (
                <div className="vsl-modal-note">
                  <CreditCard size={18} aria-hidden="true" />
                  <p>
                    Primero confirmaremos tu solicitud. Aún no se realiza ningún cobro ni se confirma un pago.
                  </p>
                </div>
              )}

              {!isCheckout && (
                <div className="vsl-modal-note">
                  <CalendarDays size={18} aria-hidden="true" />
                  <p>
                    Al enviar tus datos podrás elegir el horario de tu llamada. La asesoría es gratis y sin
                    compromiso.
                  </p>
                </div>
              )}

              {error && (
                <p className="vsl-modal-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="vsl-button vsl-button-primary vsl-modal-submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <>
                    <LoaderCircle className="vsl-spin" size={18} aria-hidden="true" />
                    {text.sending}
                  </>
                ) : (
                  <>
                    {text.submit}
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
              {isCheckout && <button type="button" className="vsl-modal-close-link" onClick={onClose}><ArrowLeft size={16} aria-hidden="true" /> Volver a los planes</button>}

              <p className="vsl-modal-privacy">
                <ShieldCheck size={15} aria-hidden="true" />
                Usamos tus datos solo para atender esta solicitud. No vendemos tu información.
                {PRIVACY_URL && (
                  <>
                    {" "}
                    <a href={PRIVACY_URL} onClick={onClose}>
                      Política de privacidad
                    </a>
                    .
                  </>
                )}
              </p>
            </form>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
