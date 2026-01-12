import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    port: 5173,
    proxy: {
      "/api": {
        target: "https://digitallifelessonsa11.web.app",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@stripe/stripe-js"],
  },
  build: {
    rollupOptions: {
      external: ["@stripe/stripe-js"],
    },
  },
});
