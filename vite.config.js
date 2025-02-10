import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'favicon.png') {
            return 'favicon.png';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    proxy: {
      '/valuation-api': {
        target: 'https://function-bun-production-8d48.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/valuation-api/, '')
      }
    }
  }
})
