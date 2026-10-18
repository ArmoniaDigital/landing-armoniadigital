import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import "./LeadRequest.css";

const words = {
  es: {
    back: "Volver", title: "Hablemos de tu web.", purchase: "Demos el siguiente paso.",
    intro: "Solo necesitamos estos datos antes de agendar la llamada.",
    purchaseIntro: "Déjanos tus datos para coordinar el pago de tu plan.",
    name: "Tu nombre", email: "Correo electrónico", business: "Nombre de tu negocio o proyecto",
    phone: "Teléfono (opcional)", plan: "Plan", choose: "Elige un plan",
    custom: "Personalizado", submit: "Continuar para agendar", request: "Solicitar instrucciones de pago",
    sending: "Guardando solicitud…", error: "No pudimos confirmar tu solicitud. Tus datos siguen aquí; inténtalo de nuevo.",
    received: "Ya recibimos tus datos.", next: "Ahora puedes elegir el horario de tu llamada.",
    paymentNext: "Revisaremos tu solicitud y te contactaremos con las instrucciones de pago. Aún no se ha realizado ningún cobro.",
    calendar: "Elegir horario", privacy: "Usaremos estos datos para atender tu solicitud.",
    paymentNote: "El proyecto se activa cuando confirmemos tu pago. Después recibirás el formulario con los detalles de tu web.",
  },
  en: {
    back: "Back", title: "Let's talk about your website.", purchase: "Let's take the next step.",
    intro: "Just a few details before you choose a time for our call.",
    purchaseIntro: "Leave your details so we can arrange payment for your plan.",
    name: "Your name", email: "Email address", business: "Business or project name",
    phone: "Phone (optional)", plan: "Plan", choose: "Choose a plan",
    custom: "Custom", submit: "Continue to scheduling", request: "Request payment instructions",
    sending: "Saving your request…", error: "We couldn't confirm your request. Your details are still here; please try again.",
    received: "We've received your details.", next: "You can now choose a time for our call.",
    paymentNext: "We'll review your request and contact you with payment instructions. You haven't been charged.",
    calendar: "Choose a time", privacy: "We'll use these details to respond to your request.",
    paymentNote: "Your project activates once we confirm payment. You'll then receive a short form for your website details.",
  },
};

export default function LeadRequest({ send, logo, brand, calendar, language = "es", purchase = false, initialPlan = "" }) {
  const text = words[language] || words.es;
  const [status, setStatus] = useState("idle");
  const [plan, setPlan] = useState(["launch", "business", "store", "personalizado"].includes(initialPlan.toLowerCase()) ? initialPlan.toLowerCase() : "");
  const busy = useRef(false);
  const errorRef = useRef(null);
  const successRef = useRef(null);
  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      await send(purchase ? "checkout_payment_requested" : "appointment_requested", {
        contact: { firstName: data.get("name"), email: data.get("email"), phone: data.get("phone") },
        company: { name: data.get("business") },
        ...(plan ? { selectedPlan: plan } : {}),
      });
      setStatus("received");
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setStatus("error");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally { busy.current = false; }
  }
  return (
    <main className="lead-request">
      <header className="lead-header">
        <a href="#" aria-label={brand}><img src={logo} alt={brand} /></a>
        <a href="#" className="lead-back"><ArrowLeft size={18} aria-hidden="true" />{text.back}</a>
      </header>
      <section className="lead-content" aria-labelledby="lead-title">
        <div className="lead-intro">
          <span className="lead-brand">{brand}</span>
          <h1 id="lead-title">{purchase ? text.purchase : text.title}</h1>
          <p>{purchase ? text.purchaseIntro : text.intro}</p>
        </div>
        {status === "received" ? (
          <div className="lead-success" ref={successRef} tabIndex={-1} role="status">
            <CheckCircle2 size={32} aria-hidden="true" />
            <h2>{text.received}</h2>
            <p>{purchase ? text.paymentNext : text.next}</p>
            {!purchase && <a className="lead-action" href={calendar}>{text.calendar}<ArrowRight size={18} aria-hidden="true" /></a>}
            <a href="#" className="lead-back">{text.back}</a>
          </div>
        ) : (
          <form onSubmit={submit} className="lead-form" aria-busy={status === "sending"}>
            <fieldset disabled={status === "sending"}>
              <label htmlFor="lead-name">{text.name}<input id="lead-name" name="name" autoComplete="name" required maxLength={100} pattern={".*\\S.*"} /></label>
              <label htmlFor="lead-email">{text.email}<input id="lead-email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
              <label htmlFor="lead-business">{text.business}<input id="lead-business" name="business" autoComplete="organization" required maxLength={200} pattern={".*\\S.*"} /></label>
              <label htmlFor="lead-phone">{text.phone}<input id="lead-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} pattern="[+0-9 ]{5,40}" /></label>
              {purchase && <label htmlFor="lead-plan">{text.plan}<select id="lead-plan" name="plan" required value={plan} onChange={e => setPlan(e.target.value)}><option value="">{text.choose}</option><option value="launch">Launch</option><option value="business">Business</option><option value="store">Store</option><option value="personalizado">{text.custom}</option></select></label>}
            </fieldset>
            {status === "error" && <p className="lead-error" role="alert" tabIndex={-1} ref={errorRef}>{text.error}</p>}
            <p className="lead-note">{purchase ? text.paymentNote : text.privacy}</p>
            <button className="lead-action" type="submit" disabled={status === "sending"}>{status === "sending" ? <><LoaderCircle className="lead-spinner" size={18} aria-hidden="true" />{text.sending}</> : <>{purchase ? text.request : text.submit}<ArrowRight size={18} aria-hidden="true" /></>}</button>
          </form>
        )}
      </section>
    </main>
  );
}
