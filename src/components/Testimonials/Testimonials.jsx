import { ArrowLeft, ArrowRight, CalendarDays, Star, Tags } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
];

export default function Testimonials({ copy }) {
  const [active, setActive] = useState(0);
  const visibleItems = [...copy.items, ...copy.items.slice(0, 2)];
  const isExternalContact = copy.contactHref?.startsWith("http");

  const goToPrevious = () => {
    setActive((current) => (current === 0 ? copy.items.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActive((current) => (current === copy.items.length - 1 ? 0 : current + 1));
  };

  return (
    <section className="testimonials-section" id="testimonios">
      <div className="container testimonials-layout">
        <div className="testimonials-heading-row">
          <div className="testimonials-heading">
            <span className="section-kicker">{copy.kicker}</span>
            <h2 className="testimonials-title">
              Lo que <span>dicen nuestros clientes.</span>
            </h2>
          </div>

          <div className="testimonials-arrows" aria-label="Controles de testimonios">
            <button type="button" onClick={goToPrevious} aria-label="Testimonio anterior">
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={goToNext} aria-label="Siguiente testimonio">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="testimonials-content">
          <div className="testimonials-slider">
            <div
              className="testimonials-track"
              style={{ transform: `translateX(calc(-${active} * (var(--testimonial-card-width) + var(--testimonial-gap))))` }}
            >
            {visibleItems.map((item, index) => (
              <motion.article
                key={`${item[0]}-${index}`}
                className="testimonial-card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % copy.items.length) * 0.08 }}
              >
                <div className="testimonial-card-top">
                  <div className="stars" aria-label="5 estrellas">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" strokeWidth={2.2} />
                    ))}
                  </div>
                  <span>0{(index % copy.items.length) + 1}</span>
                </div>

                <p className="testimonial-text">"{item[2]}"</p>

                <div className="testimonial-user">
                  <img className="testimonial-avatar" src={avatars[index % avatars.length]} alt={item[0]} />
                  <div>
                    <h4>{item[0]}</h4>
                    <span>{item[1]}</span>
                  </div>
                </div>
              </motion.article>
            ))}
            </div>
          </div>

          <div className="testimonial-dots" aria-label="Navegación de testimonios">
            {copy.items.map((item, index) => (
              <button
                key={item[0]}
                type="button"
                className={index === active ? "active" : ""}
                onClick={() => setActive(index)}
                aria-label={`Ver testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="testimonials-cta">
          <div>
            <span>¿Quieres que tu web genere esta confianza?</span>
            <p>Revisemos qué plan encaja mejor contigo o agenda una llamada para resolver dudas antes de empezar.</p>
          </div>

          <div className="testimonials-cta-actions">
            <a className="testimonials-cta-primary" href="#precios">
              <Tags size={18} />
              Ver planes y precios
            </a>
            <a
              className="testimonials-cta-secondary"
              href={copy.contactHref || "#contacto"}
              target={isExternalContact ? "_blank" : undefined}
              rel={isExternalContact ? "noreferrer" : undefined}
            >
              <CalendarDays size={18} />
              Agendar llamada
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
