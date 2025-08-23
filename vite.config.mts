import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 🔴 If your frontend folder is different, change this ONE line:
const clientRoot = resolve(__dirname, "client");

// Emit to server-friendly location
const outDir = resolve(__dirname, "dist/public");

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
  base: "/",
  build: {
    outDir,
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
  },
});