import { ArrowRight, Check, CalendarDays, Compass, Bot, BarChart3 } from "lucide-react";
import { plans, planDisclaimer } from "../data/plans";
import { useEffect, useState } from "react";

export default function PlanOffer({ onPurchase }) {
  const [selected, setSelected] = useState(plans[0].id);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 700px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const icons = { launch: Compass, business: Bot, store: BarChart3 };
  const scope = { launch: "Una página para empezar", business: "Hasta 5 páginas para tu negocio", store: "Diseño avanzado y más alcance" };
  return <section id="planes" className="purchase-offer" aria-labelledby="purchase-offer-title">
    <div className="vsl-container">
      <header className="purchase-offer-heading"><p className="vsl-kicker">Tu próxima web</p><h2 id="purchase-offer-title">Elige cómo empezar.</h2><p>Tres planes. Un solo pago. Una web a la altura de tu negocio.</p></header>
      {compact && <fieldset className="purchase-plan-picker"><legend>¿Qué necesita tu negocio?</legend>{plans.map(plan => <label className={`purchase-plan-option${selected === plan.id ? " is-selected" : ""}`} key={plan.id}><input type="radio" name="web-plan" value={plan.id} checked={selected === plan.id} onChange={() => setSelected(plan.id)} aria-controls={`plan-detail-${plan.id}`} /><span className="purchase-option-copy"><strong>{plan.name}</strong><span>{scope[plan.id]}</span></span><span className="purchase-option-price">{plan.priceLabel}<small>USD</small></span></label>)}</fieldset>}
      <div className="purchase-plans">
        {plans.map((plan) => <article id={`plan-detail-${plan.id}`} aria-labelledby={`plan-name-${plan.id}`} hidden={compact && selected !== plan.id} className={`purchase-plan${plan.featured ? " purchase-plan-featured" : ""}`} key={plan.id}>
          <header><span className="purchase-plan-icon" aria-hidden="true">{(() => { const Icon = icons[plan.id]; return <Icon size={22} />; })()}</span><h3 id={`plan-name-${plan.id}`}>{plan.name}</h3><p>{plan.tagline}</p></header>
          <p className="purchase-price"><strong>{plan.priceLabel}</strong><span>USD · {plan.note}</span></p>
          {compact && <p className="purchase-includes">Tu plan incluye</p>}
          <ul>{plan.features.map((feature) => <li key={feature}><Check size={16} aria-hidden="true" /><span>{feature}</span></li>)}</ul>
          <button type="button" className="vsl-button vsl-button-primary" onClick={() => onPurchase(plan)} aria-label={`Comprar plan ${plan.name} por ${plan.price} dólares`}>{compact ? `Elegir ${plan.name}` : "Comprar este plan"} <ArrowRight size={17} aria-hidden="true" /></button>
        </article>)}
      </div>
      <p className="purchase-terms">{planDisclaimer}</p>
    </div>
    <section id="agendar" className="purchase-call" aria-labelledby="purchase-call-title"><div className="vsl-container purchase-call-layout">
      <div><p className="campaign-eyebrow">Hablemos de tu proyecto</p><h2 id="purchase-call-title">¿Aún tienes dudas?<br /><span>Decidamos juntos.</span></h2><p className="purchase-call-copy">Conversemos sobre tu negocio, lo que necesitas y el plan que mejor se adapta a tu próxima web.</p></div>
      <div className="purchase-call-action"><span className="purchase-call-icon" aria-hidden="true"><CalendarDays size={32} /></span><p>Tu próximo paso, con claridad.</p><a className="vsl-button vsl-button-primary" href="https://www.armoniadigital.digital/#agendar">Agendar una llamada <ArrowRight size={18} aria-hidden="true" /></a><small>Primera llamada sin costo y sin compromiso de contratación.</small></div>
    </div></section>
  </section>;
}
