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
    redirect: '/coder/1',
    component: () => import('../views/Main.vue'),
    children: [
      {
        path: '/coder/:page',
        name: 'coder',
        component: () => import('../views/Home.vue'),
        meta: {
          type: 'list'
        }
      },
      {
        path: '/project/:page',
        name: 'project',
        component: () => import('../views/Home.vue'),
        meta: {
          type: 'list'
        }
      },
      // {
      //   path: '/search/:page',
      //   name: 'search',
      //   component: () => import('../views/Home.vue'),
      //   meta: {
      //     type: 'list'
      //   }
      // },
      {
        path: '/:type/article/:id',
        name: 'article',
        component: () => import('../views/Article.vue'),
        meta: {
          type: 'article'
        }
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('../views/Article.vue'),
        meta: {
          type: 'article'
        }
      },
      // 字体包子集在线抽取小工具
      // {
      //   path: '/:type/article/65aaf0aaeb8ff12f39e87ff1',
      //   name: 'makeFonts',
      //   component: () => import('../views/Tools/MakeFonts.vue'),
      //   meta: {
      //     type: 'article'
      //   }
      // },
      // “捕获所有”路由，重定向到首页
      {
        path: '/:catchAll(.*)',
        redirect: '/coder/1'
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
