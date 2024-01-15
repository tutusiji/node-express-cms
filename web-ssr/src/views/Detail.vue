<template>
  <h3 class="articleTitle" v-html="articleDetailStore.detail.title"></h3>
  <div
    v-if="articleDetailStore.detail.dateDisplay"
    class="articleDate pb-4 text-[#999] text-center text-[14px] italic"
  >
    {{ dayjs(articleDetailStore.detail.date).format('YYYY-MM-DD ') }}
  </div>
  <div
    v-loading="articleDetailStore.loading"
    class="articleDetails"
    v-html="articleDetailStore.detail.body"
  ></div>
  <div class="otherArticle">
    <p v-if="articleDetailStore.detail.prevArticle">
      上一篇：
      <a :href="`./${articleDetailStore.detail.prevArticle._id}`">
        {{ articleDetailStore.detail.prevArticle.title }}
      </a>
    </p>
    <p v-if="articleDetailStore.detail.nextArticle">
      下一篇：
      <a :href="`./${articleDetailStore.detail.nextArticle._id}`">
        {{ articleDetailStore.detail.nextArticle.title }}
      </a>
    </p>
  </div>
  <div v-show="articleDetailStore.detail.title" class="back" @click="goBackOrHome">返回</div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import Prism from 'prismjs'; // 代码高亮插件的core
import 'prismjs/themes/prism-tomorrow.min.css'; // 高亮主题
import { useArticleDetailStore } from '../store/articleDetailStore';

const route = useRoute();
const articleDetailStore = useArticleDetailStore();

// SSR 数据预取
onServerPrefetch(async () => {
  await articleDetailStore.fetchArticleDetail(route.params.id as string);
});

onMounted(async () => {
  if (articleDetailStore.detail && articleDetailStore.detail.title) {
    Prism.highlightAll();
  } else {
    console.log('SSR 没有数据');
    await articleDetailStore.fetchArticleDetail(route.params.id as string);
  }
  // watch(
  //   () => articleDetailStore.detail,
  //   async () => {
  //     if (articleDetailStore.detail.title) {
  //       setTimeout(() => {});
  //     }
  //   },
  //   { immediate: true }
  // );
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
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  word-break: break-all;
}
.articleDetails {
  word-break: break-all;
  line-height: 1.8;
  img {
    max-width: 100%;
  }
  h3,
  h4,
  h2,
  h1,
  h5,
  h6 {
    font-weight: bold;
  }
  ul,
  ol,
  ul li,
  ol li {
    padding-left: 17px;
    list-style: decimal;
  }
}
.otherArticle{
  margin-top: 40px;
  p{
    margin-bottom: 20px;
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
pre,
code {
  font-size: 14px !important;
}
</style>
