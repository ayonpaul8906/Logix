import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Polyfill plugins for Node built-ins (needed by plotly.js)
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      buffer: 'buffer',                // polyfill buffer
      process: 'process/browser',      // polyfill process
      util: 'util',                    // polyfill util (used internally by some libs)
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // fixes “global is not defined”
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
})
