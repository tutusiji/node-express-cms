<template>
  <ul class="articleList" v-loading="loading">
    <li v-for="item of articleList" :key="item._id" @click="$router.push(`./article/${item._id}`)">
      <b class="text-[#cdcccc] mr-5">No.{{ item.serialNumber }}</b>
      <h3>{{ item.title }}</h3>
      <div class="date">
        <!-- HH:mm:ss -->
        {{ item.date && dayjs(item.date).format("YYYY-MM-DD") }}
      </div>
    </li>
  </ul>
  <div class="clear-both overflow-hidden py-2" v-show="articleList.length > 0">
    <el-pagination
      class="float-right"
      background
      layout="prev, pager, next"
      v-model:current-page="pageCurrent"
      @current-change="handleCurrentChange"
      :total="pageTotal"
    >
    </el-pagination>
  </div>
</template>

<script lang="ts" setup>
import { blogList } from "../http/api";
import dayjs from "dayjs";
import { useMenuStore } from "../store/menuStore";
const menuStore = useMenuStore();

type ArrListType = {
  _id: string;
  title: string;
  date: string;
  serialNumber: number;
};

const articleList = ref<ArrListType[]>([]);
const pageCurrent = ref<number>(1);
const pageTotal = ref<number>(1);
pageCurrent.value = Number(sessionStorage.getItem('currentPage')) || 1

const route = useRoute();
const loading = ref<Boolean>(false);

const fetchData = async () => {
  loading.value = true;
  const currentMenu = menuStore.menu.find(
    (item: { path: string }) => `${item.path}` === route.path
  );
  if (!currentMenu) return;
  const res = (await blogList({
    parentName: "博客文章",
    categoryName: currentMenu.name,
    page: pageCurrent.value,
    limit: 10,
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

watch(
  () => menuStore.menu,
  async (newMenu) => {
    if (newMenu.length > 0) {
      await fetchData();
    }
  },
  { immediate: true }
);

// onMounted(()=>{
  
// })

const handleCurrentChange = (val: any) => {
  pageCurrent.value = val;
  sessionStorage.setItem("currentPage", val);
  fetchData();
};
</script>
