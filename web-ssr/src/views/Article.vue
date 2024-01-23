<template>
  <h1 class="articleTitle" v-html="articleDetailStore.detail.title"></h1>
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
  setTitle(articleDetailStore.detail.title, articleDetailStore.detail.summary);
});

function createGitalk(pageId: string) {
  const gitalkContainer = document.getElementById('gitalk-container');
  if (gitalkContainer) {
    // 清除 Gitalk 容器的内容
    gitalkContainer.innerHTML = '';

    // 创建 Gitalk 实例
    const gitalk = new Gitalk({
      // Gitalk 的配置
      clientID: '62dfeca2c385cf2b645d',
      clientSecret: 'b5e2ebafc39bc5ba2982bbd96320ebd35fa75274',
      repo: 'gitalk-comment',
      owner: 'tutusiji',
      admin: ['tutusiji'],
      id: pageId, // 假设 pageId 来自路由参数
      title: articleDetailStore.detail.title, // 根据实际情况获取标题
      distractionFreeMode: false
    });

    gitalk.render('gitalk-container');
  } else {
    console.error('Gitalk 容器未找到');
  }
}

watch(
  () => route.path,
  () => {
    const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
    const pageId = currentMenu?.pageId ? currentMenu?.pageId : String(route.params.id);
    // 路由变化时重新创建 Gitalk
    createGitalk(pageId);
  }
);

// router.beforeEach((to, from, next) => {
//   if (to.meta && to.meta.title) {
//     setTitle(String(to.meta.title));
//   }
//   next();
// });

function setTitle(title: string, description: string) {
  if (typeof window !== 'undefined') {
    document.title = `${title} - Tuziki的个人记录`;
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', description || `${title} - Tuziki的个人记录`);
    }
  }
}

onMounted(async () => {
  // console.log('article===', articleStore.currentPage);
  if (articleDetailStore.detail && articleDetailStore.detail.title) {
    console.log('Detail ssr local');
    setTitle(articleDetailStore.detail.title, articleDetailStore.detail.summary);
    Prism.highlightAll();
    const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
    const pageId = currentMenu?.pageId ? currentMenu?.pageId : String(route.params.id);
    createGitalk(pageId);
  } else {
    console.log('Detail ssr reload');
    // 检查当前导航菜单是否为拥有id的单页面
    const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
    const pageId = currentMenu?.pageId ? currentMenu?.pageId : String(route.params.id);
    await articleDetailStore.fetchArticleDetail(pageId);
    setTitle(articleDetailStore.detail.title, articleDetailStore.detail.summary);
    Prism.highlightAll();
    if (articleDetailStore.detail.slotStatus) {
      router.push(`/${route.params.type}/article/${pageId}/${articleDetailStore.detail.slotName}`);
    }
    createGitalk(pageId);
  }
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
  overflow-wrap: break-word;
}
.articleDate {
  font-family: 'CustomFont';
}
.articleDetails {
  word-wrap: break-word;
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
    text-shadow: 0 1px 1px rgb(0, 0, 0, 0.8);
    line-height: 1.5;
    margin: 0 4px;
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
