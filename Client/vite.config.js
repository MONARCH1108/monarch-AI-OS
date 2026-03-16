import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {

      "/analytics": {
        target: "http://192.168.0.8:8000",
        changeOrigin: true
      },

      "/pipeline": {
        target: "http://192.168.0.8:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pipeline/, "/pipeline")
      }

    }
  }
})