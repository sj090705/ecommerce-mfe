import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        products: 'http://localhost:3001/assets/remoteEntry.js',
        cart: 'http://localhost:3002/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
    }),
  ],
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
})