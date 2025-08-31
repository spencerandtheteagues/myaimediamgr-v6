import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This 'resolve' block is the fix.
  // It tells Vite that any import starting with "@"
  // should be resolved relative to the 'client/src' directory.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  build: {
    // This ensures the output goes to a predictable directory.
    outDir: "../dist/public",
    emptyOutDir: true,
  },
  // This is needed to correctly serve the app from the Node.js server.
  root: "client",
});