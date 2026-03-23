// vite.config.ts - Add Tailwind as a Vite plugin
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // ← Tailwind v4 Vite plugin
  ],
})