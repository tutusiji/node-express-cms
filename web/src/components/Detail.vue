<template>
  <div class="articleTitle" v-html="articleData.title"></div>
  <div
    class="articleDate pb-4 text-[#999] text-center text-[14px] italic"
    v-if="articleData.title && articleData.dateDisplay"
  >
    {{ dayjs(articleData.date).format("YYYY-MM-DD ") }}
  </div>
  <div
    class="articleDetails"
    v-html="articleData.body"
    v-loading="loading"
  ></div>
  <!-- <highlightjs autodetect :code="articles" /> -->
  <div class="back" @click="$router.go(-1)" v-show="articleData.title">
    返回
  </div>
</template>

<script lang="ts" setup>
import { getArticleDetail } from "../http/api";
import dayjs from "dayjs";
import { useMenuStore } from "../store/menuStore";
const menuStore = useMenuStore();

type DetailType = {
  body: string;
  title: string;
  date: string;
  dateDisplay: boolean;
};
const articleData = ref<DetailType>({
  body: "",
  title: "",
  date: "",
  dateDisplay: true,
});
const loading = ref<Boolean>(false);
const route = useRoute();
let pageId = route.params.id as string;

const fetchData = async () => {
  loading.value = true;
  // 这里要检查一下是否为单页面，有木有单页pageId
  const menuObj = menuStore.menu.find((item) => `${item.path}` === route.path);
  if (menuObj && menuObj.pageId) {
    pageId = menuObj.pageId;
  }
  const res = await getArticleDetail(pageId);
  articleData.value = res as unknown as DetailType;
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

onMounted(() => {
  // fetchData();
});
</script>

<style lang="scss">
.articleTitle {
  padding: 20px 0;
  font-weight: 700;
  text-align: center;
}
.back {
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
pre {
  margin: 0.4rem 0;
  padding: 0.8rem;
  background-color: #000;
  color: #d7d5d5;
  overflow: auto;
}
</style>
