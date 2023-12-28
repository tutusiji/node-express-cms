import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import tailwindcss from "tailwindcss";

import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  define: {
    "process.env": {
      VUE_APP_API_URL: "http://localhost:3000/web/api",
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    //自动引入
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-import.d.ts",
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    tailwindcss,
    autoprefixer,
  ],
  build: {
    outDir: __dirname + "/../server/web",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
