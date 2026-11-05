// Cliente del CRM Next.js (ready-crm) para la landing VSL.
// Contrato: POST /api/landing/events con X-Idempotency-Key (UUID) y body JSON.
// Eventos permitidos: appointment_requested | checkout_started | checkout_payment_requested.
// El CRM valida el Origin contra una lista blanca: para producción el dominio de
// esta VSL debe registrarse en ready-crm (src/lib/landing-ingress/contract.ts,
// variable LANDING_INGRESS_EXTRA_ORIGINS).

const DEFAULT_ENDPOINT = "https://crm-readyin72.vercel.app/api/landing/events";

const SUPPORTED_EVENTS = new Set([
  "appointment_requested",
  "checkout_started",
  "checkout_payment_requested",
]);

const ENDPOINT = (import.meta.env.VITE_CRM_ENDPOINT || DEFAULT_ENDPOINT).trim();
const BRAND = (import.meta.env.VITE_CRM_BRAND || "armonia-digital").trim();

const pending = new Map();

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback para navegadores antiguos: UUID v4.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function validateLead({ firstName, email, phone, company, selectedPlan, requirePlan }) {
  const name = String(firstName || "").trim();
  const business = String(company || "").trim();
  const mail = normalizeEmail(email);
  const digits = String(phone || "").replace(/\D/g, "");

  if (name.replace(/\s/g, "").length < 3) {
    return "Escribe tu nombre completo (mínimo 3 caracteres).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
    return "Escribe un correo electrónico válido.";
  }
  if (business.replace(/\s/g, "").length < 3) {
    return "Escribe el nombre de tu negocio o proyecto.";
  }
  if (phone && (!/^\+?[0-9 ()-]+$/.test(phone) || digits.length < 7 || digits.length > 15)) {
    return "Revisa el número de WhatsApp e incluye el indicativo del país.";
  }
  if (requirePlan && !["launch", "business", "store"].includes(selectedPlan)) {
    return "Selecciona un plan para continuar.";
  }
  return "";
}

function buildBody(event, payload, requestId) {
  const body = {
    event,
    requestId,
    source: "landing_vsl",
    contact: {
      firstName: String(payload.firstName || "").trim(),
      lastName: String(payload.lastName || "").trim(),
      email: normalizeEmail(payload.email),
      phone: String(payload.phone || "").trim(),
    },
    company: { name: String(payload.company || "").trim() },
    meta: {
      page: "vsl-armonia",
      plan: payload.selectedPlan || "",
      createdAt: new Date().toISOString(),
      ...(payload.meta || {}),
    },
  };

  if (payload.selectedPlan) {
    body.selectedPlan = String(payload.selectedPlan).toLowerCase();
  }

  return body;
}

export async function sendCrmEvent(event, payload, idempotencyKey) {
  if (!SUPPORTED_EVENTS.has(event)) {
    throw new Error("Evento no soportado.");
  }

  const error = validateLead(payload);
  if (error) throw new Error(error);

  const key = JSON.stringify({ event, payload, idempotencyKey });

  let request = pending.get(key);
  if (!request) {
    const requestId = idempotencyKey || makeId();
    request = { id: requestId, body: buildBody(event, payload, requestId) };
    pending.set(key, request);
  }

  if (request.receipt) return request.receipt;
  if (request.active) return request.active;

  request.active = (async () => {
    const localDevEndpoint =
      import.meta.env.DEV && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(ENDPOINT);

    if (!ENDPOINT || (!ENDPOINT.startsWith("https://") && !localDevEndpoint)) {
      throw new Error("El servicio de registro no está disponible.");
    }

    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": request.id,
        },
        body: JSON.stringify(request.body),
      });
    } catch {
      throw new Error("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
    }

    const result = await response.json().catch(() => null);

    if (response.status === 429) {
      throw new Error("Recibimos varias solicitudes seguidas. Espera un momento e inténtalo de nuevo.");
    }

    if (
      response.status !== 202 ||
      !result ||
      result.ok !== true ||
      result.receipt?.version !== 1 ||
      result.receipt?.event !== event ||
      typeof result.receipt?.id !== "string"
    ) {
      throw new Error("No pudimos confirmar tu solicitud. Verifica tus datos e inténtalo otra vez.");
    }

    // En desarrollo el CRM mapea localhost a la marca readyin72; no bloqueamos por marca.
    if (!import.meta.env.DEV && result.receipt.brand !== BRAND) {
      throw new Error("No pudimos confirmar tu solicitud en este momento.");
    }

    request.receipt = result;
    return result;
  })();

  try {
    return await request.active;
  } finally {
    request.active = null;
  }
}
