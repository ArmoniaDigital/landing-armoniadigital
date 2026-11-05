import test from "node:test";
import assert from "node:assert/strict";
import { createLeadSender } from "../src/services/lead-sender.mjs";
const payload = { contact: { firstName: "Test", email: "TEST@example.com", phone: "" }, company: { name: "Example" } };
const valid = { ok: true, receipt: { version: 1, id: "receipt", event: "appointment_requested", brand: "readyin72", status: "prospect_received", acknowledgement: "staff_approval_required" } };
const options = { endpoint: "https://crm-readyin72.vercel.app/api/landing/events", brand: "readyin72", makeId: () => "9376058c-89d7-4eaa-a3a5-72bef29c5c53" };
test("lost response retries identical body/id and does not send private metadata", async () => {
 const requests = []; let count = 0;
 const send = createLeadSender({ ...options, fetcher: async (_, init) => { requests.push(init); if (++count === 1) throw new Error("offline"); return { status: 202, json: async () => valid }; } });
 await assert.rejects(send("appointment_requested", { ...payload, birthDate: "private", createdAt: "one" }));
 await send("appointment_requested", { ...payload, createdAt: "two" });
 assert.equal(requests[0].body, requests[1].body);
 assert.equal(requests[0].headers["X-Idempotency-Key"], requests[1].headers["X-Idempotency-Key"]);
 assert.ok(!requests[0].body.includes("private"));
 assert.ok(!requests[0].headers.Authorization);
 await send("appointment_requested", payload);
 assert.equal(requests.length, 2);
});
test("simulated, malformed, wrong brand and HTTP failures never report success", async () => {
 for (const [status, body] of [[200, valid], [202,{ok:true,simulated:true}], [202,{...valid,receipt:{...valid.receipt,brand:"wrong"}}], [500,valid]]) {
  const send = createLeadSender({ ...options, fetcher: async () => ({ status, json: async () => body }) });
  await assert.rejects(send("appointment_requested", payload));
 }
});
test("checkout events are accepted and each event keeps its own idempotency key", async () => {
 const requests = [];
 let counter = 0;
 const send = createLeadSender({ ...options, makeId: () => `9376058c-89d7-4eaa-a3a5-72bef29c5c${String(++counter).padStart(2, "0")}`, fetcher: async (_, init) => {
  requests.push(init);
  const event = JSON.parse(init.body).event;
  return { status: 202, json: async () => ({ ...valid, receipt: { ...valid.receipt, event } }) };
 } });
 const checkout = { ...payload, selectedPlan: "launch" };
 await send("checkout_started", checkout);
 await send("checkout_payment_requested", checkout);
 assert.equal(requests.length, 2);
 assert.notEqual(requests[0].headers["X-Idempotency-Key"], requests[1].headers["X-Idempotency-Key"]);
 assert.equal(JSON.parse(requests[0].body).selectedPlan, "launch");
});
test("concurrent clicks share one request; malformed identity and unsupported events do not fetch", async () => {
 let calls = 0;
 const send = createLeadSender({ ...options, fetcher: async () => { calls++; return { status:202,json:async()=>valid }; } });
 await Promise.all([send("appointment_requested", payload),send("appointment_requested", payload)]);
 assert.equal(calls,1);
 await assert.rejects(send("schedule_call_booked",payload));
 await assert.rejects(send("appointment_requested",{...payload,contact:{firstName:"",email:"bad"}}));
 assert.equal(calls,1);
});
