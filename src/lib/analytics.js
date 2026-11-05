import { createAnalytics } from "./brand-analytics.mjs";

export const analytics = createAnalytics({
  win: typeof window !== "undefined" ? window : undefined,
  doc: typeof document !== "undefined" ? document : undefined,
});

export function initPixel() {
  analytics.initialize();
  void analytics.track("PageView", { source: "tu-proxima-web", content_name: "Tu proxima web" });
}
export function track(event, params = {}) { return analytics.track(event, params); }
export function trackCustom() { return { skipped: true, reason: "unsupported_event" }; }
