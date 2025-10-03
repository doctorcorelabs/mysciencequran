import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Conditionally import lovable-tagger only in development
let componentTagger: any = null;
try {
  // Only load in development, will be skipped in production if not installed
  const lovableTagger = require("lovable-tagger");
  componentTagger = lovableTagger.componentTagger;
} catch (e) {
  // lovable-tagger not available, skip it
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger && componentTagger(),
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
