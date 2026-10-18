import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ImageUp,
  PackageSearch,
  Send,
  Settings2,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { sendCrmEvent } from "../../services/crm";
import logo from "../Navbar/LOGO-01.png";
import "./Onboarding.css";

const productGoals = [
  "Comprar directamente en el sitio",
  "Agregar al carrito y cerrar por WhatsApp",
  "Otro flujo de venta",
];

const paymentMethods = [
  "Mercado Pago",
  "PayPal",
  "Stripe",
  "Contraentrega",
  "Transferencia bancaria",
  "Otro",
];

const shippingOptions = [
  "Envio nacional",
  "Envio internacional",
  "Solo recogida en tienda",
  "No aplica",
];

const contentOptions = [
  "Tengo los textos listos",
  "Tengo contenido parcial",
  "Necesito apoyo para redactarlos",
];

const specialNeeds = [
  "Agendar citas desde el sitio",
  "Blog",
  "Testimonios de clientes",
  "Casos de exito / portafolio",
  "Presentar a mi equipo",
  "Sitio en mas de un idioma",
  "Area privada o con clave",
  "Ninguna de las anteriores",
];

const checklistItems = [
  "Confirmo que la informacion proporcionada es correcta.",
  "Confirmo que tengo autorizacion para compartir textos, imagenes, logos y testimonios.",
  "Entiendo que el desarrollo comienza cuando esta informacion haya sido recibida y validada.",
  "Entiendo que el plazo de 72 horas empieza despues de validar la informacion y la llamada de kickoff.",
  "Entiendo que cualquier funcionalidad fuera del alcance puede requerir cotizacion adicional.",
];

function TextField({ label, name, type = "text", required = false, wide = false, placeholder = "" }) {
  return (
    <label className={`onboarding-field ${wide ? "onboarding-field-wide" : ""}`}>
      <span>{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

function TextArea({ label, name, required = false, placeholder = "" }) {
  return (
    <label className="onboarding-field onboarding-field-wide">
      <span>{label}</span>
      <textarea name={name} rows="4" required={required} placeholder={placeholder} />
    </label>
  );
}

function OptionGroup({ title, name, options, type = "checkbox" }) {
  return (
    <fieldset className="onboarding-options">
      <legend>{title}</legend>
      <div>
        {options.map((option) => (
          <label key={option}>
            <input name={name} type={type} value={option} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Section({ icon: Icon, eyebrow, title, children }) {
  return (
    <section className="onboarding-panel">
      <div className="onboarding-panel-title">
        <span>
          <Icon size={21} />
        </span>
        <div>
          <small>{eyebrow}</small>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function formToPayload(form) {
  const formData = new FormData(form);
  const getAll = (name) => formData.getAll(name).filter(Boolean);
  const get = (name) => formData.get(name) || "";

  return {
    source: "internal_onboarding_brief",
    intent: "Brief esencial e-commerce",
    createdAt: new Date().toISOString(),
    contact: {
      companyName: get("companyName"),
      contactName: get("contactName"),
      whatsapp: get("whatsapp"),
      email: get("email"),
      cityCountry: get("cityCountry"),
    },
    business: {
      summary: get("businessSummary"),
      productCount: get("productCount"),
      priorityProducts: get("priorityProducts"),
      heroProduct: get("heroProduct"),
      inventory: get("inventory"),
    },
    site: {
      mainAction: get("mainAction"),
      readinessDefinition: get("readinessDefinition"),
      paymentMethods: getAll("paymentMethods"),
      shipping: getAll("shipping"),
      returnsPolicy: get("returnsPolicy"),
    },
    brand: {
      hasLogo: get("hasLogo"),
      colors: get("colors"),
      brandWords: get("brandWords"),
      contentStatus: get("contentStatus"),
      assetsNotes: get("assetsNotes"),
      references: get("references"),
      specialNeeds: getAll("specialNeeds"),
      privateAreaDetails: get("privateAreaDetails"),
    },
    technical: {
      domain: get("domain"),
      hosting: get("hosting"),
      analytics: get("analytics"),
      searchConsole: get("searchConsole"),
      metaPixel: get("metaPixel"),
      googleEmail: get("googleEmail"),
      migration: get("migration"),
    },
    confirmation: {
      accepted: getAll("confirmation"),
      clientName: get("clientName"),
      signatureDate: get("signatureDate"),
    },
  };
}

export default function Onboarding() {
  const [status, setStatus] = useState("idle");
  const crmWebhookUrl = import.meta.env.VITE_CRM_ONBOARDING_WEBHOOK_URL || import.meta.env.VITE_CRM_WEBHOOK_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    const payload = formToPayload(event.currentTarget);

    try {
      await sendCrmEvent("onboarding_brief_submitted", payload, crmWebhookUrl);

      setStatus("done");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <main className="onboarding-page">
      <div className="onboarding-shell">
        <header className="onboarding-brandbar">
          <a className="onboarding-brand" href="#inicio" aria-label="Armonia Digital">
            <img src={logo} alt="Armonia Digital" />
          </a>
          <a className="onboarding-back" href="#inicio">
            <ArrowLeft size={18} />
            Volver al inicio
          </a>
        </header>

        <section className="onboarding-hero">
          <div>
            <span className="onboarding-kicker">Plan Autoridad - Onboarding e-commerce</span>
            <h1>
              Brief esencial para preparar tu tienda online.
            </h1>
            <p>
              Completa la informacion clave del negocio, productos, pagos, envios y configuracion tecnica.
              Lo que no tengas listo lo revisamos juntos en la llamada de kickoff.
            </p>
          </div>
          <aside className="onboarding-status-card">
            <Sparkles size={25} />
            <strong>Listo para CRM</strong>
            <p>El formulario genera un payload ordenado para conectar con tu webhook cuando lo actives.</p>
          </aside>
        </section>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="onboarding-progress" aria-label="Capas del brief">
            <div className="active">
              <span>01</span>
              <strong>Brief esencial</strong>
            </div>
            <div>
              <span>02</span>
              <strong>Checklist tecnico</strong>
            </div>
            <div>
              <span>03</span>
              <strong>Confirmacion</strong>
            </div>
          </div>

          <Section icon={Building2} eyebrow="Datos de contacto" title="Empecemos por identificar el proyecto.">
            <div className="onboarding-fields">
              <TextField label="Nombre de la empresa*" name="companyName" required />
              <TextField label="Persona de contacto*" name="contactName" required />
              <TextField label="WhatsApp*" name="whatsapp" type="tel" required />
              <TextField label="Correo electronico*" name="email" type="email" required />
              <TextField label="Ciudad / Pais*" name="cityCountry" required wide />
            </div>
          </Section>

          <Section icon={PackageSearch} eyebrow="El negocio" title="Cuentanos que vendes y que debe destacar primero.">
            <div className="onboarding-fields">
              <TextArea label="A que se dedica tu empresa?*" name="businessSummary" required placeholder="Describe el negocio en 3 o 4 lineas." />
              <TextField label="Cuantos tipos de productos venderas?" name="productCount" />
              <TextField label="Producto estrella" name="heroProduct" />
              <TextArea label="3 a 5 productos importantes" name="priorityProducts" placeholder="Nombre, precio, variantes y enlace a foto si aplica." />
              <TextArea label="Inventario o venta sobre pedido" name="inventory" placeholder="Indica si manejas stock, preventa, dropshipping o produccion bajo pedido." />
            </div>
          </Section>

          <Section icon={ShoppingCart} eyebrow="Objetivo del sitio" title="Define que accion debe completar el visitante.">
            <div className="onboarding-split">
              <OptionGroup title="Accion principal" name="mainAction" options={productGoals} type="radio" />
              <TextArea label="Como sabremos que la tienda esta lista?" name="readinessDefinition" placeholder="Ej: checkout sin errores, catalogo claro en celular, confirmacion automatica recibida." />
            </div>
          </Section>

          <Section icon={CreditCard} eyebrow="Pagos" title="Selecciona los metodos de pago que necesitas.">
            <div className="onboarding-split">
              <OptionGroup title="Metodos de pago" name="paymentMethods" options={paymentMethods} />
              <TextArea label="Politica de devoluciones o cambios" name="returnsPolicy" placeholder="Si no la tienes definida, escribe que necesitas apoyo para crearla." />
            </div>
          </Section>

          <Section icon={Truck} eyebrow="Envios" title="Aclaremos como recibira el producto tu cliente.">
            <OptionGroup title="Opciones de entrega" name="shipping" options={shippingOptions} />
          </Section>

          <Section icon={ImageUp} eyebrow="Identidad y contenido" title="Reunamos marca, fotos, textos y referencias.">
            <div className="onboarding-fields">
              <TextField label="Tienes logo?" name="hasLogo" placeholder="Si / No / Lo envio luego" />
              <TextField label="Colores corporativos" name="colors" placeholder="HEX, nombres o referencias" />
              <TextField label="Describe tu marca en 3 palabras" name="brandWords" wide />
              <OptionGroup title="Estado de los textos" name="contentStatus" options={contentOptions} type="radio" />
              <TextArea label="Fotos o videos disponibles" name="assetsNotes" placeholder="Pega enlaces o describe que material tienes." />
              <TextArea label="Tiendas online de referencia" name="references" placeholder="Comparte 2 o 3 referencias y que te gusta de cada una." />
              <OptionGroup title="Necesidades especiales" name="specialNeeds" options={specialNeeds} />
              <TextArea label="Detalle de area privada, si aplica" name="privateAreaDetails" placeholder="Que contenido va ahi, quien entra y si necesita login." />
            </div>
          </Section>

          <Section icon={Settings2} eyebrow="Checklist tecnico" title="Deja clara la base para configurar y medir.">
            <div className="onboarding-fields">
              <TextField label="Dominio" name="domain" placeholder="Proveedor y fecha de vencimiento" />
              <TextField label="Hosting" name="hosting" placeholder="Proveedor y plan" />
              <TextField label="Google Analytics 4" name="analytics" placeholder="Si / No / No se" />
              <TextField label="Google Search Console" name="searchConsole" placeholder="Si / No / No se" />
              <TextField label="Meta Pixel" name="metaPixel" placeholder="Si / No / No se" />
              <TextField label="Correo Google para configuraciones" name="googleEmail" type="email" wide />
              <TextArea label="Migracion o contenido que conservar" name="migration" />
            </div>
          </Section>

          <Section icon={BadgeCheck} eyebrow="Antes de arrancar" title="Confirma la informacion y autorizaciones.">
            <OptionGroup title="Confirmaciones" name="confirmation" options={checklistItems} />
            <div className="onboarding-fields onboarding-confirm-fields">
              <TextField label="Nombre del cliente*" name="clientName" required />
              <TextField label="Fecha*" name="signatureDate" type="date" required />
            </div>
          </Section>

          <aside className="onboarding-submit-card">
            <div>
              <ClipboardList size={22} />
              <span>Enviar brief de onboarding</span>
              <p>Queda guardado para pruebas y preparado para enviarse al CRM cuando exista el webhook.</p>
            </div>
            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Enviando..." : "Enviar brief"}
              <Send size={18} />
            </button>
            {status === "done" && (
              <small>
                <CheckCircle2 size={16} />
                Brief recibido. Puedes continuar con la llamada de kickoff.
              </small>
            )}
            {status === "error" && <small className="error">No se pudo enviar al CRM. El brief quedo guardado localmente.</small>}
          </aside>
        </form>
      </div>
    </main>
  );
}
