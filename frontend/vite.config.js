import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@mui/material/styles',
      '@emotion/react',
      '@emotion/styled'
    ],
    force: true // Force dependency optimization
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/material/styles'],
          'router-vendor': ['react-router-dom']
        }
      }
    }
  },
  // Increase timeout for dependency pre-bundling
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: false,
    },
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
