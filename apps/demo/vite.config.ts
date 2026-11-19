import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@local-hosting/wire': path.resolve(root, '../../packages/wire/src/index.ts'),
      '@local-hosting/compose': path.resolve(root, '../../../compose/src/index.ts'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', '@westlane/pino-blanc/browser'],
    exclude: ['@local-hosting/compose', '@local-hosting/wire'],
  },
  server: {
    fs: {
      allow: [path.resolve(root, '../../..')],
    },
  },
})
