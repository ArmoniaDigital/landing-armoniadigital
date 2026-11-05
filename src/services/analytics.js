import { createAnalytics } from "./analytics.mjs";

const hasWindow = typeof window !== "undefined";

export const analytics = createAnalytics({
  win: hasWindow ? window : undefined,
  doc: hasWindow ? document : undefined,
  metaEndpoint: import.meta.env.VITE_META_CONVERSIONS_URL || "",
});
