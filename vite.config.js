import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'lagoon-tartar-shrank.ngrok-free.dev'
    ]
  }
})
