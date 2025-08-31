import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This config is now run from within the 'client' directory
export default defineConfig({
  plugins: [react()],
  build: {
    // Output to the project's root dist folder, relative from 'client'
    outDir: "../dist/public",
    emptyOutDir: true,
  },
});
