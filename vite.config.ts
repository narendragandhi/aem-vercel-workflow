import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../ui.apps/src/main/content/jcr_root/apps/aem-vercel-workflow/clientlibs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'css/[name].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          workflow: ['workflow', '@reactflow/core', '@reactflow/background', '@reactflow/controls'],
          utils: ['axios', 'lucide-react', 'zustand']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4502',
        changeOrigin: true
      }
    }
  }
})