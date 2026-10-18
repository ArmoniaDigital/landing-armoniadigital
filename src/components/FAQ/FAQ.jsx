import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQ({ copy }) {
  const [open, setOpen] = useState(null);

  return (
    <section className="faq-section" id="faq">
      <div className="container faq-layout">
        <div className="faq-heading">
          <span className="section-kicker">{copy.kicker}</span>
          <h2 className="faq-title">{copy.title}</h2>
          <p className="faq-subtitle">{copy.subtitle}</p>
        </div>

        <div className="faq-content">
          <div className="faq-visual" aria-hidden="true">
            <span>FAQ</span>
            <i />
          </div>

          <div className="faq-list">
            {copy.items.map((item, index) => {
              const isOpen = open === index;

              return (
                <div key={item[0]} className={`faq-item ${isOpen ? "active" : ""}`}>
                  <button
                    className="faq-question"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="faq-question-text">{item[0]}</span>
                    <ChevronDown className={`faq-icon ${isOpen ? "rotate" : ""}`} size={17} />
                  </button>

                  <div className="faq-answer" aria-hidden={!isOpen}>
                    <p>{item[1]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
