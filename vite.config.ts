import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Memisahkan library dari node_modules menjadi file (chunk) terpisah
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'icons'; // Memisahkan ikon ke file icons.js
            }
            if (id.includes('@supabase')) {
              return 'supabase'; // Memisahkan supabase ke file supabase.js
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'; // Memisahkan core React ke file react-vendor.js
            }
            return 'vendor'; // Sisa library lainnya masuk ke vendor.js
          }
        },
      },
    },
  },
})