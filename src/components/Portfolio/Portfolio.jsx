import { CalendarDays, Globe, Tags } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import ResearchProof from "../ResearchProof/ResearchProof";
import imgAurinel from "./Portfolio_Aurinel.avif";
import imgStarsoul from "./Portafolio-Starsoul.avif";
import imgPgExcellence from "./Portafolio-PG.avif";
import imgOniria from "./Portafolio-Oniria.avif";
import imgCasabueno from "./Portafolio-Casabueno.avif";
import imgLaSeleStore from "./Portafolio-LaSeleStore.avif";
import flagVE from "./flag-venezuela.png";
import flagCO from "./flag-Colombia.png";
import flagUS from "./flag-united-states.png";
import flagCL from "./flag-chile.png";
import flagAR from "./flag-Argentina.png";
import "./Portfolio.css";

const countryFlags = {
  VE: flagVE,
  CO: flagCO,
  US: flagUS,
  CL: flagCL,
  AR: flagAR,
};

const projectImages = {
  "Aurinel Martinez": imgAurinel,
  Starsoul: imgStarsoul,
  "La Sele Store": imgLaSeleStore,
  "PG Excellence": imgPgExcellence,
  "Oniria Propiedades": imgOniria,
  Casabueno: imgCasabueno,
};

const projectRedirectUrls = {
  "Aurinel Martinez": "https://aurinelmartinez.com/",
  "Oniria Propiedades": "https://www.oniriapropiedades.cl/",
  "La Sele Store": "https://www.armoniadigital.digital/selestore",
  "Casabueno": "http://casabueno.com.ar",
};

function projectHref(project) {
  const redirect = projectRedirectUrls[project.title];
  if (redirect) return redirect;
  return project.url ? `https://${project.url}` : "";
}

export default function Portfolio({ copy }) {
  const [activeFilter, setActiveFilter] = useState(copy.filters[0]);
  const isExternalContact = copy.contactHref?.startsWith("http");

  const projects = useMemo(
    () =>
      copy.projects.map((project) => ({
        title: project[0],
        type: project[1],
        categories: Array.isArray(project[1]) ? project[1] : [project[1]],
        country: project[2] || "",
        flag: countryFlags[project[2]] || "",
        url: project[3] || "",
        image: projectImages[project[0]] || "",
      })),
    [copy.projects]
  );

  const filteredProjects = useMemo(() => {
    if (activeFilter === "Todos") return projects;
    return projects.filter((project) => project.categories.includes(activeFilter));
  }, [activeFilter, projects]);

  const changeFilter = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <section className="portfolio-section" id="portafolio">
      <div className="portfolio-container">
        <div className="portfolio-layout">
          <div className="portfolio-heading-col">
            <span className="portfolio-kicker">{copy.kicker}</span>
            <h2 className="portfolio-title">{copy.title}</h2>
            <ResearchProof proof={copy.proof} className="portfolio-proof" />
          </div>

          <div className="portfolio-content-col">
            <div className="portfolio-filters" role="tablist" aria-label="Categorías del portafolio">
              {copy.filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={activeFilter === filter ? "active" : ""}
                  onClick={() => changeFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="portfolio-gallery" aria-live="polite">
              {filteredProjects.map((project, index) => (
                <motion.article
                  key={`${project.title}-${activeFilter}`}
                  className={`portfolio-card portfolio-card--real ${index === 0 ? "portfolio-card-featured" : ""}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.34, delay: index * 0.04 }}
                  layout
                  onClick={() => {
                    const redirectUrl = projectHref(project);
                    if (!redirectUrl) return;
                    window.open(redirectUrl, "_blank", "noopener,noreferrer");
                  }}
                  style={{ cursor: projectHref(project) ? "pointer" : "default" }}
                >
                  {project.image && (
                    <div className="portfolio-image-wrap">
                      <img src={project.image} alt={project.title} />
                    </div>
                  )}
                  <div className="portfolio-card-overlay">
                    <div className="portfolio-card-header">
                      {project.flag && (
                        <img
                          src={project.flag}
                          alt={`Bandera de ${project.country}`}
                          className="portfolio-card-flag-img"
                        />
                      )}
                      {project.categories.map((cat) => (
                        <span key={cat} className="portfolio-card-category">{cat}</span>
                      ))}
                    </div>
                    <div className="portfolio-card-copy">
                      <h3>{project.title}</h3>
                      {project.url && (
                        <span className="portfolio-card-url">
                          <Globe size={14} aria-hidden="true" /> {project.url}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="portfolio-button-wrapper">
              <a
                className="portfolio-button portfolio-button-primary"
                href="#precios"
              >
                Ver planes y precios
                <Tags size={18} aria-hidden="true" />
              </a>

              <a
                className="portfolio-button portfolio-button-secondary"
                href={copy.contactHref || "#contacto"}
                target={isExternalContact ? "_blank" : undefined}
                rel={isExternalContact ? "noreferrer" : undefined}
              >
                Agendar una llamada
                <CalendarDays size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
