import { Clock3, Pause, Play, ShieldCheck, Smartphone, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ResearchProof from "../ResearchProof/ResearchProof";
import { sendMetaEvent } from "../../services/crm";

const icons = [
  <Clock3 />,
  <ShieldCheck />,
  <TrendingUp />,
  <Smartphone />,
];

export default function Benefits({ copy }) {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const iframeRef = useRef(null);
  const isExternalContact = copy.contactHref?.startsWith("http");
  const videoTitle = "Video contexto Armonia Digital";
  const videoId = "DAdemsn003w";

  const sendPlayerCommand = (func) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args: [],
      }),
      "*",
    );
  };

  const requestPlayerInfo = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "listening",
        id: "benefits-video",
      }),
      "*",
    );
    sendPlayerCommand("getCurrentTime");
    sendPlayerCommand("getDuration");
  };

  const playVideo = () => {
    setIsVideoActive(true);
    setIsVideoPlaying(true);
    sendMetaEvent("ViewContent", {
      source: "context_video_play",
      content_name: videoTitle,
      content_category: "context_video",
    }).catch(() => {});
    window.setTimeout(() => sendPlayerCommand("playVideo"), 250);
  };

  const toggleVideo = () => {
    if (!isVideoActive || !isVideoPlaying) {
      playVideo();
      return;
    }

    sendPlayerCommand("pauseVideo");
    setIsVideoPlaying(false);
  };

  const seekVideo = (event) => {
    if (!videoDuration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const seconds = percent * videoDuration;

    setVideoCurrentTime(seconds);
    setVideoProgress(percent * 100);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [seconds, true],
      }),
      "*",
    );
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (!String(event.origin).includes("youtube")) return;

      let data = event.data;

      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      const info = data?.info;

      if (!info) return;

      if (typeof info.currentTime === "number") {
        setVideoCurrentTime(info.currentTime);
      }

      if (typeof info.duration === "number") {
        setVideoDuration(info.duration);
      }

      if (typeof info.playerState === "number") {
        setIsVideoPlaying(info.playerState === 1);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!videoDuration) return;

    setVideoProgress(Math.min((videoCurrentTime / videoDuration) * 100, 100));
  }, [videoCurrentTime, videoDuration]);

  useEffect(() => {
    if (!isVideoActive) return undefined;

    const timer = window.setInterval(requestPlayerInfo, 500);

    return () => window.clearInterval(timer);
  }, [isVideoActive]);

  return (
    <section className="benefits-section">
      <div className="container benefits-wrapper">
        <motion.div
          className="benefits-heading"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="section-kicker">{copy.kicker}</span>
          <h2>
            {copy.titleStart} <span>{copy.titleRed}</span>{" "}
            <strong>{copy.titleEnd}</strong>
          </h2>
          <p>{copy.subtitle}</p>
        </motion.div>

        <motion.div
          className="benefits-video"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="video-box">
            {isVideoActive ? (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0&cc_load_policy=0&hl=es&enablejsapi=1&origin=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.origin : "https://armoniadigital.digital",
                )}`}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={requestPlayerInfo}
              />
            ) : (
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={copy.subtitle}
              />
            )}
            <button className={`play-button ${isVideoActive ? "is-compact" : ""}`} type="button" aria-label={isVideoPlaying ? "Pausar video" : copy.videoCaption} onClick={toggleVideo}>
              {isVideoPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
            </button>
            {isVideoActive && (
              <>
                <div className="video-brand-mask" aria-hidden="true" />
                <div className="video-controls">
                  <button type="button" onClick={toggleVideo} aria-label={isVideoPlaying ? "Pausar video" : "Reproducir video"}>
                    {isVideoPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  </button>
                  <button className="video-timeline" type="button" onClick={seekVideo} aria-label="Mover video">
                    <span style={{ width: `${videoProgress}%` }} />
                  </button>
                  <small>{formatTime(videoCurrentTime)} / {formatTime(videoDuration)}</small>
                </div>
              </>
            )}
            {!isVideoActive && <div className="video-caption">
              <strong>{copy.videoCaption}</strong>
              {copy.videoLink && <span>{copy.videoLink}</span>}
            </div>}
          </div>
        </motion.div>

        <ResearchProof proof={copy.proof} className="benefits-proof" />

        <div className="benefits-cards">
          {copy.items.map((item, index) => (
            <motion.article
              key={item[0]}
              className="benefit-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="benefit-icon">{icons[index]}</div>
              <div>
                <h4>{item[0]}</h4>
                <p>{item[1]}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="benefits-note"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p>
            {copy.note} <strong>{copy.noteStrong}</strong>
          </p>
          <div className="benefits-note-actions">
            <a href="#precios" className="benefits-note-button benefits-note-button-secondary">
              {copy.plansButton}
            </a>
            <a
              href={copy.contactHref || "#contacto"}
              target={isExternalContact ? "_blank" : undefined}
              rel={isExternalContact ? "noreferrer" : undefined}
              className="benefits-note-button benefits-note-button-primary"
              onClick={() => {
                sendMetaEvent("Contact", {
                  source: "context_schedule_click",
                  content_name: "Contexto",
                  content_category: "section_cta",
                }).catch(() => {});
              }}
            >
              {copy.callButton}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
