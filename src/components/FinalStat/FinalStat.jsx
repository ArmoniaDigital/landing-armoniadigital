import { motion } from "framer-motion";

export default function FinalStat({ proof }) {
  if (!proof) return null;

  return (
    <section className="final-stat-section">
      <div className="container">
        <motion.div
          className="final-stat"
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
