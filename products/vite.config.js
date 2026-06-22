import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const fixFederationCss = {
  name: 'fix-federation-css',
  generateBundle(_, bundle) {
    for (const key of Object.keys(bundle)) {
      if (!key.endsWith('remoteEntry.js')) continue
      const entry = bundle[key]
      const src = entry.source ?? entry.code
      if (!src) continue
      const fixed = String(src).replace(/\b(\w)\(`__v__css__[^`]*`,/g, '$1([],')
      if (entry.source !== undefined) entry.source = fixed
      else entry.code = fixed
    }
  },
}

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductsApp': './src/ProductsApp',
      },
      shared: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
    }),
    fixFederationCss,
  ],
  build: {
    target: 'esnext',
  },

  server: {
    port: 3001,
  },

  preview: {
    port: 3001,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  
})