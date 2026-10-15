import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'tablet-poking-entity.ngrok-free.dev' // Substitua pelo seu domínio atual do ngrok se mudar
    ]
  }
})

