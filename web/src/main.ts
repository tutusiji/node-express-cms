import { createApp } from "vue";
import "./style.css";
import "./tailwind.css";

import App from "./App.vue";

import router from "./router";

import { createPinia } from "pinia";
const pinia = createPinia();

const app = createApp(App);

app.use(router);
app.mount("#app");
app.use(pinia);
// createApp(App).mount('#app').use(router);
