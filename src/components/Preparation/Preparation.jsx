import {
  BadgeInfo,
  CalendarCheck,
  Camera,
  ClipboardList,
  Contact,
  Image,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";

const icons = [BadgeInfo, Image, Camera, ClipboardList, Lightbulb, Contact];

export default function Preparation({ copy }) {
  const isExternalContact = copy.contactHref?.startsWith("http");

  return (
    <section className="preparation-section" id="preparacion">
      <div className="container container-wide preparation-layout">
        <div className="preparation-heading">
          <span>{copy.kicker}</span>
          <h2>{copy.title}</h2>
          <p>{copy.text}</p>
        </div>

        <div className="preparation-timeline">
          {copy.items.map((item, index) => {
            const Icon = icons[index];

            return (
              <motion.article
                className="preparation-step"
                key={item[0]}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <span className="preparation-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="preparation-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <div>
                  <h3>{item[0]}</h3>
                  <p>{item[1]}</p>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="preparation-cta">
          <div>
            <strong>{copy.ctaTitle}</strong>
            <span>{copy.ctaText}</span>
          </div>
          <a
            href={copy.contactHref || "#contacto"}
            target={isExternalContact ? "_blank" : undefined}
            rel={isExternalContact ? "noreferrer" : undefined}
          >
            <CalendarCheck size={18} strokeWidth={2.3} />
            {copy.ctaButton}
          </a>
        </div>
      </div>
    </section>
  );
}
