import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import checker from "vite-plugin-checker";

import { execSync } from "node:child_process";

function buildProjects() {
  execSync("./dev/build.sh");
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    {
      name: "prebuild-commands",
      handleHotUpdate: async ({ file, server }) => {
        if (file.endsWith(".go")) {
          buildProjects();
          server.hot.send({
            type: "full-reload",
            path: "*",
          });
        }
      },
      buildStart: async () => {
        buildProjects();
      },
    },
    checker({ typescript: true }),
  ],
  resolve: {
    alias: {
      src: "/src",
    }
  },
  server: {
    proxy: {
      // Proxy API requests. Avoid CORS issues.
      '/v1/traces': {
        target: 'http://localhost:4318', // The OTEL collector
        changeOrigin: true,
      },
    },
  }
});
