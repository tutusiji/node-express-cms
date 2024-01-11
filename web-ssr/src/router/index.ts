import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';

const routerHistory = import.meta.env.SSR === false ? createWebHistory() : createMemoryHistory();
// const views = import.meta.glob('../views/*.vue');
// const routes: any = Object.keys(views)
//   .map((path) => {
//     // 使用更灵活的正则表达式匹配，以适应不同的路径格式
//     const match = path.match(/\/views\/(.*)\.vue$/);
//     if (!match) {
//       // 如果没有匹配到，打印路径并返回null
//       console.error(`Path does not match expected format: ${path}`);
//       return null;
//     }
//     const name = match[1].toLowerCase();
//     return {
//       path: name === 'home' ? '/' : `/${name}`,
//       name,
//       component: views[path]
//     };
//   })
//   .filter((route) => route !== null); // 过滤掉任何null值
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Main.vue'),
    children: [
      {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue')
      },
      {
        path: '/detail/:id',
        name: 'detail',
        component: () => import('../views/Detail.vue')
      },
      {
        path: '/project',
        name: 'project',
        component: () => import('../views/Home.vue')
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('../views/Detail.vue')
      }
    ]
  }
];

export default function () {
  return createRouter({
    history: routerHistory,
    routes
  });
}
