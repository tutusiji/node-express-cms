<template>
  <h3 class="articleTitle" v-html="articleDetailStore.detail.title"></h3>
  <div
    v-if="articleDetailStore.detail.dateDisplay"
    class="articleDate pb-4 text-[#999] text-center text-[15px] italic"
  >
    {{ dayjs(articleDetailStore.detail.date).format('YYYY-MM-DD ') }}
  </div>
  <router-view v-if="articleDetailStore.detail.slotStatus" :key="$route.path" />
  <div
    v-loading="articleDetailStore.loading"
    class="articleDetails"
    v-html="articleDetailStore.detail.body"
  ></div>
  <template v-if="articleDetailStore.detail.title">
    <div v-if="route.params.id" class="otherArticle">
      <p v-if="articleDetailStore.detail.prevArticle">
        上一篇：
        <a
          :href="`./${articleDetailStore.detail.prevArticle._id}`"
          @click.prevent="
            router.push(
              `/${route.params.type}/article/${articleDetailStore.detail.prevArticle._id}`
            )
          "
        >
          {{ articleDetailStore.detail.prevArticle.title }}
        </a>
      </p>
      <p v-if="articleDetailStore.detail.nextArticle">
        下一篇：
        <a
          :href="`./${articleDetailStore.detail.nextArticle._id}`"
          @click.prevent="
            router.push(
              `/${route.params.type}/article/${articleDetailStore.detail.nextArticle._id}`
            )
          "
        >
          {{ articleDetailStore.detail.nextArticle.title }}
        </a>
      </p>
    </div>
    <div
      v-if="route.params.id"
      class="back"
      @click="router.push(`/${route.params.type}/${articleStore.currentPage}`)"
    >
      返回列表
    </div>
    <div v-else class="back" @click="router.push(`/`)">返回首页</div>
  </template>
  <div id="gitalk-container"></div>
</template>

<script lang="ts" setup>
import Prism from 'prismjs'; // 代码高亮插件的core
import dayjs from 'dayjs';
import 'prismjs/themes/prism-tomorrow.min.css'; // 高亮主题
import Gitalk from 'gitalk';
import 'gitalk/dist/gitalk.css';
import { useArticleDetailStore } from '../store/articleDetailStore';
const articleDetailStore = useArticleDetailStore();
import { useMenuStore } from '../store/menuStore';
import { useArticleStore } from '../store/artcleStore';
const articleStore = useArticleStore();
const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();

// SSR 数据预取
onServerPrefetch(async () => {
  // 检查当前导航菜单是否为拥有id的单页面
  const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
  const pageId = currentMenu?.pageId ? currentMenu?.pageId : String(route.params.id);
  await articleDetailStore.fetchArticleDetail(pageId);
});

onMounted(async () => {
  // console.log('article===', articleStore.currentPage);
  let pageId = '';
  if (articleDetailStore.detail && articleDetailStore.detail.title) {
    Prism.highlightAll();
    console.log('Detail ssr local');
  } else {
    console.log('Detail ssr reload');
    // 检查当前导航菜单是否为拥有id的单页面
    const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
    pageId = currentMenu?.pageId ? currentMenu?.pageId : String(route.params.id);
    await articleDetailStore.fetchArticleDetail(pageId);
    Prism.highlightAll();
    if (articleDetailStore.detail.slotStatus) {
      router.push(`/${route.params.type}/article/${pageId}/${articleDetailStore.detail.slotName}`);
    }
  }
  const gitalk = new Gitalk({
    clientID: '62dfeca2c385cf2b645d', // GitHub Application Client ID
    clientSecret: 'b5e2ebafc39bc5ba2982bbd96320ebd35fa75274', // GitHub Application Client Secret
    repo: 'gitalk-comment', // 存放评论的仓库
    owner: 'tutusiji', // 仓库的创建者，
    admin: ['tutusiji'], // 如果仓库有多个人可以操作，那么在这里以数组形式写出
    id:pageId, // 用于标记评论是哪个页面的，确保唯一，并且长度小于50
    title:articleDetailStore.detail.title, // 页面标题
    distractionFreeMode: false
  });
  gitalk.render('gitalk-container'); // 渲染Gitalk评论组件

});
</script>

<style lang="scss">
.articleTitle {
  font-family: 'CustomFont';
  padding: 20px 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  word-wrap: break-word;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.articleDate {
  font-family: 'CustomFont';
}
.articleDetails {
  word-wrap: break-word;
  word-break: keep-all;
  overflow-wrap: break-word;
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
  h1 {
    font-size: 22px;
  }
  h2 {
    font-size: 20px;
  }
  h3 {
    font-size: 18px;
  }
  h4 {
    font-size: 16px;
  }

  ul,
  ol,
  ul li,
  ol li {
    padding-left: 17px;
    list-style: decimal;
  }
  pre,
  code {
    font-size: 14px !important;
  }
  code:not(.language-js) {
    background-color: #3e3e3e !important;
    color: rgb(240, 141, 73) !important;
    line-height: 1.5;
    margin: 0 5px;
    padding: 3px 8px;
    border-radius: 0.3em;
    font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  }
}
.otherArticle {
  margin-top: 40px;
  p {
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
</style>
