import path from 'path';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import vuePlugin from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import vueJsxPlugin from '@vitejs/plugin-vue-jsx';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import unocss from 'unocss/vite';
import presetMini from '@unocss/preset-mini';
import AutoImport from 'unplugin-auto-import/vite';
import { prismjsPlugin } from 'vite-plugin-prismjs';

export default defineConfig({
  base: '/',
  plugins: [
    vuePlugin(),
    prismjsPlugin({
      languages: 'all',
      plugins: ['line-numbers', 'copy-to-clipboard'], // 官网有其他功能,这里开启行数和复制按钮功能
      theme: 'okaidia',
      css: true
    }),
    vueJsxPlugin(),
    eslintPlugin({
      cache: false,
      include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx']
    }),
    unocss({
      presets: [presetMini()]
    }),
    Components({
      resolvers: [ElementPlusResolver({ ssr: true })],
      directoryAsNamespace: true
    }),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver({ ssr: true })]
    })
  ],
  // server: {
  //   port: 80
  // },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
