import { motion } from "framer-motion";

export default function Stats({ proof }) {
  return (
    <section className="stats-section">
      <div className="container">
        <motion.div
          className="hero-research-proof"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <strong>{proof.value}</strong>
          <p>{proof.text}</p>
          <span>Fuente: {proof.source}</span>
        </motion.div>
      </div>
    </section>
  );
}
