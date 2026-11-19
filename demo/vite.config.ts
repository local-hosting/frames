import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const demoRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: demoRoot,
  plugins: [tailwindcss()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', '@westlane/pino-blanc/browser'],
  },
})