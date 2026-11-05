import { Play } from "lucide-react";

/**
 * Marco del video VSL.
 *
 * Para publicar el video:
 *  1. Copia el archivo en `public/vsl/vsl.mp4` (y un poster en `public/vsl/poster.jpg`).
 *  2. Define `VITE_VSL_VIDEO_URL` y `VITE_VSL_POSTER_URL` en `.env` (o deja las rutas
 *     por defecto de abajo).
 *
 * Mientras no exista un video, se muestra un placeholder de marca. En desarrollo
 * aparece una etiqueta con la ruta exacta donde debe colocarse el archivo.
 */
export default function VideoFrame({ onPlaceholderClick }) {
  const videoUrl = (import.meta.env.VITE_VSL_VIDEO_URL || "").trim();
  const posterUrl = (import.meta.env.VITE_VSL_POSTER_URL || "").trim();

  if (videoUrl) {
    return (
      <div className="vsl-video">
        <video
          className="vsl-video-player"
          controls
          playsInline
          preload="metadata"
          poster={posterUrl || undefined}
          src={videoUrl}
        >
          Tu navegador no soporta video HTML5.
        </video>
      </div>
    );
  }

  return (
    <div className="vsl-video vsl-video-empty">
      <button
        type="button"
        className="vsl-video-placeholder"
        onClick={onPlaceholderClick}
        aria-label="Ver el video de presentación"
      >
        <span className="vsl-video-glow" aria-hidden="true" />
        <span className="vsl-video-play">
          <Play size={30} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        </span>
        <span className="vsl-video-caption">Mira cómo trabajamos</span>
        {import.meta.env.DEV && (
          <span className="vsl-video-devnote">
            PLACEHOLDER · coloca el video en <code>public/vsl/vsl.mp4</code>
          </span>
        )}
      </button>
    </div>
  );
}
