import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createAnalytics, CONSENT_KEY, PIXEL_ID } from "../src/services/analytics.mjs";

function setup({ stored = null, blocked = false, endpoint = "", response = { ok: true, eventsReceived: 1 } } = {}) {
  const scripts = [], requests = [], listeners = {}, writtenCookies = [];
  let cookieReads = 0;
  const win = {
    location: { hostname: "armoniadigital.digital", origin: "https://armoniadigital.digital", pathname: "/", href: "https://armoniadigital.digital/?email=secret#token" },
    localStorage: { getItem: () => { if (blocked) throw Error("denied"); return stored; }, setItem: (key, value) => { if (blocked) throw Error("denied"); assert.equal(key, CONSENT_KEY); stored = value; } },
    crypto: { randomUUID }, addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  const doc = { head: { appendChild: (element) => scripts.push(element) }, createElement: () => ({}), getElementById: (id) => scripts.find((element) => element.id === id) };
  Object.defineProperty(doc, "cookie", { get: () => { cookieReads++; return "_fbp=fb.1.1.browser; _fbc=fb.1.1.click"; }, set: (value) => writtenCookies.push(value) });
  const analytics = createAnalytics({ win, doc, metaEndpoint: endpoint, fetcher: async (url, init) => { requests.push({ url, ...init }); return { ok: true, json: async () => response }; } });
  return { analytics, win, scripts, requests, listeners, writtenCookies, reads: () => cookieReads, setStored: (value) => { stored = value; } };
}
const endpoint = "https://crm-readyin72.vercel.app/api/landing/meta-event";

test("no decision/rejection/dismissal never load trackers, read marketing cookies or call the server", async () => {
  for (const stored of [null, "rejected", "dismissed", "unknown"]) {
    const s = setup({ stored, endpoint });
    await s.analytics.track("Contact", { email: "private@example.com" });
    assert.equal(s.scripts.length, 0); assert.equal(s.requests.length, 0); assert.equal(s.reads(), 0);
  }
});

test("acceptance loads the same three original tracker IDs once and emits only the latest page", async () => {
  const s = setup();
  await s.analytics.track("PageView", { content_name: "home" });
  await s.analytics.track("PageView", { content_name: "appointment" });
  s.analytics.setConsent("accepted");
  s.analytics.setConsent("accepted");
  s.analytics.initialize();
  assert.equal(s.scripts.length, 3);
  const calls = s.win.fbq.queue.map((args) => Array.from(args));
  assert.equal(calls.filter((args) => args[0] === "init" && args[1] === PIXEL_ID).length, 1);
  const views = calls.filter((args) => args[0] === "trackSingle");
  assert.equal(views.length, 1); assert.equal(views[0][3].content_name, "appointment");
});

test("PageView replays deduplicate but returning to a different view gets a fresh ID", async () => {
  const s = setup({ stored: "accepted" });
  const first = await s.analytics.track("PageView", { content_name: "home" });
  assert.equal((await s.analytics.track("PageView", { content_name: "home" })).reason, "duplicate_view");
  await s.analytics.track("PageView", { content_name: "appointment" });
  const back = await s.analytics.track("PageView", { content_name: "home" });
  assert.notEqual(first.eventId, back.eventId);
  assert.equal(first.server, "not_configured");
});

test("browser and server share one event ID, omit secrets/PII/query and never send bearer credentials", async () => {
  const s = setup({ stored: "accepted", endpoint });
  const result = await s.analytics.track("Contact", { source: "pricing", content_name: "Business", email: "secret@example.com", access_token: "secret", browser: { eventId: "forged" } });
  assert.equal(result.server, "accepted");
  const request = s.requests[0], body = JSON.parse(request.body);
  assert.equal(body.consent, true); assert.equal(body.browser.eventSourceUrl, "https://armoniadigital.digital/");
  assert.equal(body.browser.eventId, result.eventId);
  assert.equal(s.win.fbq.queue.at(-1)[4].eventID, result.eventId);
  assert.equal(request.credentials, "omit"); assert.equal(request.headers.Authorization, undefined);
  assert.ok(!request.body.includes("secret")); assert.ok(!request.body.includes("forged"));
});

test("forged purchases and business milestones cannot be emitted by the browser API", async () => {
  const s = setup({ stored: "accepted", endpoint });
  for (const event of ["Purchase", "Lead", "AddPaymentInfo", "CompleteRegistration"]) assert.equal((await s.analytics.track(event)).reason, "unsupported_event");
  assert.equal(s.requests.length, 0);
  assert.equal(s.win.fbq.queue.filter((args) => args[0] === "trackSingle").length, 0);
});

test("public metadata fits backend limits identically in Pixel and Graph",async()=>{
  const s=setup({stored:"accepted",endpoint});
  await s.analytics.track("ViewContent",{source:"s".repeat(90),content_name:"n".repeat(170),content_category:"c".repeat(170),selectedPlan:"p".repeat(100)});
  const sent=JSON.parse(s.requests[0].body),pixel=s.win.fbq.queue.at(-1)[3];
  for(const [key,length] of Object.entries({source:60,content_name:100,content_category:100,selectedPlan:80})){
    assert.equal(sent[key].length,length);assert.equal(sent[key],pixel[key]);
  }
});

test("revocation stops later events and clears known marketing cookies without reinjecting trackers", async () => {
  const s = setup({ stored: "accepted", endpoint });
  await s.analytics.track("Contact");
  s.analytics.setConsent("rejected");
  assert.equal((await s.analytics.track("Contact")).reason, "consent_required");
  assert.equal(s.requests.length, 1); assert.equal(s.scripts.length, 3);
  assert.ok(s.writtenCookies.some((value) => value.startsWith("_fbp=;")));
  assert.equal(s.win["ga-disable-G-PRVFVEYZXQ"], true);
  s.analytics.setConsent("accepted"); assert.equal(s.scripts.length, 3);
});

test("blocked storage still permits an explicit in-page choice and subscriptions unsubscribe", () => {
  const s = setup({ blocked: true });
  assert.equal(s.analytics.getConsent(), null);
  let changes = 0; const unsubscribe = s.analytics.subscribe(() => changes++);
  s.analytics.setConsent("accepted"); assert.equal(s.analytics.getConsent(), "accepted");
  unsubscribe(); s.analytics.setConsent("rejected"); assert.equal(changes, 1);
});

test("cross-tab revocation and storage clearing update consent", () => {
  const s = setup({ stored: "accepted" }); s.analytics.initialize();
  s.setStored(null); s.listeners.storage({ key: null });
  assert.equal(s.analytics.getConsent(), null); assert.equal(s.win["ga-disable-G-PRVFVEYZXQ"], true);
});

test("wrong endpoints and unconfirmed upstream responses never claim server acceptance", async () => {
  for (const badEndpoint of ["https://evil.example/api/landing/meta-event", `${endpoint}?token=secret`, endpoint.replace("https:", "http:")]) {
    const s = setup({ stored: "accepted", endpoint: badEndpoint });
    assert.equal((await s.analytics.track("Contact")).server, "unconfirmed"); assert.equal(s.requests.length, 0);
  }
  for (const response of [{ ok: true }, { ok: true, eventsReceived: 0 }, { ok: false, eventsReceived: 1 }]) {
    const s = setup({ stored: "accepted", endpoint, response });
    assert.equal((await s.analytics.track("Contact")).server, "unconfirmed");
  }
});

test("HTML contains no unconditional tracker or noscript beacon bypass", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.ok(!html.includes("connect.facebook.net")); assert.ok(!html.includes("www.facebook.com/tr"));
  assert.ok(!html.includes("www.googletagmanager.com"));
});
