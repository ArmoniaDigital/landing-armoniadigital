import { BarChart3, Bot, Check, Compass } from "lucide-react";
import { motion } from "framer-motion";
import ResearchProof from "../ResearchProof/ResearchProof";
import { sendMetaEvent } from "../../services/crm";

const icons = [Compass, Bot, BarChart3];

export default function Pricing({ copy }) {
  const isExternalContact = copy.contactHref?.startsWith("http");

  return (
    <section className="pricing-section" id="precios">
      <div className="container pricing-layout">
        <div className="pricing-title-wrap">
          <span className="pricing-kicker">{copy.kicker}</span>
          <h2 className="pricing-title">
            {copy.titleStart}{" "}
            <span>{copy.titleHighlight}</span>
            {" "}{copy.titleEnd}
          </h2>
          <p className="pricing-subtitle">{copy.subtitle}</p>
          <ResearchProof proof={copy.proof} className="pricing-proof" />
        </div>

        <div className="pricing-grid">
          {copy.plans.map((plan, index) => {
            const featured = index === 1;
            const Icon = icons[index];

            return (
              <motion.div
                key={plan.name}
                className={`pricing-card ${featured ? "featured-plan" : ""}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                {featured && <div className="popular-badge">{copy.popular}</div>}
                <div className="plan-icon">
                  <Icon size={18} strokeWidth={2.3} />
                </div>
                <div className="plan-main">
                  <h3>{plan.name}</h3>
                  <p className="plan-intro">{plan.description}</p>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={14} strokeWidth={3} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="plan-footer">
                  <div className="price">
                    {plan.price}
                    <small>USD</small>
                  </div>
                  <div className="plan-actions">
                    <a
                      className="plan-button plan-button-call"
                      href={copy.contactHref || "#contacto"}
                      target={isExternalContact ? "_blank" : undefined}
                      rel={isExternalContact ? "noreferrer" : undefined}
                      aria-label={`${copy.schedule} - ${plan.name}`}
                      onClick={() => {
                        sendMetaEvent("Contact", {
                          source: "pricing_schedule_click",
                          selectedPlan: plan.name,
                          content_name: plan.name,
                          content_category: "pricing_plan",
                          value: plan.price,
                        }).catch(() => {});
                      }}
                    >
                      {copy.schedule}
                    </a>
                    <a
                      className="plan-button plan-button-buy"
                      href={`#checkout?plan=${encodeURIComponent(plan.name)}`}
                      aria-label={`${copy.buy} ${plan.name}`}
                      onClick={() => {
                        sendMetaEvent("ViewContent", {
                          source: "pricing_buy_click",
                          selectedPlan: plan.name,
                          content_name: plan.name,
                          content_category: "pricing_plan",
                          value: plan.price,
                        }).catch(() => {});
                      }}
                    >
                      {copy.buy}
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {copy.customProject && (
          <div className="pricing-custom-project">
            <div>
              <span>{copy.customProject.kicker}</span>
              <h3>{copy.customProject.title}</h3>
              <p>{copy.customProject.text}</p>
            </div>
            <a
              className="pricing-custom-button"
              href={copy.contactHref || "#agendar"}
              target={isExternalContact ? "_blank" : undefined}
              rel={isExternalContact ? "noreferrer" : undefined}
              onClick={() => {
                sendMetaEvent("Contact", {
                  source: "custom_project_schedule_click",
                  selectedPlan: "Plan personalizado",
                  content_name: "Plan personalizado",
                  content_category: "custom_project",
                }).catch(() => {});
              }}
            >
              {copy.customProject.button}
            </a>
          </div>
        )}

        <div className="pricing-included">
          <span className="pricing-included-kicker">{copy.included.kicker}</span>
          <h3>{copy.included.title}</h3>
          <p>{copy.included.text}</p>

          <div className="pricing-included-list">
            {copy.included.items.map((item) => (
              <div className="pricing-included-item" key={item}>
                <Check size={15} strokeWidth={3} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="pricing-disclaimer">{copy.included.disclaimer}</p>
      </div>
    </section>
  );
}
