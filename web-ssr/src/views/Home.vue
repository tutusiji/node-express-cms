<template>
  <ul v-loading="articleStore.loading" class="articleList">
    <li v-for="item of articleStore.list" :key="item._id">
      <!-- @click="$router.push(`./detail/${item._id}`)" -->
      <span class="num">No.{{ item.serialNumber }}</span>
      <div class="info">
        <div class="content">
          <div>
            <a class="title" :href="`./detail/${item._id}`">{{ item.title }}</a>
          </div>
          <div v-show="item.summary" class="summary">
            {{ item.summary }}<a class="desc" :href="`./detail/${item._id}`">... 阅读全文 〉</a>
          </div>
        </div>
        <div class="date">
          <!-- YYYY-MM-DD HH:mm:ss -->
          <em>{{ item.date && dayjs(item.date).format('MM-DD') }}</em>
          <b>{{ item.date && dayjs(item.date).format('YYYY') }}</b>
          <!-- <div class="auther">Tutu</div> -->
        </div>
      </div>
    </li>
  </ul>
  <div v-show="articleStore.list.length > 0" class="clear-both overflow-hidden py-10">
    <el-pagination
      v-model:current-page="articleStore.currentPage"
      class="float-right"
      background
      layout="prev, pager, next"
      :total="articleStore.totalItems"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { useMenuStore } from '../store/menuStore';
import { useArticleStore } from '../store/artcleStore';
const menuStore = useMenuStore();
const articleStore = useArticleStore();

const route = useRoute();

// SSR 数据预取
onServerPrefetch(async () => {
  const currentMenu = menuStore.menu.find((item) => `${item.path}` === route.path);
  if (currentMenu) {
    await articleStore.fetchArticles(currentMenu.name, articleStore.currentPage, 10);
  }
});
// 改变路由清空数据
// const router = useRouter();
// router.beforeEach(() => {
//   articleStore.list = [];
//   articleStore.currentPage = 1;
//   articleStore.totalItems = 0;
// });

onMounted(() => {
  const currentPage = Number(sessionStorage.getItem('currentPage')) || 1;
  // 如果没有服务器端数据，则正常获取数据
  if (!articleStore.list.length) {
    console.log('Article list ssr reload');
    const currentMenu = menuStore.menu.find((item) => `${item.path}` === route.path);
    if (currentMenu) {
      articleStore.fetchArticles(currentMenu.name, currentPage, 10);
    }
  }
  articleStore.currentPage = currentPage;
});
// 在客户端，监听路由变化并重新加载数据
// watch(route, (to, from) => {
//   console.log(to.path, from.path);
//   if (to.path !== from.path) {
//     const currentMenu = menuStore.menu.find((item) => `${item.path}` === route.path);
//     if (currentMenu) {
//       articleStore.fetchArticles(currentMenu.name, 1, 10);
//     }
//   }
// });

const handleCurrentChange = (val: any) => {
  articleStore.currentPage = val;
  sessionStorage.setItem('currentPage', val.toString());
  const currentMenu = menuStore.menu.find((item) => `${item.path}` === route.path);
  if (currentMenu) {
    articleStore.fetchArticles(currentMenu.name, val, 10);
  }
};
</script>
