<template>
  <section class="wrap min-h-[100vh] flex flex-col">
    <nav :class="['nav', isFixed && 'isFixed']">
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
    <header
      class="header relative mb-4 bg-scroll"
      :style="`background-image:url(${siteStore.info.banner});background-position: 50% 68%;background-color: #868e96;background-size: cover;background-repeat: no-repeat;`"
    >
      <div class="content">
        <div class="slogan">{{ siteStore.info.slogan }}</div>
      </div>
    </header>
    <div class="main flex-1">
      <div class="container">
        <!-- v-if="$route.path === '/'" -->
        <div class="welcome">{{ siteStore.info.welcome }}</div>
        <router-view :key="route.fullPath" />
        <div :class="['gotop', isFixed && 'isFixed']" @click="goTop">返回顶部←</div>
      </div>
    </div>
    <footer class="flex p-[20px]">
      <div class="copyright">
        <!-- <p>make by node express mongodb vue3 vite tailwind</p> -->
        <p>{{ siteStore.info.coryright }}</p>
        <span
          ><a href="http://beian.miit.gov.cn/" target="_blank">{{ siteStore.info.beian }}</a></span
        >
      </div>
    </footer>
  </section>
</template>

<script lang="ts" setup>
import { useMenuStore } from '../store/menuStore';
import { useSiteStore } from '../store/siteStore';
import { useArticleDetailStore } from '../store/articleDetailStore';
import { useArticleStore } from '../store/artcleStore';
import { useTagStore } from '../store/tagStore';
import { useAdStore } from '../store/adStore';
const adStore = useAdStore();
const tagStore = useTagStore();
const articleDetailStore = useArticleDetailStore();
const articleStore = useArticleStore();
const menuStore = useMenuStore();
const siteStore = useSiteStore();
const route = useRoute();
const router = useRouter();

onServerPrefetch(async () => {
  await siteStore.fetchSiteInfo();
  await menuStore.fetchMenu();
  await adStore.fetchAds();
  await tagStore.fetchTags();
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
  // console.log('窗口大小改变了！');
};

function debounce(func: any, wait: number) {
  let timeout: any;

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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

const getMenuStyleDebounced = debounce(() => getMenuStyle(), 200);

const isFixed = ref(false);

const handleScroll = () => {
  isFixed.value = window.scrollY > 240;
};

onMounted(async () => {
  const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (faviconLink && siteStore.info.icon) {
    faviconLink.href = siteStore.info.icon;
  }
  window.addEventListener('resize', getMenuStyleDebounced);
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('resize', getMenuStyleDebounced);
  window.removeEventListener('scroll', handleScroll);
});

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
      author: '',
      slotStatus: false,
      single: false,
      categories: [],
      tags: [],
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
});

const goTop = () => {
  window.scrollTo({
    top: 0, // 滚动到页面的顶部
    behavior: 'smooth' // 平滑滚动
  });
};
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

$screenW: 1200px;

.nav {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  &.isFixed {
    position: fixed;
    background: linear-gradient(to bottom, rgba(2, 28, 41, 0.7), transparent);
    backdrop-filter: blur(5px);
    .linebg {
      bottom: 4px;
    }
  }

  .content {
    margin: 0 auto;
    max-width: $screenW;
    padding: 0 20px;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.5rem;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    font-family: 'CustomFont';
    text-decoration: none;
    text-shadow: 0 1px 2px rgba($color: #000, $alpha: 0.8);

    // &::selection {
    //   text-shadow: 0 1px 1px rgba($color: #fff, $alpha: 0.8);
    //   background-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);
    //   color: transparent;
    //   -webkit-background-clip: text;
    //   background-clip: text;
    //   -webkit-text-fill-color: transparent;
    // }
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
  // position: relative;
  // margin-bottom: 16px;
  // background-position: 50% 68%;
  // background-color: #868e96;
  // background-attachment: scroll;
  // background-size: cover;
  // // background-image: url('//hkroom.oss-cn-shenzhen.aliyuncs.com/bg.jpg');
  // background-repeat: no-repeat;
  mask-image: linear-gradient(to bottom, rgb(0 0 0) 52%, rgba(0, 0, 0, 0) 100%);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #686868;
    opacity: 0.35;
    // filter: blur(10px);
  }

  .content {
    margin: 0 auto;
    max-width: $screenW;
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
    // border-bottom: 2px solid rgb(255 255 255 / 80%);
    // width: 230px;
    // margin: 0 auto;
    // padding-bottom: 10px;
  }
}

.container {
  margin: 0 auto;
  max-width: $screenW;
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
  position: fixed;
  right: 30px;
  // transform: translate(570px, 0);
  bottom: 50px;
  writing-mode: vertical-rl;
  cursor: pointer;
  font-family: 'CustomFont';
  opacity: 0;
  transition: all 0.3s ease-in;
  &.isFixed {
    opacity: 1;
    transform: translate(0, -20px);
  }
  &::selection {
    background-color: transparent;
    /* 背景色透明 */
    color: inherit;
    /* 文字颜色保持不变 */
  }
}
.tags {
  font-family: 'CustomFont';
  &.tagSider {
    font-family: 'CustomFont';
    h3 {
      margin-bottom: 10px;
    }
  }
  &.tagMain {
    font-family: 'CustomFont';
    margin-top: 40px;
    h3 {
      display: inline-block;
    }
  }
  .tagItem {
    display: inline-block;
    padding: 0 8px;
    height: 26px;
    line-height: 26px;
    font-size: 0.9rem;
    color: #666;
    border: 1px solid #cdcdcd;
    margin: 0 10px 10px 0;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
    text-decoration: none;
    &:hover {
      color: #0d6fa1;
      border: 1px solid #0d6fa1;
    }
    &:active {
      color: #0d6fa1;
      background-color: #ebebeb;
    }
  }
}

@media screen and (max-width: 1200px) {
  .gotop {
    display: none;
  }
}
@media screen and (max-width: 1024px) {
  .wrap {
    .nav .content,
    .container {
      padding: 0 10px;
    }
    .nav.isFixed {
      .linebg {
        bottom: -2px;
      }
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

    .articleList {
      li {
        padding: 10px 0;
        align-items: baseline;

        .info {
          // display: block;
          flex-direction: column;
          .content {
            .tags {
              margin-bottom: -10px;
            }
            .coverImage {
              float: none;
              margin-left: 0;
              width: 100%;
              height: 168px;
            }
          }
          .date {
            width: 100%;
            display: flex;
            flex-direction: row-reverse;
            justify-content: flex-start;
            margin-top: 16px;
            margin-left: 0;
            b {
              display: inline;
              font-size: 0.9rem;
              margin-right: 0.3rem;
            }

            em {
              display: inline;
              font-size: 0.9rem;
            }
          }
        }
      }
    }
  }
}
.tagMain {
  display: none;
}
@media screen and (max-width: 800px) {
  .nav .logo {
    font-size: 1.4rem;
  }
  .main {
    .homepage {
      flex-direction: column-reverse;
      .sidebar {
        width: 100%;
        margin-left: 0;
        .cospa {
          margin-left: 4px;
          // .tips{
          //   left: 35px;
          // }
        }
      }
    }
  }
  .tagSider {
    display: none;
  }
  .tagMain {
    display: block;
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
