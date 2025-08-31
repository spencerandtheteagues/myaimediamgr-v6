import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const r = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  root: r("client"),
  publicDir: r("client/public"),
  plugins: [react()],
  css: {
    postcss: r("client/postcss.config.cjs"),
  },
  resolve: {
    alias: { "@": r("client/src") },
  },
  build: {
    outDir: r("dist/public"),
    emptyOutDir: true,
  },
});
