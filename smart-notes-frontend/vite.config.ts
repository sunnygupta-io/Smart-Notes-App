import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
  test:{
    environment: 'jsdom',
    globals: true, // This allows us to use describe, it, expect without importing them
    setupFiles: './tests/setupTests.ts', // Points to our new setup file
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Tells Vitest to look in the tests folder
  }
})