import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Define el directorio de salida
  },
  server: {
    port: 3000, // Cambia el puerto según sea necesario
  },
  base: '/',  //// Define la ruta base
})
