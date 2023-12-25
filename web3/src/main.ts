import { createApp } from 'vue'
import './style.css'
import "./tailwind.css";
import App from './App.vue'

import router from "./router";

const app = createApp(App);
app.use(router);
app.mount("#app");
// createApp(App).mount('#app').use(router);