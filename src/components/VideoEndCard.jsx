import { ArrowRight } from "lucide-react";

export default function VideoEndCard({ onChoose }) {
  return <div className="video-end-card"><p>Tu próxima web empieza aquí.</p><button type="button" className="vsl-button vsl-button-primary" onClick={onChoose}>Elegir mi plan <ArrowRight size={18} aria-hidden="true" /></button></div>;
}
