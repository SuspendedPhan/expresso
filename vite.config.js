import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import { fileURLToPath, URL } from 'node:url'

import { execSync } from 'node:child_process'

function buildProjects() {
  execSync('./dev/build.sh')
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'prebuild-commands',
      handleHotUpdate: async ({ file, server }) => {
        if (file.endsWith('.go')) {
          buildProjects()
          server.hot.send({
            type: 'full-reload',
            path: '*'
          })
        }
      },
      buildStart: async () => {
        buildProjects()
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})