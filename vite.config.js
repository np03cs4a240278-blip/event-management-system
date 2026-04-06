import { defineConfig, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";

function jsFilesAsJsx(isDevelopment) {
  return {
    name: "js-files-as-jsx",
    enforce: "pre",
    async transform(code, id) {
      const [path] = id.split("?");

      if (!/\/src\/.*\.js$/.test(path)) {
        return null;
      }

      const result = await transformWithOxc(code, path, {
        lang: "jsx",
        jsx: {
          development: isDevelopment,
          runtime: "automatic",
        },
      });

      return {
        code: result.code,
        map: result.map,
        moduleType: "js",
      };
    },
  };
}

export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [jsFilesAsJsx(command === "serve"), react()],
  build: {
    outDir: "build",
  },
  optimizeDeps: {
    rolldownOptions: {
      moduleTypes: {
        ".js": "jsx",
      },
    },
  },
  server: {
    port: 3000,
  },
}));
