import { ArrowRight, CalendarDays, Check, Sparkles } from "lucide-react";
import { includedItems, planDisclaimer, plans } from "../data/plans";
import { track } from "../lib/analytics";

export default function Plans({ onCheckout, onCall }) {
  return (
    <section className="vsl-section vsl-plans" id="planes">
      <div className="vsl-container">
        <header className="vsl-section-head">
          <span className="vsl-kicker">Precios</span>
          <h2>
            El plan <span className="vsl-highlight">perfecto</span> para tu negocio.
          </h2>
          <p>
            Elige el punto de partida que mejor encaje contigo. Si no estás seguro, te ayudamos a decidir en una
            llamada gratis.
          </p>
        </header>

        <div className="vsl-plan-grid">
          {plans.map((plan) => (
            <article key={plan.id} className={`vsl-plan ${plan.featured ? "is-featured" : ""}`}>
              {plan.featured && <span className="vsl-plan-badge">{plan.badge}</span>}

              <header className="vsl-plan-head">
                <h3>{plan.name}</h3>
                <p>{plan.tagline}</p>
              </header>

              <div className="vsl-plan-price">
                <strong>{plan.priceLabel}</strong>
                <span>USD · {plan.note}</span>
              </div>

              <ul className="vsl-plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} strokeWidth={3} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="vsl-plan-actions">
                <button
                  type="button"
                  className="vsl-button vsl-button-primary"
                  onClick={() => {
                    track("InitiateCheckout", {
                      content_name: plan.name,
                      content_category: "vsl_plan",
                      value: plan.price,
                      currency: "USD",
                    });
                    onCheckout(plan);
                  }}
                >
                  {plan.cta}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="vsl-button vsl-button-ghost"
                  onClick={() => {
                    track("Contact", {
                      content_name: plan.name,
                      content_category: "vsl_plan_call",
                    });
                    onCall(plan);
                  }}
                >
                  <CalendarDays size={16} aria-hidden="true" />
                  Agendar llamada
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="vsl-custom">
          <div>
            <span className="vsl-kicker">A medida</span>
            <h3>¿Tu proyecto necesita algo más específico?</h3>
            <p>
              Hay ideas que necesitan más que una web tradicional: un sistema interno, una integración, una
              automatización o un flujo hecho para tu negocio. Cuéntanos qué quieres lograr y lo aterrizamos contigo
              en una llamada.
            </p>
          </div>
          <button type="button" className="vsl-button vsl-button-outline" onClick={() => onCall(null)}>
            <Sparkles size={17} aria-hidden="true" />
            Hablar de mi proyecto
          </button>
        </div>

        <div className="vsl-included">
          <div className="vsl-included-head">
            <span className="vsl-kicker">Incluido en todos los planes</span>
            <h3>Todo esto viene incluido sin importar el plan que elijas.</h3>
            <p>
              No empezamos desde cero ni improvisamos. Armamos una primera versión clara en 72 horas, con estructura,
              mensaje y detalles técnicos listos para revisar y mejorar juntos.
            </p>
          </div>

          <ul className="vsl-included-grid">
            {includedItems.map((item) => (
              <li key={item}>
                <Check size={15} strokeWidth={3} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="vsl-disclaimer">{planDisclaimer}</p>
      </div>
    </section>
  );
}
