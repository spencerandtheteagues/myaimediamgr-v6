import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 👉 change this to your actual client folder that CONTAINS index.html
const clientRoot = resolve(__dirname, "client");
// If yours is different use:
// const clientRoot = resolve(__dirname, "myaimediamgr_project/myaimediamgr-frontend");

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
  base: "/",
  build: {
    outDir: resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
  },
});