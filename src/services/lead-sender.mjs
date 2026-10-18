const supported = new Set(["appointment_requested", "checkout_payment_requested"]);
export function createLeadSender({ endpoint, brand, fetcher = (...args) => fetch(...args), makeId = () => crypto.randomUUID() }) {
  const pending = new Map();
  return async function send(event, payload) {
    if (!supported.has(event)) throw new Error("Unsupported request");
    const body = {
      event,
      contact: {
        firstName: String(payload.contact?.firstName || "").trim(),
        email: String(payload.contact?.email || "").trim().toLowerCase(),
        phone: String(payload.contact?.phone || "").trim(),
      },
      company: { name: String(payload.company?.name || "").trim() },
      ...(payload.selectedPlan ? { selectedPlan: payload.selectedPlan.toLowerCase() } : {}),
    };
    if (!body.contact.firstName || !body.company.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact.email)) throw new Error("Check your name, business and email.");
    const key = JSON.stringify(body);
    let request = pending.get(key);
    if (!request) {
      request = { id: makeId(), body };
      pending.set(key, request);
    }
    if (request.receipt) return request.receipt;
    if (request.active) return request.active;
    request.active = (async () => {
      if (!endpoint || !endpoint.startsWith("https://")) throw new Error("Service unavailable");
      const response = await fetcher(endpoint, {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: { "Content-Type": "application/json", "X-Idempotency-Key": request.id },
        body: JSON.stringify({ ...request.body, requestId: request.id }),
      });
      const result = await response.json();
      if (response.status !== 202 || result?.ok !== true || result.receipt?.version !== 1 ||
          result.receipt.event !== event || result.receipt.brand !== brand ||
          result.receipt.status !== "prospect_received" || typeof result.receipt.id !== "string" ||
          result.receipt.acknowledgement !== "staff_approval_required") throw new Error("Request not confirmed");
      request.receipt = result;
      return result;
    })();
    try { return await request.active; } finally { request.active = null; }
  };
}
