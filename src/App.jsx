import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Globe2, MessageCircle, ShieldCheck, Star } from "lucide-react";
import VideoFrame from "./components/VideoFrame";
import Plans from "./components/Plans";
import LeadModal from "./components/LeadModal";
import { track } from "./lib/analytics";

const WHATSAPP_URL = (import.meta.env.VITE_WHATSAPP_URL || "").trim();

const benefits = [
  {
    title: "Disponible 24/7",
    text: "Tu negocio trabaja incluso mientras duermes.",
  },
  {
    title: "Genera confianza",
    text: "Un sitio profesional mejora la percepción de tu marca.",
  },
  {
    title: "Más conversiones",
    text: "Convierte visitantes en clientes potenciales.",
  },
  {
    title: "100% adaptable",
    text: "Se ve perfecto en móviles, tablets y computadoras.",
  },
];

const steps = [
  {
    title: "Eliges tu plan o agendas una llamada",
    text: "Revisamos tu caso, confirmamos el alcance y resolvemos tus dudas antes de empezar.",
  },
  {
    title: "Envías la información de tu negocio",
    text: "Con tus textos, tu marca y tus datos armamos la primera versión de tu sitio.",
  },
  {
    title: "Recibes tu primera vista en 72 horas",
    text: "Ajustamos juntos los detalles y preparamos el lanzamiento.",
  },
];

const faqs = [
  {
    question: "¿Qué necesito para empezar?",
    answer:
      "Solo el nombre de tu negocio, tu información de contacto y el plan que quieres. Después te enviamos un formulario corto con los detalles de tu web.",
  },
  {
    question: "¿En cuánto tiempo veo mi web?",
    answer:
      "La primera vista de tu sitio está lista en 72 horas hábiles después de completar el formulario inicial con la información necesaria para empezar.",
  },
  {
    question: "¿El dominio está incluido?",
    answer: "No. La compra del dominio no está incluida en el precio del plan.",
  },
  {
    question: "¿Cómo se realiza el pago?",
    answer:
      "Registras tu solicitud y el equipo te comparte las instrucciones de pago. El proyecto se activa cuando confirmamos el pago.",
  },
  {
    question: "¿Puedo cambiar de plan después?",
    answer:
      "Sí. Puedes elegir otro plan antes de enviar tu solicitud o hablarlo con nosotros en la llamada.",
  },
];

export default function App() {
  const [modal, setModal] = useState(null);

  function openModal(mode, plan = null) {
    setModal({ mode, plan });
  }

  function closeModal() {
    setModal(null);
  }

  function scrollToPlans() {
    document.getElementById("planes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    track("ViewContent", { content_name: "VSL Armonía Digital", content_category: "vsl" });
  }, []);

  return (
    <div className="vsl">
      <header className="vsl-header">
        <div className="vsl-container vsl-header-inner">
          <a className="vsl-brand" href="#inicio" aria-label="Armonía Digital">
            <img src="/logo.png" alt="Armonía Digital" />
          </a>
          <button
            type="button"
            className="vsl-button vsl-button-small vsl-button-ghost"
            onClick={() => {
              track("Contact", { content_name: "header_call", content_category: "vsl_header" });
              openModal("call");
            }}
          >
            <CalendarDays size={16} aria-hidden="true" />
            Agendar llamada
          </button>
        </div>
      </header>

      <main id="inicio">
        {/* HERO + VSL */}
        <section className="vsl-hero">
          <div className="vsl-container vsl-hero-inner">
            <span className="vsl-badge">
              <Star size={14} aria-hidden="true" />
              DISEÑO WEB PARA NEGOCIOS LOCALES
            </span>

            <h1>
              Páginas web que generan <span className="vsl-highlight">confianza</span> y atraen{" "}
              <span className="vsl-highlight-blue">clientes.</span>
            </h1>

            <p className="vsl-hero-sub">
              Diseñamos sitios web modernos, rápidos y optimizados para que tu negocio se vea profesional y convierta
              más.
            </p>

            <VideoFrame onPlaceholderClick={() => openModal("call")} />

            <div className="vsl-hero-actions">
              <button type="button" className="vsl-button vsl-button-primary vsl-button-large" onClick={scrollToPlans}>
                Ver planes y precios
                <ArrowRight size={19} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="vsl-button vsl-button-ghost vsl-button-large"
                onClick={() => {
                  track("Contact", { content_name: "hero_call", content_category: "vsl_hero" });
                  openModal("call");
                }}
              >
                <CalendarDays size={18} aria-hidden="true" />
                Agendar llamada gratis
              </button>
            </div>

            <ul className="vsl-proof">
              <li>
                <Star size={15} aria-hidden="true" />
                +120 negocios confían en nosotros
              </li>
              <li>
                <Clock size={15} aria-hidden="true" />
                Primera vista en 72 horas
              </li>
              <li>
                <Globe2 size={15} aria-hidden="true" />
                100% adaptable a móvil
              </li>
            </ul>
          </div>
        </section>

        {/* PROBLEMA / CONTEXTO */}
        <section className="vsl-section vsl-problem">
          <div className="vsl-container">
            <div className="vsl-problem-grid">
              <header className="vsl-section-head vsl-section-head-left">
                <span className="vsl-kicker">Contexto</span>
                <h2>
                  Estás <span className="vsl-highlight-red">perdiendo clientes</span> todos los días.
                </h2>
                <p>Y tu sitio web puede solucionar esto.</p>
              </header>

              <div className="vsl-stat">
                <strong>75%</strong>
                <p>
                  de los usuarios juzga la credibilidad de una empresa basándose en su sitio web.
                </p>
                <span>Stanford Web Credibility / Fogg et al.</span>
              </div>
            </div>

            <div className="vsl-benefit-grid">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="vsl-benefit">
                  <CheckCircle2 size={19} aria-hidden="true" />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </article>
              ))}
            </div>

            <p className="vsl-note">
              Podemos tener tu web lista en <strong>72 horas.</strong>
            </p>
          </div>
        </section>

        {/* PROCESO */}
        <section className="vsl-section vsl-process">
          <div className="vsl-container">
            <header className="vsl-section-head">
              <span className="vsl-kicker">Cómo funciona</span>
              <h2>Tres pasos y tu web empieza a tomar forma.</h2>
              <p>Sin reuniones eternas ni procesos confusos. Tú envías la información, nosotros construimos.</p>
            </header>

            <ol className="vsl-step-grid">
              {steps.map((step, index) => (
                <li key={step.title} className="vsl-step">
                  <span className="vsl-step-number">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* PLANES */}
        <Plans onCheckout={(plan) => openModal("checkout", plan)} onCall={(plan) => openModal("call", plan)} />

        {/* FAQ */}
        <section className="vsl-section vsl-faq">
          <div className="vsl-container vsl-faq-inner">
            <header className="vsl-section-head vsl-section-head-left">
              <span className="vsl-kicker">Preguntas frecuentes</span>
              <h2>Lo que suelen preguntarnos.</h2>
              <p>Si te queda alguna duda, la resolvemos en la llamada.</p>
            </header>

            <div className="vsl-faq-list">
              {faqs.map((faq) => (
                <details key={faq.question} className="vsl-faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="vsl-final">
          <div className="vsl-container vsl-final-inner">
            <span className="vsl-kicker">Tu próxima web</span>
            <h2>Tu próxima web puede estar lista en 72 horas.</h2>
            <p>Elige tu plan o agenda una llamada. Sin compromiso y sin pagos ocultos.</p>

            <div className="vsl-hero-actions">
              <button type="button" className="vsl-button vsl-button-primary vsl-button-large" onClick={scrollToPlans}>
                Ver planes y precios
                <ArrowRight size={19} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="vsl-button vsl-button-outline vsl-button-large"
                onClick={() => openModal("call")}
              >
                <CalendarDays size={18} aria-hidden="true" />
                Agendar llamada gratis
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="vsl-footer">
        <div className="vsl-container">
          <div className="vsl-footer-top">
            <div>
              <img src="/logo.png" alt="Armonía Digital" className="vsl-footer-logo" />
              <p>Diseño web para negocios locales. Primera vista en 72 horas.</p>
            </div>

            <div className="vsl-footer-contact">
              {WHATSAPP_URL && (
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} aria-hidden="true" />
                  WhatsApp
                </a>
              )}
              <button type="button" onClick={() => openModal("call")}>
                <CalendarDays size={16} aria-hidden="true" />
                Agendar llamada
              </button>
            </div>
          </div>

          <div className="vsl-privacy">
            <h3>
              <ShieldCheck size={16} aria-hidden="true" />
              Política de privacidad
            </h3>
            <p>
              Usamos tus datos únicamente para atender tu solicitud y coordinar el servicio. No vendemos tu información
              personal. Puedes pedir la eliminación de tus datos escribiendo a nuestro equipo.
            </p>
          </div>

          <p className="vsl-copyright">© {new Date().getFullYear()} Armonía Digital. Todos los derechos reservados.</p>
        </div>
      </footer>

      {modal && <LeadModal mode={modal.mode} plan={modal.plan} onClose={closeModal} />}
    </div>
  );
}
