import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
   plugins: [react()],
   resolve: {
     alias: {
       '@': path.resolve(__dirname, './src')
     }
   },
   build: {
     outDir: 'dist',
     emptyOutDir: true,
     rollupOptions: {
       output: {
         entryFileNames: 'js/[name].js',
         chunkFileNames: 'js/[name].js',
         assetFileNames: 'css/[name].[ext]',
         manualChunks: {
           vendor: ['react', 'react-dom'],
           workflow: ['@reactflow/core', '@reactflow/background', '@reactflow/controls'],
           utils: ['lucide-react', 'zustand']
         }
       }
     }
   },
   server: {
     port: 3000
   }
})