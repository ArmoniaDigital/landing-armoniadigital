import { analytics } from "./analytics.js";

function readCookie(name) {
  if (analytics.getConsent() !== "accepted") return "";
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=") || "";
}

function browserEventMeta(eventName) {
  const eventId = `${eventName}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  if (analytics.getConsent() !== "accepted") return { eventId };
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
  return analytics.track(eventName, payload);
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
