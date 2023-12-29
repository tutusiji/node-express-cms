<template>
  <section class="wrap flex">
    <nav>
      <div class="content">
        <div class="logo" @click="$router.push(`/`)">Tuziki的个人记录</div>
        <ul class="menu">
          <li
            v-for="item of menu"
            :key="item._id"
            :class="{ current: `/${item.typeUrl}` === $route.path }"
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
        <div class="p-[10px] text-[14px]" v-if="$route.path === '/'">
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
import { blogMenu } from "../http/api";

interface ArrMenuListType {
  _id: string;
  name: string;
  typeUrl: string;
}
const menu = ref<ArrMenuListType[]>([]);
// localStorage.menu = {}
const fetchMenu = async () => {
  try {
    const res = await blogMenu({
      parentName: "博客文章",
    });
    menu.value = res;
    localStorage.menu = JSON.stringify(res);

    nextTick(() => {
      getStyle();
    });
  } catch (error) {
    console.error(error.message);
  }
};
fetchMenu();

const switchX = ref<Number>(0);
const lineWidth = ref<Number>(75);

const getStyle = () => {
  const parentRect = document.querySelector(".menu").getBoundingClientRect();
  const itemRect = document.querySelector(".current").getBoundingClientRect();

  lineWidth.value = itemRect.width;
  switchX.value = itemRect.left - parentRect.left;
  // console.log(lineWidth.value, switchX.value);
};

const router = useRouter();
const switchTabTo = (item) => {
  router.push(`/${item.typeUrl}`);
  router.afterEach(() => {
    // 确保是从特定路由跳转来的
    nextTick(() => {
      getStyle();
      // console.log(1);
    });
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

onMounted(() => {});
</script>

<style scoped lang="scss">
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
    // font-family: cursive;
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
    border-radius: 100%;
  }
}
header {
  position: relative;
  margin-bottom: 30px;
  background: no-repeat center center;
  background-color: #868e96;
  background-attachment: scroll;
  position: relative;
  background-size: cover;
  background-image: url("../assets/bg.jpg");
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
.list {
  background-color: #fafafa;

  li {
    display: flex;
    align-items: center;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid #eee;
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
