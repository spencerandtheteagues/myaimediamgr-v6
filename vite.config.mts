// vite.config.mts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Treat these as DEV-ONLY. Never include on Railway prod.
const isProd = process.env.NODE_ENV === "production"
  || process.env.VERCEL_ENV === "production"
  || process.env.RAILWAY_STATIC_URL
  || process.env.CI;

export default defineConfig(async () => {
  const plugins = [react()];

  // Only load Replit plugins in dev and when running on Replit.
  if (!isProd && (process.env.REPL_ID || process.env.REPL_SLUG)) {
    const cartographer = (await import("@replit/vite-plugin-cartographer")).default;
    const errorModal = (await import("@replit/vite-plugin-runtime-error-modal")).default;
    plugins.push(cartographer());
    plugins.push(errorModal());
  }

  return {
    plugins,
    base: "/",
    build: {
      sourcemap: false,
      target: "es2020",
    },
  };
});