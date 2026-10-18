import { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Stats from "./components/Stats/Stats";
import Benefits from "./components/Benefits/Benefits";
import Pricing from "./components/pricing/Pricing";
import Portfolio from "./components/Portfolio/Portfolio";
import Extras from "./components/Extras/Extras";
import Preparation from "./components/Preparation/Preparation";
import Testimonials from "./components/Testimonials/Testimonials";
import FAQ from "./components/FAQ/FAQ";
import FinalStat from "./components/FinalStat/FinalStat";
import Blog from "./components/Blog/Blog";
import Welcome from "./components/Welcome/Welcome";
import { AppointmentRequest as Appointment, PurchaseRequest as Checkout } from "./components/LeadRequest/Request";
import Onboarding from "./components/Onboarding/Onboarding";
import Footer from "./components/Footer/Footer";
import BackToTop from "./components/BackToTop";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import { getInitialLocale, locales } from "./i18n";
import { sendMetaEvent } from "./services/crm";

import "./index.css";

function getCheckoutPlanFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith("checkout")) return null;

  const query = hash.includes("?") ? hash.slice(hash.indexOf("?")) : "";
  const params = new URLSearchParams(query);
  return params.get("plan") || "";
}

function getPageFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "blog") return "blog";
  if (hash === "welcome") return "welcome";
  if (hash === "agendar") return "appointment";
  if (hash === "brief") return "onboarding";
  return "home";
}

function setMeta(name, content, attribute = "name") {
  let tag = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function App() {
  const copy = locales[getInitialLocale()];
  const contactHref = copy.contact?.primaryHref || "#agendar";
  const purchaseHref = copy.contact?.purchaseHref || "#contacto";
  const [checkoutPlan, setCheckoutPlan] = useState(() => getCheckoutPlanFromHash());
  const [page, setPage] = useState(() => getPageFromHash());

  useEffect(() => {
    const baseUrl = "https://armoniadigital.digital/";
    const meta = {
      home: {
        title: "Armonía Digital | Diseño de páginas web para negocios locales",
        description: "Diseñamos páginas web modernas, rápidas y optimizadas para negocios locales. Sitios profesionales que generan confianza, atraen clientes y pueden tener primer adelanto en 72 horas.",
        robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      blog: {
        title: "Blog de Armonía Digital | Diseño web, confianza y conversión",
        description: "Ideas prácticas sobre diseño web, presencia digital, confianza y conversión para negocios locales que quieren vender mejor online.",
        robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      welcome: {
        title: "Bienvenida al proyecto | Armonía Digital",
        description: "Página privada de bienvenida para clientes de Armonía Digital.",
        robots: "noindex, nofollow",
      },
      appointment: {
        title: "Agenda una llamada | Armonía Digital",
        description: "Formulario previo para agendar una llamada gratis de consultoría con Armonía Digital.",
        robots: "noindex, nofollow",
      },
      onboarding: {
        title: "Brief esencial | Armonía Digital",
        description: "Pagina interna de onboarding para recopilar la informacion esencial de un proyecto e-commerce.",
        robots: "noindex, nofollow",
      },
      checkout: {
        title: "Checkout | Armonía Digital",
        description: "Formulario para iniciar un proyecto web con Armonía Digital.",
        robots: "noindex, nofollow",
      },
    };

    const current = checkoutPlan !== null ? meta.checkout : meta[page] || meta.home;
    document.title = current.title;
    setMeta("description", current.description);
    setMeta("robots", current.robots);
    setMeta("og:title", current.title, "property");
    setMeta("og:description", current.description, "property");
    setMeta("og:url", baseUrl, "property");
    setMeta("twitter:title", current.title);
    setMeta("twitter:description", current.description);
    setCanonical(baseUrl);

    const contentName = checkoutPlan !== null ? `Checkout - ${checkoutPlan || "Plan"}` : page;
    sendMetaEvent("PageView", {
      source: "page_view",
      content_name: contentName,
      content_category: "website_page",
    }).catch(() => {});

    if (checkoutPlan !== null) {
      sendMetaEvent("ViewContent", {
        source: "checkout_view",
        selectedPlan: checkoutPlan,
        content_name: `Checkout ${checkoutPlan || ""}`.trim(),
        content_category: "pricing_checkout",
      }).catch(() => {});
    }
  }, [page, checkoutPlan]);

  useEffect(() => {
    const handleHashChange = () => {
      const nextCheckoutPlan = getCheckoutPlanFromHash();
      const nextPage = getPageFromHash();
      setCheckoutPlan(nextCheckoutPlan);
      setPage(nextPage);

      if (nextCheckoutPlan !== null || nextPage === "blog" || nextPage === "welcome" || nextPage === "appointment" || nextPage === "onboarding") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const targetId = window.location.hash.replace(/^#/, "");
      if (targetId) {
        window.setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (checkoutPlan !== null) {
    return (
      <>
        <Checkout
          copy={copy.checkout}
          plans={copy.pricing.plans}
          selectedPlan={checkoutPlan}
          contactHref={purchaseHref}
        />
        <CookieConsent />
      </>
    );
  }

  if (page === "blog") {
    return (
      <>
        <Navbar copy={{ ...copy.nav, contactHref }} />
        <Blog copy={copy.blog} contactHref={contactHref} />
        <Footer copy={{ ...copy.footer, brand: copy.nav.brand, contactHref }} />
        <BackToTop />
        <CookieConsent />
      </>
    );
  }

  if (page === "welcome") {
    return (
      <>
        <Welcome />
        <CookieConsent />
      </>
    );
  }

  if (page === "appointment") {
    return (
      <>
        <Appointment copy={copy.appointment} />
        <CookieConsent />
      </>
    );
  }

  if (page === "onboarding") {
    return (
      <>
        <Onboarding />
        <CookieConsent />
      </>
    );
  }

  return (
    <>
      <Navbar copy={{ ...copy.nav, contactHref }} />
      <Hero copy={copy.hero} />
      <Stats proof={copy.stats} />
      <Benefits copy={{ ...copy.benefits, contactHref }} />
      <Preparation copy={{ ...copy.preparation, contactHref }} />
      <Pricing copy={{ ...copy.pricing, contactHref, purchaseHref }} />
      <Portfolio copy={{ ...copy.portfolio, contactHref }} />
      <Extras copy={{ ...copy.extras, contactHref }} />
      <Testimonials copy={{ ...copy.testimonials, contactHref }} />
      <FAQ copy={copy.faq} />
      <FinalStat proof={copy.finalStat} />
      <Footer copy={{ ...copy.footer, brand: copy.nav.brand, contactHref }} />
      <BackToTop />
      <CookieConsent />
    </>
  );
}

export default App;
