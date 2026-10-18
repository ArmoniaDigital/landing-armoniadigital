import { CalendarDays, CheckCircle2, ClipboardList, Clock3, Sparkles } from "lucide-react";
import logo from "../Navbar/LOGO-01.png";
import "./Welcome.css";

const steps = [
  {
    icon: CheckCircle2,
    title: "Bienvenid@, confirmamos la compra de tus servicios.",
    text: "Tu proyecto ya tiene punto de partida. Desde aquí ordenamos la información y preparamos el inicio del proceso.",
    status: "Completado",
  },
  {
    icon: ClipboardList,
    title: "Completa el formulario de información.",
    text: "Reunimos datos del negocio, servicios, marca, imágenes, objetivos y cualquier detalle que ayude a construir con intención.",
    status: "Siguiente paso",
  },
  {
    icon: CalendarDays,
    title: "Agenda la reunión de inicio.",
    text: "Nos sentamos a revisar el alcance, resolver dudas y definir prioridades antes de arrancar con la construcción.",
    status: "Kickoff",
  },
  {
    icon: Clock3,
    title: "Inician las 72 horas para ver tu primer adelanto.",
    text: "Con la información lista y la reunión realizada, empezamos a trabajar para mostrarte una primera versión real de tu sitio web.",
    status: "En marcha",
  },
];

export default function Welcome() {
  return (
    <main className="welcome-page">
      <section className="welcome-shell">
        <header className="welcome-header">
          <a className="welcome-logo" href="#inicio" aria-label="Armonia Digital">
            <img src={logo} alt="Armonia Digital" />
          </a>
          <span>Inicio del proyecto</span>
        </header>

        <div className="welcome-hero">
          <span className="welcome-kicker">Bienvenida</span>
          <h1>
            Tu web ya está <span>en camino.</span>
          </h1>
          <p>
            Estos son los pasos que seguimos después de confirmar tu compra para iniciar con claridad,
            avanzar rápido y enseñarte un primer adelanto de tu sitio web en 72 horas.
          </p>
        </div>

        <section className="welcome-timeline" aria-label="Pasos de bienvenida">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active = index === 0;

            return (
              <article className={`welcome-step ${active ? "active" : ""}`} key={step.title}>
                <div className="welcome-step-number">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="welcome-step-icon">
                  <Icon size={24} />
                </div>
                <small>{step.status}</small>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </article>
            );
          })}
        </section>

        <aside className="welcome-note">
          <Sparkles size={22} />
          <p>
            El conteo de las 72 horas comienza cuando recibimos la información necesaria y realizamos
            la reunión de inicio para alinear el proyecto.
          </p>
        </aside>
      </section>
    </main>
  );
}
