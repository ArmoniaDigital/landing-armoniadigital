import { createAnalytics } from "./analytics.mjs";

export const analytics = createAnalytics({
  win: window, doc: document,
  metaEndpoint: import.meta.env.VITE_META_CONVERSIONS_URL || "",
});
