import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Build optimizations for production
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Minification settings
    minify: 'esbuild',
    
    // Enable source maps for debugging (disable in prod if needed)
    sourcemap: false,
    
    // Chunk size warning limit (kB)
    chunkSizeWarningLimit: 500,
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - these change rarely, so browsers can cache them
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-state': ['zustand'],
        },
        // Asset file naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Reduce bundle size
    reportCompressedSize: true,
  },
  
  // Development server settings
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Proxy API requests to backend in development
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Preview server (for testing production builds locally)
  preview: {
    port: 4173,
    strictPort: true,
  },
  
  // Optimization settings
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'chart.js',
      'react-chartjs-2',
      'framer-motion',
      'lucide-react',
    ],
  },
  
  // Enable esbuild optimizations
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
    // Faster test execution
    pool: 'forks',
    isolate: false,
  },
});
