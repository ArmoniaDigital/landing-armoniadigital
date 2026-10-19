export const CONSENT_KEY = "armonia-cookie-consent";
export const OPEN_CONSENT_EVENT = "armonia:open-consent";
export const PIXEL_ID = "4440745886187242";
const GA_ID = "G-PRVFVEYZXQ";
const GTM_ID = "GTM-KS7MMJPS";
const PUBLIC_EVENTS = new Set(["PageView", "ViewContent", "Contact", "InitiateCheckout"]);

export function createAnalytics({ win, doc, metaEndpoint = "", fetcher = globalThis.fetch } = {}) {
  let consent = null, initialized = false, loaded = false, lastView = "", pendingView = null;
  const subscribers = new Set();
  const consentValues = (value) => Object.fromEntries(["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"].map((key) => [key, value]));
  function readConsent() {
    try { const value = win.localStorage.getItem(CONSENT_KEY); return ["accepted", "rejected", "dismissed"].includes(value) ? value : null; }
    catch { return null; }
  }
  function script(id, src) {
    if (doc.getElementById(id)) return;
    const element = doc.createElement("script");
    element.id = id; element.async = true; element.src = src;
    doc.head.appendChild(element);
  }
  function load() {
    win.dataLayer ||= [];
    win.gtag ||= function () { win.dataLayer.push(arguments); };
    win[`ga-disable-${GA_ID}`] = false;
    win.gtag("consent", "update", consentValues("granted"));
    if (!win.fbq) {
      const fbq = function () { if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments); else fbq.queue.push(arguments); };
      fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
      win.fbq = fbq; win._fbq = fbq;
    }
    win.fbq("consent", "grant");
    if (loaded) return;
    loaded = true;
    win.fbq("init", PIXEL_ID);
    script("armonia-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
    win.gtag("js", new Date());
    win.gtag("config", GA_ID);
    script("armonia-google-tag", `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
    win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    script("armonia-google-manager", `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  }
  function revoke() {
    lastView = "";
    win[`ga-disable-${GA_ID}`] = true;
    win.gtag?.("consent", "update", consentValues("denied"));
    win.fbq?.("consent", "revoke");
    const host = win.location.hostname;
    for (const name of ["_fbp", "_fbc", "_ga", "_gid", "_gat", "_ga_PRVFVEYZXQ"]) {
      doc.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      const parts = host.split(".");
      for (let i = 0; i < parts.length - 1; i++) doc.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${parts.slice(i).join(".")}; SameSite=Lax`;
    }
  }
  function apply(next) {
    const previous = consent;
    consent = next;
    try {
      if (next === "accepted") load(); else if (previous === "accepted" || loaded) revoke();
    } catch { /* A blocked vendor must not prevent forms or preferences from working. */ }
    for (const subscriber of subscribers) subscriber(next);
    if (next === "accepted" && previous !== "accepted" && pendingView) void track("PageView", pendingView).catch(() => {});
  }
  function initialize() {
    if (initialized) return;
    initialized = true;
    win.dataLayer ||= [];
    win.gtag ||= function () { win.dataLayer.push(arguments); };
    win.gtag("consent", "default", consentValues("denied"));
    apply(readConsent());
    win.addEventListener("storage", (event) => { if (event.key === CONSENT_KEY || event.key === null) apply(readConsent()); });
  }
  function setConsent(value) {
    initialize();
    if (!["accepted", "rejected", "dismissed"].includes(value)) return;
    try { win.localStorage.setItem(CONSENT_KEY, value); } catch { /* Consent still applies to this page if storage is blocked. */ }
    apply(value);
  }
  function cookie(name) {
    return doc.cookie.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1) || "";
  }
  async function track(event, payload = {}) {
    initialize();
    if (!PUBLIC_EVENTS.has(event)) return { skipped: true, reason: "unsupported_event" };
    const custom = {};
    for (const [key, limit] of Object.entries({ source: 60, content_name: 100, content_category: 100, selectedPlan: 80 })) {
      if (typeof payload[key] === "string") custom[key] = payload[key].replace(/[\u0000-\u001f\u007f]/g, "").normalize("NFC").trim().slice(0, limit);
    }
    if (event === "PageView") pendingView = custom;
    if (consent !== "accepted") return { skipped: true, reason: "consent_required" };
    const viewKey = custom.content_name || "home";
    if (event === "PageView" && lastView === viewKey) return { skipped: true, reason: "duplicate_view" };
    const eventId = win.crypto.randomUUID();
    if (event === "PageView") lastView = viewKey;
    win.fbq("trackSingle", PIXEL_ID, event, custom, { eventID: eventId });
    if (!metaEndpoint) return { browserQueued: true, server: "not_configured", eventId };
    try {
      const target = new URL(metaEndpoint);
      if (target.protocol !== "https:" || target.origin !== "https://crm-readyin72.vercel.app" || target.pathname !== "/api/landing/meta-event" || target.search || target.hash || target.username || target.password) throw new Error("invalid endpoint");
      const response = await fetcher(target.href, {
        method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ event, consent: true, ...custom, browser: {
          eventId, eventSourceUrl: `${win.location.origin}${win.location.pathname}`,
          fbp: cookie("_fbp"), fbc: cookie("_fbc"),
        } }),
      });
      const result = await response.json();
      if (!response.ok || result?.ok !== true || result?.eventsReceived !== 1) return { browserQueued: true, server: "unconfirmed", eventId };
      return { browserQueued: true, server: "accepted", eventId };
    } catch { return { browserQueued: true, server: "unconfirmed", eventId }; }
  }
  return { initialize, setConsent, track, getConsent: () => { initialize(); return consent; },
    subscribe: (callback) => { subscribers.add(callback); return () => subscribers.delete(callback); },
  };
}
