import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA({ copy }) {
  return (
    <section className="cta-section" id="contacto">
      <div className="container">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="cta-tag">{copy.tag}</span>
          <h2>{copy.title}</h2>
          <button className="cta-primary">
            <MessageCircle size={16} />
            {copy.whatsapp}
          </button>
          <p>{copy.note}</p>
        </motion.div>
      </div>
    </section>
  );
}
