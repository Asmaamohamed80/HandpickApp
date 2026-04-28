import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  root: 'client',
  /** Load `.env.local` from repo root (same file the Node server uses). */
  envDir: path.resolve(__dirname, '..'),
  /** Allow NEXT_PUBLIC_* (common with Supabase docs) to be embedded like VITE_* */
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  },
});