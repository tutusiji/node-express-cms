<template>
  <ul v-loading="loading" class="articleList">
    <li v-for="item of articleList" :key="item._id">
      <!-- @click="$router.push(`./article/${item._id}`)" -->
      <span class="num">No.{{ item.serialNumber }}</span>
      <div class="info">
        <div class="content">
          <div>
            <a class="title" :href="`./article/${item._id}`">{{ item.title }}</a>
          </div>
          <div v-show="item.summary" class="summary">
            {{ item.summary }}<a class="desc" :href="`./article/${item._id}`">... 阅读全文 〉</a>
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
  <div v-show="articleList.length > 0" class="clear-both overflow-hidden py-10">
    <el-pagination
      v-model:current-page="pageCurrent"
      class="float-right"
      background
      layout="prev, pager, next"
      :total="pageTotal"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { blogList } from '../http/api';
import dayjs from 'dayjs';
import { useMenuStore } from '../store/menuStore';
const menuStore = useMenuStore();

type ArrListType = {
  _id: string;
  title: string;
  date: string;
  summary: string;
  serialNumber: number;
};

const articleList = ref<ArrListType[]>([]);
const pageCurrent = ref<number>(1);
const pageTotal = ref<number>(1);

const route = useRoute();
const loading = ref<boolean>(false);

const fetchData = async () => {
  loading.value = true;
  const currentMenu = menuStore.menu.find(
    (item: { pageName: string }) => `${item.pageName}` === route.name
  );
  if (!currentMenu) return;
  const res = (await blogList({
    parentName: '博客文章',
    categoryName: currentMenu.name,
    page: pageCurrent.value,
    limit: 10
  })) as unknown as {
    list: ArrListType[];
    currentPage: number;
    totalItems: number;
  };
  articleList.value = res.list;
  pageCurrent.value = res.currentPage;
  pageTotal.value = res.totalItems;
  loading.value = false;
  // this.$ssrContext.articleListState = res.list;
};

// SSR 数据预取
onServerPrefetch(async () => {
  await fetchData();
});

onMounted(() => {
  console.log('articleList.value', articleList.value);
  pageCurrent.value = Number(sessionStorage.getItem('currentPage')) || 1;
  if ((articleList.value.length = 0)) {
    // 如果没有服务器端数据，则正常获取数据
    fetchData();
  }
  loading.value = true;
  watch(
    () => menuStore.menu,
    async (newMenu) => {
      // console.log('newMenu', newMenu);
      if (newMenu.length > 0) {
        if (articleList.value.length > 0) {
          loading.value = false;
        } else {
          await fetchData();
        }
      }
    },
    { immediate: true }
  );
});

// 在客户端，监听路由变化并重新加载数据
// watch(route, (to, from) => {
//   console.log(to.path, from.path);
//   if (to.path !== from.path) {
//     const currentMenu = menuStore.menu.find((item) => `${item.pageName}` === route.name);
//     if (currentMenu) {
//       articleStore.fetchArticles(currentMenu.name, 1, 10);
//     }
//   }
// });

const handleCurrentChange = (val: any) => {
  pageCurrent.value = val;
  sessionStorage.setItem('currentPage', val);
  fetchData();
};
</script>
