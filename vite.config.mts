import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // The root is the client directory, relative to this config file
  root: "client",
  plugins: [react()],
  // Restore the alias to resolve '@' to the client's src directory
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  build: {
    // The output directory is relative to the root ('client')
    outDir: "../dist/public",
    emptyOutDir: true,
  },
});