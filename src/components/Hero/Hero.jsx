import "./Hero.css";
import { motion } from "framer-motion";

const avatar1 = "https://randomuser.me/api/portraits/men/32.jpg";
const avatar2 = "https://randomuser.me/api/portraits/women/44.jpg";
const avatar3 = "https://randomuser.me/api/portraits/men/65.jpg";
const avatar4 = "https://randomuser.me/api/portraits/women/68.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero__container">
        <motion.div
          className="hero__content"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h1 className="hero__title">
            <span className="hero__title-main">Sitios web que</span>
            <span className="hero__title-focus">
              Generan <em>Confianza</em>
            </span>
            <span className="hero__title-main">y atraen clientes.</span>
          </h1>

          <p className="hero__description">
            Diseñamos sitios web modernos, rápidos y optimizados para que tu
            negocio se vea profesional y convierta más.
          </p>

          <div className="hero__buttons">
            <a href="#precios" className="btn btn-primary">
              Ver precios
            </a>
            <a href="#portafolio" className="btn btn-secondary">
              Ver proyectos
            </a>
          </div>

          <div className="hero__socialProof">
            <div className="hero__avatars">
              <img src={avatar1} alt="Cliente de Armonía Digital" />
              <img src={avatar2} alt="Cliente de Armonía Digital" />
              <img src={avatar3} alt="Cliente de Armonía Digital" />
              <img src={avatar4} alt="Cliente de Armonía Digital" />
            </div>
            <div className="hero__proofText">
              <strong>+120 negocios</strong>
              <span>confían en nosotros</span>
            </div>
          </div>
        </motion.div>

        <div className="hero__visual" aria-hidden="true" />
      </div>
    </section>
  );
}
