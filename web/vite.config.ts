import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { rmSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const root = process.cwd();
  // const env = loadEnv(mode, root);
  const env = loadEnv(mode, "./");

  if (command === "build") {
    // 在构建之前删除 /../server/web 目录
    const outDir = fileURLToPath(new URL("../server/web", import.meta.url));
    rmSync(outDir, { recursive: true, force: true });
  }

  console.log(env);
  return {
    base: "./",
    define: {
      // "process.env": {
      //   VUE_APP_API_URL: import.meta.env.VITE_APP_BASE_API,
      // },
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
      outDir: fileURLToPath(new URL("../server/web", import.meta.url)),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: env.VITE_HOST,
      port: env.VITE_PORT,
      // 是否自动在浏览器打开
      open: true,
      // 是否开启 https
      https: false,
      // 服务端渲染
      ssr: false,
      base: env.VITE_BASE_URL,
      // outDir: env.VITE_OUTPUT_DIR,
      define: {
        "process.env": {},
      },
    },
  };
});
