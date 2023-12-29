<template>
  <ul class="list" v-loading="loading">
    <li v-for="item of list" :key="item._id">
      <b class="text-[#cdcccc] mr-5">No.{{ item.serialNumber }}</b>
      <h3 @click="$router.push(`./detail/${item._id}`)">{{ item.title }}</h3>
      <div class="date">
        <!-- HH:mm:ss -->
        {{ item.date && dayjs(item.date).format("YYYY-MM-DD") }}
      </div>
    </li>
  </ul>
  <div class="clear-both overflow-hidden py-2">
    <el-pagination
      class="float-right"
      background
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
      :total="pageTotal"
    >
    </el-pagination>
  </div>
</template>

<script lang="ts" setup>
import { blogList } from "../http/api";
import dayjs from "dayjs";

type ArrListType = {
  _id: String;
  title: String;
  date: String;
  serialNumber: Number;
};

const list = ref<ArrListType[]>([]);
const pageCurrent = ref<Number>(1);
const pageTotal = ref<Number>(1);

interface ArrMenuListType {
  _id: string;
  name: string;
  typeUrl: string;
}
const menu = ref<ArrMenuListType[]>([]);

const route = useRoute(); // 用于接收路由参数的
const loading = ref<Boolean>(false);

const fetchData = async () => {
  loading.value = true
  const currentMenu = menu.value.find(
    (item: { typeUrl: String }) => `/${item.typeUrl}` === route.path
  );
  const res = await blogList({
    parentName: "博客文章",
    categoryName: currentMenu.name,
    page: pageCurrent.value,
    limit: 10,
  });
  list.value = res.list;
  pageCurrent.value = Number(res.currentPage);
  pageTotal.value = Number(res.totalItems);
  loading.value = false
};

// watch(menu, (newValue, oldValue) => {
//   console.log("watch 已触发", newValue);
// });

const timer = setInterval(() => {
  if (localStorage.menu) {
    menu.value = JSON.parse(localStorage.menu);
    if (menu.value.length > 0) {
      fetchData();
      clearInterval(timer);
    }
  }
}, 200);

onMounted(() => {});

const handleCurrentChange = (val: any) => {
  console.log(`当前页: ${val}`);
  pageCurrent.value = val;
  fetchData();
};
</script>
