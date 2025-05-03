import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward /api/* to your Express backend
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        // optional: rewrite the path if your server mounts elsewhere
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
