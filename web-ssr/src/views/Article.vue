<template>
  <h1 class="articleTitle" v-html="articleDetailStore.detail.title"></h1>
  <!-- <div v-if="articleDetailStore.detail?.summary" class="text-[#666]">
    {{ articleDetailStore.detail?.summary }}
  </div> -->
  <div class="flex items-center justify-center pb-4 text-[14px] text-[#999] articleDate">
    <span v-if="articleDetailStore.detail?.author" class="mr-4">
      作者：{{ articleDetailStore.detail?.author }}
    </span>
    <span v-if="articleDetailStore.detail.dateDisplay">
      日期：{{ dayjs(articleDetailStore.detail.date).format('YYYY-MM-DD ') }}
    </span>
  </div>
  <!-- 异步组件，用来加载工程插件 -->
  <component :is="currentSlotComponent" v-if="shouldRenderAsyncComponent" />
  <div
    v-loading="articleDetailStore.loading"
    class="articleDetails"
    v-html="articleDetailStore.detail.body"
  ></div>
  <div v-if="articleDetailStore.detail.tags?.length" class="tags mt-10">
    <span>标签：</span>
    <a
      v-for="tag in articleDetailStore.detail.tags"
      :key="tag._id"
      class="tagItem"
      :href="`/coder/1?tag=${tag.name}`"
      @click.prevent="router.push(`/coder/1?tag=${tag.name}`)"
    >
      {{ tag.name }}
    </a>
  </div>
  <template v-if="articleDetailStore.detail.title && !articleDetailStore.detail.single">
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
import { useSiteStore } from '../store/siteStore';
const siteStore = useSiteStore();
const articleStore = useArticleStore();
const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();
const shouldRenderAsyncComponent = ref(true);

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

// 设置文章标题
function setTitle(title: string, description: string) {
  if (typeof window !== 'undefined') {
    document.title = `${title} - ${siteStore.info.title}`;
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', description || `${title} - ${siteStore.info.title}`);
    }
  }
}

onMounted(async () => {
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
    createGitalk(pageId);
  }
});

// 使用异步组件 加载功能插件
const currentSlotComponent = computed(() => {
  if (articleDetailStore.detail.slotStatus) {
    return defineAsyncComponent(() =>
      import(`./Tools/${articleDetailStore.detail.slotName}.vue`).catch((error: any) => {
        console.error(`${articleDetailStore.detail.slotName} 组件加载失败:`, error);
      })
    );
  }
  return null;
});

onUnmounted(() => {
  shouldRenderAsyncComponent.value = false;
});
</script>

<style lang="scss">
.articleTitle {
  font-family: 'CustomFont';
  padding: 20px 0;
  font-size: 1.4rem;
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
    padding: 3px 7px;
    border-radius: 0.3em;
    font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  }
  a {
    text-decoration: underline;
  }
  .ql-align-center {
    text-align: center;
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
