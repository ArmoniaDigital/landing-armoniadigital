import React from "react";
import ReactDOM from "react-dom/client";
import App from "./Strategy";
import "./styles.css";
import "./strategy.css";
import "./mobile-vsl.css";
import "./desktop-scene.css";
import "./purchase-offer.css";
import "./campaign-sections.css";
import "./cookie-consent.css";
import { initPixel } from "./lib/analytics";

initPixel();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
