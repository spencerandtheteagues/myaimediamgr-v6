import { defineConfig, normalizePath } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import fs from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const candidates = [process.env.CLIENT_ROOT, "client", "myaimediamgr_project/myaimediamgr-frontend", "frontend", "apps/web"].filter(Boolean) as string[];

function pickRoot() {
  for (const rel of candidates) {
    const abs = resolve(__dirname, rel);
    if (fs.existsSync(join(abs, "index.html"))) return abs;
  }
  throw new Error(`Could not find client 'index.html'. Tried: ${candidates.join(", ")}`);
}

const clientRoot = pickRoot();
const srcAlias = normalizePath(resolve(clientRoot, "src"));

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
  resolve: { alias: [{ find: "@", replacement: srcAlias }] },
  css: {
    postcss: resolve(clientRoot, "postcss.config.cjs"),
  },
  base: "/",
  build: {
    outDir: resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: "es2020",
  },
});