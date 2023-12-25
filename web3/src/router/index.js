
import { createRouter, createWebHashHistory } from "vue-router"
 
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../components/home.vue"),
  },
  {
    path: "/p4",
    name: "panel",
    component: () => import("../components/panel4.vue"),
  },
];
export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})



export default router;