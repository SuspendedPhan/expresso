import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

import { fileURLToPath, URL } from "node:url";

import { execSync } from "node:child_process";

// const projectRootDir = path.resolve(__dirname);

function buildProjects() {
  execSync("./dev/build.sh");
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    // tsconfigPaths(),
    // alias({
    //   entries: [
    //     {
    //       find: "src",
    //       replacement: path.resolve(projectRootDir, "src"),
    //     },
    //   ],
    // }),
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
});
