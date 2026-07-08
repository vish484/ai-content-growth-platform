import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // In local dev, proxy /api/* to the FastAPI backend.
    // This mirrors how Vercel routes /api/* to the serverless function.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Rewrite: /api/validate-url → /api/validate-url (no change needed)
      },
    },
  },
})