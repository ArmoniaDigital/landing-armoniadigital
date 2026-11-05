import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Landing VSL independiente (campaña Meta Ads).
// No comparte rutas, navegación ni estilos con la landing principal.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
  },
  preview: {
    port: 5180,
  },
});
