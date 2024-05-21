import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { execSync } from 'node:child_process'

function buildProjects() {
  // execSync('./dev/build.sh', (err: any, stdout: any, stderr: any) => {
  //   if (err) {
  //     console.error(err)
  //     return
  //   }
  //   console.log(stdout)
  // })

  execSync('./dev/build.sh')
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
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
