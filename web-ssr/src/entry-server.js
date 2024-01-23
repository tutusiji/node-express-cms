import 'uno.css';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './main';

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

function renderPreloadLink(file) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`;
  } else {
    return '';
  }
}

function renderTeleports(teleports) {
  if (!teleports) return '';
  return Object.entries(teleports).reduce((all, [key, value]) => {
    if (key.startsWith('#el-popper-container-')) {
      return `${all}<div id="${key.slice(1)}">${value}</div>`;
    }
    return all;
  }, teleports.body || '');
}

export async function render(url, manifest) {
  const { app, router, store } = createApp();
  try {
    await router.push(url);
    await router.isReady();
    const ctx = {};
    let appTitle = 'Tuziki的个人记录';
    let appDescription = `<meta name="description" content="${appTitle}" />`;
    const appHtml = await renderToString(app, ctx);

    // 从组件上下文获取 articleList 的状态
    const preloadLinks = renderPreloadLinks(ctx.modules, manifest);
    const teleports = renderTeleports(ctx.teleports);
    const state = JSON.stringify(store.state.value);
    if (store.state.value && store.state.value.menuer.menuCurrentName) {
      appTitle = `Tuziki的个人记录 - ${store.state.value.menuer.menuCurrentName}`;
      appDescription = `<meta name="description" content="${appTitle}" />`;
    }
    if (store.state.value && store.state.value.articleDetail.detail.title) {
      appTitle = `${store.state.value.articleDetail.detail.title} - Tuziki的个人记录`;
      appDescription = `<meta name="description" content="${
        store.state.value.articleDetail.detail.summary || appTitle
      }" />`;
    }
    return [appHtml, appTitle, appDescription, state, preloadLinks, teleports];
  } catch (error) {
    console.log(error);
  }
}
