<template>
  <div class="articleTitle" v-html="articleData.title"></div>
  <div
    v-if="articleData.title && articleData.dateDisplay"
    class="articleDate pb-4 text-[#999] text-center text-[14px] italic"
  >
    {{ dayjs(articleData.date).format('YYYY-MM-DD ') }}
  </div>
  <div v-loading="loading" class="articleDetails" v-html="articleData.body"></div>
  <div v-show="articleData.title" class="back" @click="goBackOrHome">返回</div>
</template>

<script lang="ts" setup>
import { getArticleDetail } from '../http/api';
import dayjs from 'dayjs';
// import Prism from 'prismjs'; // 代码高亮插件的core
import 'prismjs/themes/prism-tomorrow.min.css'; // 高亮主题
import { useMenuStore } from '../store/menuStore';

const menuStore = useMenuStore();

type DetailType = {
  body: string;
  title: string;
  date: string;
  dateDisplay: boolean;
};
const articleData = ref<DetailType>({
  body: '',
  title: '',
  date: '',
  dateDisplay: true
});
const loading = ref<boolean>(false);
const route = useRoute();
let pageId = route.params.id as string;

const fetchData = async () => {
  // 这里要检查一下是否为单页面，有木有单页pageId
  const menuObj = menuStore.menu.find((item) => `${item.path}` === route.path);
  if (menuObj && menuObj.pageId) {
    pageId = menuObj.pageId;
  }
  const res = await getArticleDetail(pageId);
  articleData.value = res as unknown as DetailType;
};

// SSR 数据预取
onServerPrefetch(async () => {
  await fetchData();
});

onMounted(async () => {
  const Prism = (await import('prismjs')).default;
  // 代码高亮，仅在客户端执行
  loading.value = true;
  nextTick(() => {
    setTimeout(() => {
      Prism.highlightAll();
      loading.value = false;
    }, 500);
  });

  watch(
    () => menuStore.menu,
    async (newMenu) => {
      if (newMenu.length > 0) {
        await fetchData();
      }
    },
    { immediate: true }
  );
});

const router = useRouter();
function goBackOrHome() {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
}
</script>

<style lang="scss">
.articleTitle {
  padding: 20px 0;
  font-weight: 700;
  text-align: center;
}
.articleDetails {
  img {
    max-width: 100%;
  }
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
// pre,code{
//   color: #333;
// }
</style>
