export const SITE_URL = "https://armoniadigital.digital";

const PAGES = {
  home: {
    path: "/",
    title: "Armonía Digital | Diseño de páginas web para negocios locales",
    description:
      "Diseñamos páginas web modernas, rápidas y optimizadas para negocios locales. Sitios profesionales que generan confianza, atraen clientes y pueden tener primer adelanto en 72 horas.",
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
  blog: {
    path: "/blog",
    title: "Blog de Armonía Digital | Diseño web, confianza y conversión",
    description:
      "Ideas prácticas sobre diseño web, presencia digital, confianza y conversión para negocios locales que quieren vender mejor online.",
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
  checkout: {
    path: "/",
    title: "Checkout | Armonía Digital",
    description: "Formulario para iniciar un proyecto web con Armonía Digital.",
    robots: "noindex, nofollow",
  },
  welcome: {
    path: "/",
    title: "Bienvenida al proyecto | Armonía Digital",
    description: "Página privada de bienvenida para clientes de Armonía Digital.",
    robots: "noindex, nofollow",
  },
  appointment: {
    path: "/",
    title: "Agenda una llamada | Armonía Digital",
    description: "Formulario previo para agendar una llamada gratis de consultoría con Armonía Digital.",
    robots: "noindex, nofollow",
  },
  onboarding: {
    path: "/",
    title: "Brief esencial | Armonía Digital",
    description: "Página interna de onboarding para recopilar la información esencial de un proyecto e-commerce.",
    robots: "noindex, nofollow",
  },
};

export function normalizePath(pathname) {
  if (!pathname) return "/";
  const clean = String(pathname).split("?")[0].split("#")[0];
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  const collapsed = withSlash.replace(/\/+$/, "");
  return collapsed === "" ? "/" : collapsed;
}

export function getRouteFromPath(pathname) {
  return normalizePath(pathname) === "/blog" ? "blog" : "home";
}

export function getPageMeta(page) {
  return PAGES[page] || PAGES.home;
}

export function pageCanonical(page) {
  const target = getPageMeta(page).path;
  return target === "/" ? `${SITE_URL}/` : `${SITE_URL}${target}`;
}
