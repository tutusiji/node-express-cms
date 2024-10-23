import 'uno.css';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './main';

// 生成预加载链接（preload links），用于在 HTML 页面头部预加载 JS 和 CSS 文件，提升客户端加载性能
function renderPreloadLinks(modules, manifest) {
  let links = '';
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

// 根据文件的类型生成合适的 <link> 标签，用于预加载或加载特定资源
function renderPreloadLink(file) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`;
  } else {
    return '';
  }
}

// 处理 Vue 的 "teleport" 功能，将组件内容渲染到指定的 DOM 位置（例如弹出层、模态框）
function renderTeleports(teleports) {
  if (!teleports) return '';
  return Object.entries(teleports).reduce((all, [key, value]) => {
    if (key.startsWith('#el-popper-container-')) {
      return `${all}<div id="${key.slice(1)}">${value}</div>`;
    }
    return all;
  }, teleports.body || '');
}

// 这是主要的渲染函数，负责处理每个请求，进行服务端渲染并生成 HTML
export async function render(url, manifest) {
  const { app, router, store } = createApp();
  try {
    await router.push(url);
    await router.isReady();
    const ctx = {};
    let appTitle = `Tuziki's Planet`;
    let appDescription = `<meta name="description" content="${appTitle}" />`;
    const appHtml = await renderToString(app, ctx);

    // 从组件上下文获取 articleList 的状态
    const preloadLinks = renderPreloadLinks(ctx.modules, manifest);
    const teleports = renderTeleports(ctx.teleports);
    const state = JSON.stringify(store.state.value);
    if (store.state.value && store.state.value.menuer.menuCurrentName) {
      appTitle = `${store.state.value.menuer.menuCurrentName} - Tuziki's Planet`;
      appDescription = `<meta name="description" content="${appTitle}" />`;
    }
    if (store.state.value && store.state.value.articleDetail.detail.title) {
      appTitle = `${store.state.value.articleDetail.detail.title} - Tuziki's Planet`;
      appDescription = `<meta name="description" content="${
        store.state.value.articleDetail.detail.summary || appTitle
      }" />`;
    }

    // 清理上下文和状态，避免内存持续性增长造成的内存泄漏，导致服务端性能开销压力，
    // web-ssr服务的内存开销会影响到其他服务使用，如在线服务端打包构建时会瞬间占用大量内存
    ctx.modules = null;
    ctx.teleports = null;
    store.state.value = null;

    return [appHtml, appTitle, appDescription, state, preloadLinks, teleports];
  } catch (error) {
    console.error('SSR Rendering Error:', error); // 错误日志
    return renderErrorPage(); // 返回一个标准的错误页面
  } finally {
    // 确保在每次请求后清理资源
    app.unmount();
  }
}

// 内存泄漏的问题处理：闭包、创建的临时对象、模板文件使用之后要清理掉

// 错误页面
function renderErrorPage() {
  return [
    `<div><h1>不好意思, 出了亿点点问题.</h1><p>我正在努力修复，或者你尝试刷新页面看看.</p></div>`,
    // eslint-disable-next-line @typescript-eslint/quotes
    "Error - Tuziki's Planet",
    '<meta name="description" content="Error Page" />',
    '{}',
    '',
    ''
  ];
}
