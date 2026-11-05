import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import VideoEndCard from "./VideoEndCard";

const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";

export default function HomeVideo({ onProgress, ended, onChoose }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const frame = useRef(null);
  const duration = useRef(0);
  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== PLAYER_ORIGIN || event.source !== frame.current?.contentWindow) return;
      let data;
      try { data = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch { return; }
      const info = data?.info;
      const delivery = data?.event === "infoDelivery" || data?.event === "initialDelivery";
      if (delivery && typeof info?.muted === "boolean") setSoundEnabled(!info.muted);
      if (delivery && Number.isFinite(info?.duration) && info.duration > 0) duration.current = info.duration;
      if (delivery && Number.isFinite(info?.currentTime) && duration.current > 0) {
        const fraction = info.currentTime / duration.current;
        onProgress((current) => Math.max(current, fraction >= .7 ? .7 : fraction >= .35 ? .35 : 0));
      }
      if (data?.event === "onStateChange" && info === 0) onProgress(1);
      if (delivery && info?.playerState === 0 && duration.current > 0) onProgress(1);
    };
    window.addEventListener("message", receive);
    const timer = window.setInterval(() => {
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "vsl-home-video" }), PLAYER_ORIGIN);
    }, 1000);
    return () => { window.clearInterval(timer); window.removeEventListener("message", receive); };
  }, [onProgress]);
  function enableSound() {
    for (const func of ["unMute", "playVideo"]) frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), PLAYER_ORIGIN);
  }
  return <div className="home-video">
    <iframe ref={frame} title="Presentación de Armonía Digital" src={`${PLAYER_ORIGIN}/embed/DAdemsn003w?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
    {!soundEnabled && <button type="button" className="home-video-sound" onClick={enableSound}><Volume2 size={20} aria-hidden="true" /> Ver con sonido</button>}
    <a className="home-video-fallback" href="https://www.youtube.com/watch?v=DAdemsn003w" target="_blank" rel="noopener noreferrer">Abrir en YouTube</a>
    {ended && <VideoEndCard onChoose={onChoose} />}
  </div>;
}
