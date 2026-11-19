import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', '@westlane/pino-blanc/browser'],
  },
})
