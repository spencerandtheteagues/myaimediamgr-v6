import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  root: r("client"),                      // Vite root = /client
  publicDir: r("client/public"),          // copies to dist/public
  plugins: [react()],
  css: {
    // Force Vite to use the client's PostCSS config (ignores any stray configs)
    postcss: r("client/postcss.config.cjs"),
  },
  resolve: {
    alias: { "@": r("client/src") },
  },
  build: {
    outDir: r("dist/public"),             // emit index.html + assets here
    emptyOutDir: true,
  },
});