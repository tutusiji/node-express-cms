import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../components/Main.vue"),
    children: [
      {
        path: "/",
        name: "home",
        component: () => import("../components/Home.vue"),
      },
      {
        path: "/detail/:id",
        name: "detail",
        component: () => import("../components/Detail.vue"),
      },
      {
        path: "/project",
        name: "project",
        component: () => import("../components/Project.vue"),
      },
      {
        path: "/about",
        name: "about",
        component: () => import("../components/About.vue"),
      },
    ],
  },
  {
    path: "/p4",
    name: "panel",
    component: () => import("../components/panel4.vue"),
  },
];
export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

export default router;
