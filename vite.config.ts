import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

const srcPath = decodeURI(new URL('./src', import.meta.url).pathname)

export default defineConfig({
  plugins: [react(), imagetools()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
})
