import { createApp } from './main';
import 'uno.css';
import '@/assets/css/index.css';
import 'element-plus/theme-chalk/base.css';
const { app, router, store } = createApp();

if (window.__INITIAL_STATE__) {
  store.state.value = JSON.parse(JSON.stringify(window.__INITIAL_STATE__));
}
// 清除全局状态，避免重复使用
delete window.__INITIAL_STATE__;

router.isReady().then(() => {
  app.mount('#app');
});
