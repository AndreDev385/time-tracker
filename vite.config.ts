import { defineConfig } from 'vite'
import "dotenv/config"
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    outDir: 'dist-react',
    rollupOptions: {
      input: {
        main: "./index.html",
        toolbar: "./toolbar.html"
      }
    }
  },
  server: {
    port: 5123,
    strictPort: true,
  },
  define: {
    'process.env.BACK_BLAZE_KEY': JSON.stringify(process.env.BACK_BLAZE_KEY),
    'process.env.BACK_BLAZE_SECRET': JSON.stringify(process.env.BACK_BLAZE_SECRET),
  }
})
