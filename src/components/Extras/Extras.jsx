import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Megaphone,
  PenLine,
  Store,
  Tags,
  Video,
  Wrench,
} from "lucide-react";

const icons = [
  <BriefcaseBusiness size={36} strokeWidth={1.7} />,
  <Store size={36} strokeWidth={1.7} />,
  <Megaphone size={36} strokeWidth={1.7} />,
  <Video size={36} strokeWidth={1.7} />,
  <Wrench size={36} strokeWidth={1.7} />,
  <PenLine size={36} strokeWidth={1.7} />,
  <BadgeCheck size={36} strokeWidth={1.7} />,
];

export default function Extras({ copy }) {
  const isExternalContact = copy.contactHref?.startsWith("http");

  return (
    <section className="extras-section" id="extras">
      <div className="container container-wide extras-wrapper">
        <div className="extras-heading">
          <span className="section-kicker">{copy.kicker}</span>
          <h2 className="extras-title">{copy.title}</h2>
        </div>

        <div className="extras-grid">
          {copy.items.map((item, index) => (
            <article className="extra-card" key={item[0]}>
              <div className="extra-icon">{icons[index]}</div>
              <div className="extra-copy">
                <h3>{item[0]}</h3>
                <p>{item[1]}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="extras-cta">
          <div>
            <span>¿Quieres sumar alguno a tu web?</span>
            <p>Podemos ayudarte a elegir qué complemento tiene más sentido para tu negocio ahora.</p>
          </div>

          <div className="extras-cta-actions">
            <a className="extras-cta-primary" href="#precios">
              <Tags size={18} />
              Ver planes y precios
            </a>
            <a
              className="extras-cta-secondary"
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
