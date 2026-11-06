import { useCallback, useEffect, useRef, useState } from "react";
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
<<<<<<< HEAD
import { AppointmentRequest as Appointment, PurchaseRequest as Checkout } from "./components/LeadRequest/Request";
import Onboarding from "./components/Onboarding/BriefAccess";
=======
import Appointment from "./components/Appointment/Appointment";
import Checkout from "./components/Checkout/Checkout";
import Onboarding from "./components/Onboarding/Onboarding";
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
import Footer from "./components/Footer/Footer";
import BackToTop from "./components/BackToTop";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import { getInitialLocale, locales } from "./i18n";
import { sendMetaEvent } from "./services/crm";
import { getPageMeta, getRouteFromPath, normalizePath, pageCanonical } from "./seo";

import "./index.css";

<<<<<<< HEAD
const PRIVATE_PAGES = ["welcome", "agendar", "brief"];
=======
const PAYLOAD_PAGES = ["welcome", "agendar", "brief"];
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
const ROUTE_PATHS = ["/", "/blog"];

function currentHash() {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "");
}

function currentPathname() {
  if (typeof window === "undefined") return "/";
  return normalizePath(window.location.pathname);
}

function getCheckoutPlanFromHash() {
  const hash = currentHash();
  if (!hash.startsWith("checkout")) return null;

  const query = hash.includes("?") ? hash.slice(hash.indexOf("?")) : "";
  const params = new URLSearchParams(query);
  return params.get("plan") || "";
}

function resolvePage(initialPath) {
  if (typeof window === "undefined") return getRouteFromPath(initialPath || "/");

  const hash = currentHash();
  if (hash === "welcome") return "welcome";
  if (hash === "agendar") return "appointment";
  if (hash === "brief") return "onboarding";
  if (hash.startsWith("checkout")) return "checkout";
  if (hash === "blog") return "blog";
  return getRouteFromPath(window.location.pathname);
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

<<<<<<< HEAD
function App({ initialPath = "/", initialPosts = null }) {
  const copy = locales[getInitialLocale()];
  const contactHref = copy.contact?.primaryHref || "#agendar";
  const purchaseHref = copy.contact?.purchaseHref || "#contacto";
  // First client render must match the HTML generated for the pathname.
  // Hash-only forms are resolved after hydration, not against server HTML.
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [path, setPath] = useState(() => normalizePath(initialPath));
  const [page, setPage] = useState(() => getRouteFromPath(initialPath));
  const [locationReady, setLocationReady] = useState(false);
=======
function App({ initialPath = "/" }) {
  const copy = locales[getInitialLocale()];
  const contactHref = copy.contact?.primaryHref || "#agendar";
  const purchaseHref = copy.contact?.purchaseHref || "#contacto";
  const [checkoutPlan, setCheckoutPlan] = useState(() => getCheckoutPlanFromHash());
  const [path, setPath] = useState(() =>
    typeof window === "undefined" ? normalizePath(initialPath) : currentPathname(),
  );
  const [page, setPage] = useState(() => resolvePage(initialPath));
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
  const firstView = useRef(true);

  const syncLocation = useCallback(() => {
    setCheckoutPlan(getCheckoutPlanFromHash());
    setPath(currentPathname());
    setPage(resolvePage("/"));
<<<<<<< HEAD
    setLocationReady(true);
=======
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
  }, []);

  const navigate = useCallback(
    (destination) => {
      if (typeof window === "undefined") return;
      window.history.pushState({}, "", destination);
      syncLocation();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [syncLocation],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash === "#blog") {
      window.history.replaceState({}, "", "/blog");
    }

    const keepPath = (target) => {
      if (currentPathname() !== "/") {
        window.history.replaceState({}, "", `/${window.location.hash}`);
      }
      target();
    };

    const scrollToAnchor = (id) => {
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    };

    const handleHashChange = () => {
      const hash = currentHash();

      if (hash === "blog") {
        navigate("/blog");
        return;
      }

<<<<<<< HEAD
      const isPrivate = PRIVATE_PAGES.includes(hash) || hash.startsWith("checkout");
=======
      const isPrivate = PAYLOAD_PAGES.includes(hash) || hash.startsWith("checkout");
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)

      if (!isPrivate && hash) {
        keepPath(syncLocation);
        scrollToAnchor(hash);
        return;
      }

      keepPath(syncLocation);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;

<<<<<<< HEAD
      let pathname, destination;
      try {
        const url = new URL(href, window.location.origin);
        pathname = normalizePath(url.pathname);
        destination = pathname + url.search + url.hash;
=======
      let pathname;
      try {
        pathname = normalizePath(new URL(href, window.location.origin).pathname);
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
      } catch {
        return;
      }

      if (!ROUTE_PATHS.includes(pathname)) return;

      event.preventDefault();
<<<<<<< HEAD
      navigate(destination);
=======
      navigate(pathname);
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
    };

    syncLocation();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", syncLocation);
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", syncLocation);
      document.removeEventListener("click", handleClick);
    };
  }, [navigate, syncLocation]);

  const metaKey = checkoutPlan !== null ? "checkout" : page;
  const routeKey = pageCanonical(metaKey);

  useEffect(() => {
<<<<<<< HEAD
    if (!locationReady) return;
=======
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
    const current = getPageMeta(metaKey);
    document.title = current.title;
    setMeta("description", current.description);
    setMeta("robots", current.robots);
    setMeta("og:title", current.title, "property");
    setMeta("og:description", current.description, "property");
    setMeta("og:url", routeKey, "property");
    setMeta("twitter:title", current.title);
    setMeta("twitter:description", current.description);
    setCanonical(routeKey);

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

    if (firstView.current) {
      firstView.current = false;
    } else {
      window.fbq?.("track", "PageView", { content_name: contentName });
      window.gtag?.("event", "page_view", {
        page_path: `${window.location.pathname}${window.location.hash}`,
        page_title: current.title,
      });
    }
<<<<<<< HEAD
  }, [metaKey, page, checkoutPlan, path, routeKey, locationReady]);
=======
  }, [metaKey, page, checkoutPlan, path, routeKey]);
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)

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
<<<<<<< HEAD
        <Blog copy={copy.blog} contactHref={contactHref} initialPosts={initialPosts} />
=======
        <Blog copy={copy.blog} contactHref={contactHref} />
>>>>>>> 2700640 (Lanzamiento: blindaje atómico de pagos Bold y estructura de VSL)
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
