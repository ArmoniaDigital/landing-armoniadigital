// Planes tomados del wording vigente de la landing de Armonía (i18n.js).
// El `id` debe coincidir con lo que acepta el CRM: launch | business | store | personalizado.

export const plans = [
  {
    id: "launch",
    name: "Launch",
    tagline: "Ideal para empezar con presencia online.",
    price: 499,
    priceLabel: "$499",
    note: "pago único",
    features: [
      "Diseño de autoridad",
      "Landing de venta enfocada",
      "Adaptación total a móviles",
      "Formulario de captación directa",
      "Correos que reflejan tu seriedad",
    ],
    cta: "Solicitar servicio",
    featured: false,
  },
  {
    id: "business",
    name: "Business",
    tagline: "Perfecto para negocios que quieren crecer.",
    price: 699,
    priceLabel: "$699",
    note: "pago único",
    features: [
      "Diseño premium de alto impacto",
      "Hasta 5 páginas estratégicas",
      "SEO básico para ser encontrado",
      "WhatsApp integrado para venta directa",
      "Formulario avanzado de cualificación",
      "Analytics para medir tus resultados",
      "Identidad corporativa profesional",
    ],
    cta: "Solicitar servicio",
    featured: true,
    badge: "MÁS ELEGIDO",
  },
  {
    id: "store",
    name: "Store",
    tagline: "Para negocios que quieren posicionarse como líderes.",
    price: 999,
    priceLabel: "$999",
    note: "pago único",
    features: [
      "Diseño avanzado",
      "Páginas ilimitadas",
      "SEO avanzado",
      "Velocidad optimizada",
      "Integraciones",
      "Soporte prioritario",
      "Correos electrónicos corporativos",
    ],
    cta: "Solicitar servicio",
    featured: false,
  },
];

export const includedItems = [
  "Primera vista del sitio en 72 horas",
  "Estructura enfocada en conversión",
  "Diseño responsive pensado para móvil",
  "Configuración de contacto o captura de leads",
  "SEO básico en página",
  "Conexión de analítica",
  "Revisión básica de velocidad y rendimiento",
  "Soporte para conexión de dominio",
  "Fase de ajustes después de la primera revisión",
  "Bases de seguridad",
  "Proceso claro de revisiones",
  "Siguientes pasos después del lanzamiento",
];

export const planDisclaimer =
  "Nota: la compra del dominio no está incluida. El precio final puede variar según cantidad de páginas, integraciones, complejidad ecommerce, contenido requerido y soporte continuo. El plazo de 72 horas hábiles comienza después de completar el formulario inicial con la información necesaria para empezar.";

// Enlaces de pago Bold por plan (opcionales).
// Si no hay enlace configurado, la solicitud queda registrada en el CRM y el
// equipo coordina el pago con el cliente.
export const boldLinks = {
  launch: (import.meta.env.VITE_BOLD_LINK_LAUNCH || "").trim(),
  business: (import.meta.env.VITE_BOLD_LINK_BUSINESS || "").trim(),
  store: (import.meta.env.VITE_BOLD_LINK_STORE || "").trim(),
};

// Checkout embebido de Bold (opcional). Los montos van en unidades menores de
// la divisa y los define el negocio: sin configurar, no se muestra el botón
// embebido y se mantiene el enlace o el fallback manual.
export const boldCheckout = {
  currency: (import.meta.env.VITE_BOLD_CURRENCY || "").trim(),
  amounts: {
    launch: Number(import.meta.env.VITE_BOLD_AMOUNT_LAUNCH || 0),
    business: Number(import.meta.env.VITE_BOLD_AMOUNT_BUSINESS || 0),
    store: Number(import.meta.env.VITE_BOLD_AMOUNT_STORE || 0),
  },
};

export function embeddedAmountFor(planId) {
  if (!boldCheckout.currency || !planId) return 0;
  const amount = boldCheckout.amounts[planId];
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
}
