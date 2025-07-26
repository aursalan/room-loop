import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   port:5173, 
  //   proxy: {
  //     // Proxy API requests to backend
  //     '/api': {
  //       target: 'import.meta.env.VITE_API_BASE_URL',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
})
