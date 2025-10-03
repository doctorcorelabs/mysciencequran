import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Set API base URL based on mode
    'import.meta.env.VITE_API_BASE_URL': mode === 'production' 
      ? JSON.stringify('https://ayat-sains-insight.netlify.app')
      : JSON.stringify('http://localhost:8787')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
}));
