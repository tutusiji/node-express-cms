/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import axios from 'axios';
import { fileURLToPath } from 'node:url';
// import { JSDOM } from 'jsdom';
import adapter from 'axios/lib/adapters/http.js';

// 创建 jsdom 实例
// const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
//   url: 'http://localhost' // 模拟的初始 URL
// });
// // 将 window 和 document 对象模拟为全局变量
// global.window = dom.window;
// global.document = dom.window.document;
// global.navigator = dom.window.navigator;

axios.defaults.adapter = adapter;
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;
const isProduction = process.env.NODE_ENV === 'production';
export async function createServer(root = process.cwd(), isProd = isProduction) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const resolve = (p) => path.resolve(__dirname, p);
  const indexProd = isProd ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8') : '';
  const manifest = isProd
    ? JSON.parse(fs.readFileSync(resolve('dist/client/ssr-manifest.json'), 'utf-8'))
    : {};
  // @ts-ignore

  const app = express();

  let vite;
  if (!isProd) {
    vite = await (
      await import('vite')
    ).createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100
        }
      },
      appType: 'custom'
    });
    // use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    app.use((await import('compression')).default());
    app.use(
      (await import('serve-static')).default(resolve('dist/client'), {
        index: false
      })
    );
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;

      let template, render;
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server')).render;
      } else {
        template = indexProd;
        render = (await import('./dist/server/entry-server.js')).render;
      }

      const [appHtml, appTitle, appDescription, state, links, teleports] = await render(
        url,
        manifest
      );
      // console.log('appHtml===', typeof appHtml, appHtml);
      const html = template
        .replace(`<!--app-title-->`, appTitle)
        .replace(`<!--app-description-->`, appDescription)
        .replace(`<!--preload-links-->`, links)
        .replace(`'<pinia-store>'`, state)
        .replace(`<!--app-html-->`, appHtml)
        .replace(/(\n|\r\n)\s*<!--app-teleports-->/, teleports);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app, vite };
}

if (!isTest) {
  const PORT = 3111;
  createServer().then(({ app }) =>
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    })
  );
}
