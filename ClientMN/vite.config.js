import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      "/analytics": {
        target: "http://192.168.0.7:8000",
        changeOrigin: true,
        secure: false
      }
    }
  }
})
