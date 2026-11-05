import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, X, ChevronDown } from "lucide-react";
import MobileCover from "./components/MobileCover";
import faq from "./data/faq.json";
import HomeVideo from "./components/HomeVideo";
import CampaignFooter from "./components/CampaignFooter";
import VideoEndCard from "./components/VideoEndCard";
import CookieConsent from "./components/CookieConsent";

const LeadModal = lazy(() => import("./components/LeadModal"));
const OfferReveal = lazy(() => import("./components/OfferReveal"));
const PlanOffer = lazy(() => import("./components/PlanOffer"));

export default function Strategy() {
  const [modal, setModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [previewOffer, setPreviewOffer] = useState(false);
  const introKey = 0;
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 600px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    const update = () => { setMobile(query.matches); setFailed(false); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const offerRef = useRef(null);
  const pageRef = useRef(null);
  const visibleProgress = previewOffer ? 1 : progress;
  const offerVisible = visibleProgress >= 1;
  const choosePlan = () => document.getElementById("planes")?.scrollIntoView({ block: "start", behavior: "smooth" });
  const localPreview = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname) || new URLSearchParams(window.location.search).get("revision") === "1";
  useEffect(() => {
    if (previewOffer) offerRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [previewOffer]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let media;
    import("gsap").then(({ gsap }) => {
      if (disposed || !pageRef.current) return;
      media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline.from(".strategy-signature img", { y: -14, duration: 0.55, clearProps: "transform" }, 0.55)
          .from(".strategy-title-line", { yPercent: 105, stagger: 0.12, duration: 0.85, ease: "power4.out", clearProps: "transform" }, 0.65)
          .from(mobile ? ".strategy-video-stage" : ".desktop-scene", { y: 22, scale: 0.985, duration: 1, clearProps: "transform" }, 0.75);
      }, pageRef.current);
    }).catch(() => { /* Content remains visible if the optional animation fails. */ });
    return () => { disposed = true; media?.revert(); };
  }, [introKey, mobile]);
  const close = useCallback(() => setModal(false), []);
  const buy = (plan) => setModal({ mode: "checkout", plan });
  const video = ((mobile ? import.meta.env.VITE_VSL_MOBILE_VIDEO_URL : import.meta.env.VITE_VSL_VIDEO_URL) || "").trim();
  const poster = ((mobile ? import.meta.env.VITE_VSL_MOBILE_POSTER_URL : import.meta.env.VITE_VSL_POSTER_URL) || "").trim();
  return <div ref={pageRef} className="vsl strategy strategy-premium">
    <div key={`wash-${introKey}`} className="strategy-white-wash" aria-hidden="true" />
    <a className="strategy-skip" href="#inicio">Ir al contenido</a>
    <main id="inicio">
      <section className="strategy-hero vsl-container">
        <div className={mobile ? undefined : "desktop-scene"}>
        {!mobile && <img className="desktop-scene-background" src={`${import.meta.env.BASE_URL}vsl/desktop-office.avif`} alt="" width="1672" height="941" fetchPriority="high" decoding="async" />}
        <a className="strategy-signature" href="#inicio" aria-label="Armonía Digital"><img src={`${import.meta.env.BASE_URL}logo.png`} alt="Armonía Digital" width="132" height="44" /></a>
        <p className="vsl-kicker">Estrategia. Diseño. Desarrollo.</p>
        <h1><span className="strategy-title-mask"><span className="strategy-title-line">Tu negocio creció.</span></span><span className="strategy-title-mask"><span className="strategy-title-line">Que tu web <span className="marker-word">lo demuestre.<svg key={introKey} className="marker-stroke" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M5 17 C65 9 160 9 231 10 Q270 10 293 7" /></svg></span></span></span></h1>
        <div className="strategy-video-stage">
        {!video ? mobile ? <MobileCover><HomeVideo onProgress={setProgress} ended={visibleProgress >= 1} onChoose={choosePlan} /></MobileCover> : <HomeVideo onProgress={setProgress} ended={visibleProgress >= 1} onChoose={choosePlan} /> : video && !failed ? <div className="vsl-video"><video className="vsl-video-player" aria-label="Cómo planteamos tu proyecto web en Armonía Digital" controls playsInline preload="none" src={video} poster={poster || undefined} onError={() => setFailed(true)} onTimeUpdate={({ currentTarget: player }) => {
          if (Number.isFinite(player.duration) && player.duration > 0) {
            const fraction = player.currentTime / player.duration;
            const stage = fraction >= 0.7 ? 0.7 : fraction >= 0.35 ? 0.35 : 0;
            setProgress((previous) => Math.max(previous, stage));
          }
        }} onEnded={() => setProgress(1)}>Tu navegador no soporta video HTML5.</video>{visibleProgress >= 1 && <VideoEndCard onChoose={choosePlan} />}</div> : mobile ? <MobileCover failed={failed} /> : <div className="strategy-video-unavailable" role="status"><div className="strategy-film-top"><span>Armonía Digital</span><span>Visión / Diseño / Impacto</span></div><div className="strategy-film-title" aria-hidden="true">No es solo una web.<br /><em>Es tu siguiente nivel.</em></div><div className="strategy-film-bottom"><p>{failed ? "No pudimos cargar el video." : "Presentación en preparación"}</p><span>Conoce el enfoque detrás de tu próxima web.</span></div></div>}
        <div className="strategy-video-foot"><span>Diseño con intención.</span><span>Desarrollo para tu negocio.</span></div>
        </div>
        </div>
      </section>
      {visibleProgress >= 1 && <section className="strategy-plans-bridge" aria-labelledby="plans-bridge-title"><div className="vsl-container"><p className="campaign-eyebrow">Tu siguiente paso</p><h2 id="plans-bridge-title">Dale a tu negocio la web que merece.</h2><button className="vsl-button vsl-button-primary" onClick={choosePlan}>Elegir mi plan <ArrowRight size={18} aria-hidden="true" /></button></div></section>}
      {offerVisible && <div ref={offerRef}><Suspense fallback={<p className="strategy-caption" role="status">Preparando planes…</p>}><OfferReveal>
        <PlanOffer onPurchase={buy} />
        <section className="strategy-faq-section"><div className="vsl-container">
        <div className="strategy-faq" aria-labelledby="vsl-faq-heading"><header><p className="campaign-eyebrow">Antes de empezar</p><h2 id="vsl-faq-heading">{faq.title}</h2><p>{faq.subtitle}</p></header>
          <div className="campaign-faq-list">{faq.items.map(([question, answer], index) => <details key={question}><summary><span className="campaign-faq-number">{String(index + 1).padStart(2, "0")}</span><span>{question}</span><ChevronDown size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
        </div>
      </div></section></OfferReveal></Suspense></div>}
    </main>
    <CampaignFooter offerVisible={offerVisible} />
    <CookieConsent />
    {localPreview && !modal && <aside className="vsl-preview-floating" aria-label="Vista previa local"><button type="button" aria-pressed={previewOffer} onClick={() => { setPreviewOffer((current) => !current); if (previewOffer) document.getElementById("inicio")?.scrollIntoView({ behavior: "instant" }); }}>{previewOffer ? <X size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}<span>{previewOffer ? "Cerrar vista temporal" : "Ver oferta · temporal"}</span></button></aside>}
    {modal && <Suspense fallback={<div className="strategy-loading" role="status">Abriendo formulario…</div>}><LeadModal mode={modal.mode} plan={modal.plan} onClose={close} /></Suspense>}
  </div>;
}
