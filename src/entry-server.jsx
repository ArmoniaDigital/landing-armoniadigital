import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { getPageMeta, pageCanonical, SITE_URL, normalizePath, getRouteFromPath } from "./seo.js";

export function render(path) {
  return renderToString(<App initialPath={path} />);
}

export { getPageMeta, pageCanonical, SITE_URL, normalizePath, getRouteFromPath };
