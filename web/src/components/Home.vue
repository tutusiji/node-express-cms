<template>
  <ul class="list">
    <li v-for="item of list" :key="item._id">
      <b class="text-[#cdcccc] mr-5">No.{{ item.serialNumber }}</b>
      <h3 @click="$router.push(`./detail/${item._id}`)">{{ item.title }}</h3>
      <div class="date">
        <!-- HH:mm:ss -->
        {{ dayjs(item.date).format("YYYY-MM-DD") }}
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

const fetchData = async () => {
  const menu = JSON.parse(localStorage.menu);
  const route = useRoute();
  const currentMenu = menu.find(
    (item: { typeUrl: any }) => item.typeUrl === route.path.replace("/", "")
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
};
onMounted(() => {
  fetchData();
});

const handleCurrentChange = (val: any) => {
  console.log(`当前页: ${val}`);
  pageCurrent.value = val;
  fetchData();
};
</script>

<style scoped lang="scss">
.list {
  background-color: #fafafa;

  li {
    display: flex;
    align-items: center;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #eee;
    &:nth-last-child(1) {
      border-bottom: none;
    }
    b {
      font-family: cursive;
    }
    h3 {
      flex: 1;
      cursor: pointer;
      line-height: 28px;
      font-size: 18px;
      &:hover {
        text-decoration: underline;
      }
    }
    .date {
      margin-left: 1rem;
      font-size: 16px;
      font-style: italic;
      color: #868e96;
      font-family: Lora, "Times New Roman", serif;
    }
  }
}
.next {
  width: 100px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px dashed #888787;
  margin: 30px auto 30px;
  cursor: pointer;
  color: #666;
  &:hover {
    background-color: #f1f1f1;
  }
}
</style>
