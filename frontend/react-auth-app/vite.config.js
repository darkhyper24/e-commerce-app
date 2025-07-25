import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://backend:4000',
        changeOrigin: true,
      }, 
    },
    watch: {
      usePolling: true
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 8080
  }
})