<template>
  <section class="wrap flex">
    <nav>
      <div class="content">
        <div class="logo" @click="$router.push(`/`)">Tuziki的个人记录</div>
        <ul class="menu">
          <li
            v-for="item of menuStore.menu"
            :key="item._id"
            :class="{ current: `${item.pageName}` === $route.name }"
            @click="switchTabTo(item)"
          >
            {{ item.name }}
          </li>
          <div
            class="linebg"
            :style="{
              transform: `translateX(${switchX}px)`,
              width: `${lineWidth}px`,
            }"
          ></div>
        </ul>
      </div>
    </nav>
    <header class="header">
      <div class="content">
        <div class="solgen">乘风破浪 激流勇进</div>
      </div>
    </header>
    <div class="main">
      <div class="container">
        <div class="welcome p-[10px] text-[15px]" v-if="$route.path === '/'">
          你好！欢迎来Tuziki !
        </div>
        <router-view :key="$route.path"></router-view>
      </div>
    </div>
    <footer class="flex p-[20px]">
      <div class="copyright">
        <!-- <p>make by node express mongodb vue3 vite tailwind</p> -->
        <p>make by expressjs</p>
        <span
          ><a href="http://beian.miit.gov.cn/" target="_blank"
            >粤ICP备14062482号</a
          >
        </span>
      </div>
    </footer>
  </section>
</template>

<script lang="ts" setup>
import { useMenuStore } from "../store/menuStore";
const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();

onMounted(() => {
  menuStore.fetchMenu();
});

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

const switchX = ref<Number>(0);
const lineWidth = ref<Number>(75);

const getMenuStyle = () => {
  const parentRect = document.querySelector(".menu");
  const itemRect = document.querySelector(".current");
  if (!itemRect || !parentRect) return;

  lineWidth.value = itemRect.getBoundingClientRect().width;
  switchX.value =
    itemRect.getBoundingClientRect().left -
    parentRect.getBoundingClientRect().left;
  // console.log(lineWidth.value, switchX.value);
};

type itemType = {
  pageName: String;
};

const switchTabTo = (item: itemType) => {
  if (item.pageName !== route.name) {
    sessionStorage.setItem("currentPage", "1");
  }

  router.push(`/${item.pageName}`);

  // setTimeout(() => {
  //   console.log(2);
  // }, 0);

  // nextTick(() => {
  //   console.log(3);
  // }).then(() => {
  //   console.log(4);
  // });
};
router.afterEach(() => {
  nextTick(() => {
    getMenuStyle();
    // console.log(1);
  });
});
</script>

<style scoped lang="scss">
@font-face {
  font-family: "TencentSansW7";
  src: url("../assets/fonts/TencentSansW7.eot"); /* IE9 */
  src: url("../assets/fonts/TencentSansW7.eot?#iefix")
      format("embedded-opentype"),
    /* IE6-IE8 */ url("../assets/fonts/TencentSansW7.woff") format("woff"),
    /* chrome、firefox */ url("../assets/fonts/TencentSansW7.ttf")
      format("truetype"),
    /* chrome、firefox、opera、Safari, Android, iOS 4.2+ */
      url("../assets/fonts/TencentSansW7.svg#TencentSansW7") format("svg"); /* iOS 4.1- */
  font-style: normal;
  font-weight: normal;
}

.welcome {
  font-family: "TencentSansW7";
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
  color: #fff;
  text-shadow: 0 1px 1px rgba($color: #000000, $alpha: 0.8);
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
    font-weight: 500;
    cursor: pointer;
    font-family: "TencentSansW7";
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
      font-family: "TencentSansW7";
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
  background-image: url("//hkroom.oss-cn-shenzhen.aliyuncs.com/bg.jpg");
  background-repeat: no-repeat;
  &::before {
    content: "";
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
    padding: 0 20px;
    padding: 100px 0;
  }
  .solgen {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 300;
    color: #fff;
    text-shadow: 0 1px 1px rgba($color: #000000, $alpha: 0.8);
    font-family: "TencentSansW7";
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
  background-color: #fafafa;

  li {
    display: flex;
    align-items: center;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #eee;
    &:active {
      background-color: #fff;
    }
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
      font-size: 1rem;
      &:hover {
        text-decoration: underline;
      }
    }
    .date {
      margin-left: 0.8rem;
      font-size: 0.8rem;
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
