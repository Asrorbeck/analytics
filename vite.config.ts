import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

// Plugin to copy index.html to 404.html for GitHub Pages SPA routing
const copy404Plugin = () => {
  return {
    name: "copy-404",
    closeBundle() {
      const distPath = path.resolve(__dirname, "dist");
      const indexPath = path.join(distPath, "index.html");
      const notFoundPath = path.join(distPath, "404.html");

      if (existsSync(indexPath)) {
        const indexContent = readFileSync(indexPath, "utf-8");
        writeFileSync(notFoundPath, indexContent);
        console.log("✓ Copied index.html to 404.html for GitHub Pages");
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copy404Plugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
