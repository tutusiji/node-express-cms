// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/CodeLab/node-express-blog/web/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "node:url";
import vue from "file:///D:/CodeLab/node-express-blog/web/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///D:/CodeLab/node-express-blog/web/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import AutoImport from "file:///D:/CodeLab/node-express-blog/web/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/CodeLab/node-express-blog/web/node_modules/unplugin-vue-components/dist/vite.mjs";
import { ElementPlusResolver } from "file:///D:/CodeLab/node-express-blog/web/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import tailwindcss from "file:///D:/CodeLab/node-express-blog/web/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///D:/CodeLab/node-express-blog/web/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_dirname = "D:\\CodeLab\\node-express-blog\\web";
var __vite_injected_original_import_meta_url = "file:///D:/CodeLab/node-express-blog/web/vite.config.ts";
var vite_config_default = defineConfig(({ command, mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, "./");
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
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      tailwindcss,
      autoprefixer
    ],
    build: {
      outDir: __vite_injected_original_dirname + "/../server/web"
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
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
        "process.env": {}
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDb2RlTGFiXFxcXG5vZGUtZXhwcmVzcy1ibG9nXFxcXHdlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQ29kZUxhYlxcXFxub2RlLWV4cHJlc3MtYmxvZ1xcXFx3ZWJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0NvZGVMYWIvbm9kZS1leHByZXNzLWJsb2cvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gXCJub2RlOnVybFwiO1xuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XG5pbXBvcnQgdnVlSnN4IGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGVcIjtcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzXCI7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcInRhaWx3aW5kY3NzXCI7XG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gXCJhdXRvcHJlZml4ZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoe2NvbW1hbmQsIG1vZGV9KSA9PiB7XG4gIGNvbnN0IHJvb3QgPSBwcm9jZXNzLmN3ZCgpO1xuICAvLyBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHJvb3QpO1xuICAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBcIi4vXCIpO1xuXG4gIGNvbnNvbGUubG9nKGVudik7XG4gIHJldHVybiB7XG4gICAgYmFzZTogXCIuL1wiLFxuICAgIGRlZmluZToge1xuICAgICAgLy8gXCJwcm9jZXNzLmVudlwiOiB7XG4gICAgICAvLyAgIFZVRV9BUFBfQVBJX1VSTDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBQX0JBU0VfQVBJLFxuICAgICAgLy8gfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZ1ZSgpLFxuICAgICAgdnVlSnN4KCksXG4gICAgICAvL1x1ODFFQVx1NTJBOFx1NUYxNVx1NTE2NVxuICAgICAgQXV0b0ltcG9ydCh7XG4gICAgICAgIGltcG9ydHM6IFtcInZ1ZVwiLCBcInZ1ZS1yb3V0ZXJcIl0sXG4gICAgICAgIGR0czogXCJzcmMvYXV0by1pbXBvcnQuZC50c1wiLFxuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxuICAgICAgfSksXG4gICAgICBDb21wb25lbnRzKHtcbiAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcbiAgICAgIH0pLFxuICAgICAgdGFpbHdpbmRjc3MsXG4gICAgICBhdXRvcHJlZml4ZXIsXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiBfX2Rpcm5hbWUgKyBcIi8uLi9zZXJ2ZXIvd2ViXCIsXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogZmlsZVVSTFRvUGF0aChuZXcgVVJMKFwiLi9zcmNcIiwgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiBlbnYuVklURV9IT1NULFxuICAgICAgcG9ydDogZW52LlZJVEVfUE9SVCxcbiAgICAgIC8vIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1NjI1M1x1NUYwMFxuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIC8vIFx1NjYyRlx1NTQyNlx1NUYwMFx1NTQyRiBodHRwc1xuICAgICAgaHR0cHM6IGZhbHNlLFxuICAgICAgLy8gXHU2NzBEXHU1MkExXHU3QUVGXHU2RTMyXHU2N0QzXG4gICAgICBzc3I6IGZhbHNlLFxuICAgICAgYmFzZTogZW52LlZJVEVfQkFTRV9VUkwsXG4gICAgICAvLyBvdXREaXI6IGVudi5WSVRFX09VVFBVVF9ESVIsXG4gICAgICBkZWZpbmU6IHtcbiAgICAgICAgXCJwcm9jZXNzLmVudlwiOiB7fSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUixTQUFTLGNBQWMsZUFBZTtBQUNoVSxTQUFTLGVBQWUsV0FBVztBQUNuQyxPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBQ3BDLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sa0JBQWtCO0FBUnpCLElBQU0sbUNBQW1DO0FBQXNJLElBQU0sMkNBQTJDO0FBV2hPLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUMsU0FBUyxLQUFJLE1BQU07QUFDL0MsUUFBTSxPQUFPLFFBQVEsSUFBSTtBQUV4QixRQUFNLE1BQU0sUUFBUSxNQUFNLElBQUk7QUFFL0IsVUFBUSxJQUFJLEdBQUc7QUFDZixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJUjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLE1BQ0osT0FBTztBQUFBO0FBQUEsTUFFUCxXQUFXO0FBQUEsUUFDVCxTQUFTLENBQUMsT0FBTyxZQUFZO0FBQUEsUUFDN0IsS0FBSztBQUFBLFFBQ0wsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0FBQUEsTUFDbkMsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLFFBQ1QsV0FBVyxDQUFDLG9CQUFvQixDQUFDO0FBQUEsTUFDbkMsQ0FBQztBQUFBLE1BQ0Q7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUSxtQ0FBWTtBQUFBLElBQ3RCO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3REO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTSxJQUFJO0FBQUEsTUFDVixNQUFNLElBQUk7QUFBQTtBQUFBLE1BRVYsTUFBTTtBQUFBO0FBQUEsTUFFTixPQUFPO0FBQUE7QUFBQSxNQUVQLEtBQUs7QUFBQSxNQUNMLE1BQU0sSUFBSTtBQUFBO0FBQUEsTUFFVixRQUFRO0FBQUEsUUFDTixlQUFlLENBQUM7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
