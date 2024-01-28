<template>
  <section class="wrap flex">
    <nav>
      <div class="content">
        <a class="logo" href="https://www.tuziki.com">{{ siteStore.info.title }}</a>
        <ul class="menu">
          <li
            v-for="item of menuStore.menu"
            :key="item._id"
            :class="{
              current: item.pageName === (route.params.id ? route.params.type : route.name)
            }"
            @click="switchTabTo(item)"
          >
            {{ item.name }}
          </li>
          <div
            class="linebg"
            :style="{
              transform: `translateX(${switchX}px)`,
              width: `${lineWidth}px`
            }"
          ></div>
        </ul>
      </div>
    </nav>
    <header class="header" :style="`background-image:url(${siteStore.info.banner});`">
      <div class="content">
        <div class="slogan">{{ siteStore.info.slogan }}</div>
      </div>
    </header>
    <div class="main">
      <div class="container">
        <!-- v-if="$route.path === '/'" -->
        <div class="welcome">{{ siteStore.info.welcome }}</div>
        <router-view :key="route.fullPath" />
      </div>
    </div>
    <footer class="flex p-[20px]">
      <div class="copyright">
        <!-- <p>make by node express mongodb vue3 vite tailwind</p> -->
        <p>{{ siteStore.info.coryright }}</p>
        <span
          ><a href="http://beian.miit.gov.cn/" target="_blank">{{ siteStore.info.beian }}</a>
        </span>
      </div>
    </footer>
  </section>
</template>

<script lang="ts" setup>
import { useMenuStore } from '../store/menuStore';
import { useSiteStore } from '../store/siteStore';
import { useArticleDetailStore } from '../store/articleDetailStore';
const articleDetailStore = useArticleDetailStore();
import { useArticleStore } from '../store/artcleStore';
const articleStore = useArticleStore();
const menuStore = useMenuStore();
const siteStore = useSiteStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  watch(
    () => menuStore.menu,
    async (newMenu) => {
      if (newMenu.length > 0) {
        await nextTick();
        getMenuStyle();
      }
    },
    { immediate: true }
  );
  const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;

  if (faviconLink && siteStore.info.icon) {
    faviconLink.href = siteStore.info.icon;
  }
});

onServerPrefetch(async () => {
  await siteStore.fetchSiteInfo();
  await menuStore.fetchMenu();
});

const switchX = ref<number>(0);
const lineWidth = ref<number>(75);

const getMenuStyle = () => {
  const parentRect = document.querySelector('.menu');
  const itemRect = document.querySelector('.current');
  if (!itemRect || !parentRect) return;

  lineWidth.value = itemRect.getBoundingClientRect().width;
  switchX.value = itemRect.getBoundingClientRect().left - parentRect.getBoundingClientRect().left;
  // console.log(lineWidth.value, switchX.value);
};

type itemType = {
  pageName: string;
  pageId: string;
  name: string;
};

const switchTabTo = async (item: itemType) => {
  router.push(`/${item.pageName}${item.pageId ? '' : '/1'}`);
  // 检查当前导航菜单是否为拥有id的单页面 list重置页码
  if (!item.pageId) {
    articleStore.currentPage = 1;
    articleStore.totalItems = 0;
  }
};

// 重置store数据
router.beforeEach((to) => {
  // 重置列表pinia
  if (to.meta.type === 'list') {
    console.log('重置list');
    articleStore.list = [];
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', document.title);
    }
  }
  // 重置详情pinia
  if (to.meta.type === 'article') {
    articleDetailStore.detail = {
      body: '',
      title: '',
      date: '',
      slotName: '',
      summary: '',
      slotStatus: false,
      categories: [],
      dateDisplay: false,
      prevArticle: { _id: '', title: '' },
      nextArticle: { _id: '', title: '' }
    };
  }
});
// 重新计算导航菜单样式
router.afterEach(() => {
  nextTick(() => {
    getMenuStyle();
  });
  // console.log('after currentPage', articleStore.currentPage);
});
</script>

<style lang="scss">
@font-face {
  font-family: 'CustomFont';
  src: url('../assets/fonts/CustomFont.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}

.welcome {
  font-family: 'CustomFont';
  padding: 10px 0;
}

.wrap {
  min-height: 100vh;
  flex-direction: column;

  .main {
    flex: 1;
  }
}

nav {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;

  .content {
    margin: 0 auto;
    max-width: 1064px;
    padding: 0 20px;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.1rem;
    color: #fff;
    text-shadow: 0 1px 1px rgba($color: #000000, $alpha: 0.8);
    font-weight: 500;
    cursor: pointer;
    font-family: 'CustomFont';
    text-decoration: none;
    &:hover {
      color: #fff;
      text-decoration: none;
    }
  }

  .menu {
    display: flex;
    align-items: center;
    position: relative;

    li {
      cursor: pointer;
      white-space: nowrap;
      padding: 1rem;
      font-size: 0.9rem;
      font-family: 'CustomFont';
      color: #fff;
      text-shadow: 0 1px 1px rgba($color: #000000, $alpha: 0.8);

      &.current {
        // border-bottom: 1px solid rgba($color: #000000, $alpha: 0.8);
      }
    }
  }

  .linebg {
    position: absolute;
    left: 0;
    width: 92px;
    height: 1px;
    bottom: 0;
    background: rgba($color: #000000, $alpha: 0.8);
    transition: all 200ms ease-in;
    // border-radius: 100%;
  }
}

.header {
  position: relative;
  margin-bottom: 16px;
  background-position: 50% 68%;
  background-color: #868e96;
  background-attachment: scroll;
  background-size: cover;
  // background-image: url('//hkroom.oss-cn-shenzhen.aliyuncs.com/bg.jpg');
  background-repeat: no-repeat;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #31373d;
    opacity: 0.5;
    // filter: blur(10px);
  }

  .content {
    margin: 0 auto;
    max-width: 1064px;
    padding: 100px 0;
  }

  .slogan {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 300;
    color: #fff;
    text-shadow: 0 1px 1px rgba($color: #000000, $alpha: 0.8);
    font-family: 'CustomFont';
  }
}

.container {
  margin: 0 auto;
  max-width: 1064px;
  padding: 0 20px;
}

footer {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  text-align: center;
  color: #999;
  font-weight: 300;

  a {
    font-weight: 300;
  }
}

.gotop {
  cursor: pointer;
  font-family: 'CustomFont';

  &::selection {
    background-color: transparent;
    /* 背景色透明 */
    color: inherit;
    /* 文字颜色保持不变 */
  }
}

@media screen and (max-width: 1024px) {
  .wrap {
    nav .content,
    .container {
      padding: 0 10px;
    }

    .header .content {
      padding: 72px 10px;
    }

    .header {
      margin-bottom: 10px;
    }

    .welcome {
      padding: 10px 0;
    }

    nav .menu li {
      padding: 0.7rem;
    }

    ul.articleList {
      li {
        padding: 10px 0;
        align-items: baseline;

        .num {
          margin-right: 0.8rem;
        }

        .info {
          display: block;

          .date {
            width: auto;
            margin-top: 8px;
            margin-left: 0;

            b {
              display: inline;
              float: left;
              text-indent: 0;
              margin-right: 10px;
              font-size: 0.9rem;
            }

            em {
              display: inline;
              color: #c5c5c5;
              font-size: 0.9rem;
            }
          }
        }
      }
    }
  }
}
@media screen and (max-width: 800px) {
  .main {
  .homepage {
    flex-direction: column-reverse;
    .sidebar{
      width: 100%;
      margin-left: 0;
    }
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
