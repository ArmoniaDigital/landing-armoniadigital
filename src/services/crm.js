function readCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=") || "";
}

function browserEventMeta(eventName) {
  const eventId = `${eventName}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get("fbclid") || "";

  return {
    eventId,
    eventSourceUrl: window.location.href,
    userAgent: navigator.userAgent,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc") || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : ""),
  };
}

export async function sendMetaEvent(eventName, payload = {}) {
  const eventEndpoint = import.meta.env.VITE_CRM_WEBHOOK_URL;
  const token = import.meta.env.VITE_CRM_WEBHOOK_TOKEN;

  if (!eventEndpoint) {
    return { skipped: true, reason: "missing_endpoint" };
  }

  const endpoint = eventEndpoint.replace(/\/landing\/events\/?$/, "/landing/meta-event");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event: eventName,
      source: payload.source || eventName,
      createdAt: payload.createdAt || new Date().toISOString(),
      browser: browserEventMeta(eventName),
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Meta event request failed with status ${response.status}`);
  }

  return response.json().catch(() => ({ ok: true }));
}

export async function sendCrmEvent(eventName, payload, endpointOverride) {
  const endpoint = endpointOverride || import.meta.env.VITE_CRM_WEBHOOK_URL;
  const token = import.meta.env.VITE_CRM_WEBHOOK_TOKEN;

  const eventPayload = {
    event: eventName,
    source: payload?.source || eventName,
    createdAt: payload?.createdAt || new Date().toISOString(),
    browser: browserEventMeta(eventName),
    ...payload,
  };

  localStorage.setItem(`armonia_latest_${eventName}`, JSON.stringify(eventPayload));

  if (!endpoint) {
    return { skipped: true, reason: "missing_endpoint", payload: eventPayload };
  }

  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    throw new Error(`CRM request failed with status ${response.status}`);
  }

  return response.json().catch(() => ({ ok: true }));
}

export async function validateCrmPromotion(payload) {
  const eventEndpoint = import.meta.env.VITE_CRM_WEBHOOK_URL;
  const token = import.meta.env.VITE_CRM_WEBHOOK_TOKEN;

  if (!eventEndpoint) {
    return { skipped: true, reason: "missing_endpoint" };
  }

  const endpoint = eventEndpoint.replace(/\/landing\/events\/?$/, "/landing/promotions/validate");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Promotion request failed with status ${response.status}`);
  }

  return data;
}

export async function createEpaycoSession(payload) {
  const eventEndpoint = import.meta.env.VITE_CRM_WEBHOOK_URL;
  const token = import.meta.env.VITE_CRM_WEBHOOK_TOKEN;

  if (!eventEndpoint) {
    throw new Error("No esta configurada la URL del CRM.");
  }

  const endpoint = eventEndpoint.replace(/\/landing\/events\/?$/, "/landing/payments/epayco/session");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `ePayco request failed with status ${response.status}`);
  }

  return data;
}
