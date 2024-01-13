<template>
  <ul v-loading="loading" class="articleList">
    <li v-for="item of articleList" :key="item._id">
      <!-- @click="$router.push(`./detail/${item._id}`)" -->
      <span class="num text-[#c5c5c5] mr-5">No.{{ item.serialNumber }}</span>
      <div class="info">
        <div class="content">
          <div><a class="title" :href="`./detail/${item._id}`">{{ item.title }}</a></div>
          <div v-show="item.summary" class="summary">
            {{ item.summary }}
          </div>
          <!-- <a class="desc" :href="`./detail/${item._id}`">Tu</a> -->
        </div>
        <div class="date">
          <!-- HH:mm:ss -->
          <em>{{ item.date && dayjs(item.date).format('MM-DD') }}</em>
          <b>{{ item.date && dayjs(item.date).format('YYYY') }}</b>
        </div>
      </div>
    </li>
  </ul>
  <div v-show="articleList.length > 0" class="clear-both overflow-hidden py-2">
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
    (item: { path: string }) => `${item.path}` === route.path
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
};

onServerPrefetch(async () => {
  await fetchData();
});

onMounted(() => {
  loading.value = true;
  pageCurrent.value = Number(sessionStorage.getItem('currentPage')) || 1;
  watch(
    () => menuStore.menu,
    async (newMenu) => {
      console.log('newMenu', newMenu);
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

const handleCurrentChange = (val: any) => {
  pageCurrent.value = val;
  sessionStorage.setItem('currentPage', val);
  fetchData();
};
</script>
