<template>
  <section class="wrap flex">
    <nav>
      <div class="content">
        <a class="logo" href="https://www.tuziki.com">{{ siteStore.info.title }}</a>
        <ul class="menu">
          <li
            v-for="item of menuStore.menu"
            :key="item._id"
            :class="{ current: `${item.path}` === $route.path }"
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
        <router-view :key="$route.path" />
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
        getStyle();
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

const getStyle = () => {
  const parentRect = document.querySelector('.menu');
  const itemRect = document.querySelector('.current');
  if (!itemRect || !parentRect) return;

  lineWidth.value = itemRect.getBoundingClientRect().width;
  switchX.value = itemRect.getBoundingClientRect().left - parentRect.getBoundingClientRect().left;
  // console.log(lineWidth.value, switchX.value);
};

type itemType = {
  path: string;
};

const switchTabTo = async (item: itemType) => {
  if (item.path !== route.path) {
    sessionStorage.setItem('currentPage', '1');
  }
  router.push(`${item.path}`);

  router.afterEach(async () => {
    nextTick(() => {
      getStyle();
      // const currentMenu = menuStore.menu.find((item) => `${item.path}` === route.path);
      // if (currentMenu && !currentMenu.pageId) {
      //   articleStore.fetchArticles(currentMenu.name, articleStore.currentPage, 10);
      // }
    });
  });
  router.beforeEach(() => {
    articleStore.list = [];
    articleStore.currentPage = 1;
    articleStore.totalItems = 0;

    articleDetailStore.detail = {
      body: '',
      title: '',
      date: '',
      dateDisplay: false,
      prevArticle: { _id: '', title: '' },
      nextArticle: { _id: '', title: '' }
    };
  });

  // setTimeout(() => {
  //   console.log(2);
  // }, 0);

  // nextTick(() => {
  //   console.log(3);
  // }).then(() => {
  //   console.log(4);
  // });
};
</script>

<style scoped lang="scss">
@font-face {
  font-family: 'CustomFonts';
  src: url('../assets/fonts/CustomFonts.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}

.welcome {
  font-family: 'CustomFonts';
  padding: 10px;
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
    font-family: 'CustomFonts';
    text-decoration: none;
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
      font-family: 'CustomFonts';
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
header {
  position: relative;
  margin-bottom: 30px;
  background-position: 50% 68%;
  background-color: #868e96;
  background-attachment: scroll;
  position: relative;
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
    font-family: 'CustomFonts';
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
</style>

<style lang="scss">
ul.articleList {
  min-height: 200px;
  // background-color: #fafafa;

  li {
    display: flex;
    align-items: baseline;
    padding: 1.1rem 1rem;
    border-bottom: 1px solid #eee;
    &:hover {
      background-color: #fafafa;
    }
    &:active {
      background-color: #fafafa;
    }
    &:nth-last-child(1) {
      border-bottom: none;
    }
    .num {
      font-family: 'CustomFonts';
      margin-right: 1.3rem;
    }
    .info {
      flex: 1;
      display: flex;
      align-items: center;
      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        .title {
          cursor: pointer;
          line-height: 28px;
          font-size: 1.2rem;
          font-weight: bold;
          word-break: break-all;
          color: #0d6fa1; // 34538b
          font-family: 'CustomFonts';
        }
        .summary {
          font-size: 0.9rem;
          word-break: break-all;
          padding-top: 6px;
        }
        .desc {
          color: #81ccf1;
          color: #5bbded;
          // text-decoration: underline;
          font-family: 'CustomFonts';
          white-space: nowrap;
        }
      }
      .date {
        width: 3rem;
        margin-left: 2rem;
        font-size: 0.8rem;
        color: #c5c5c5;
        font-family: 'CustomFonts';
        b {
          display: block;
          text-align: right;
        }
        em {
          display: block;
          color: #666;
          font-size: 0.9rem;
          text-align: right;
        }
      }
    }
  }
}
@media screen and (max-width: 600px) {
  .wrap {
    nav .content,
    .container {
      padding: 0 10px;
    }
    header .content {
      padding: 72px 10px;
    }
    header {
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
