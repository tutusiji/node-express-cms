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
            @click="$router.push(`/${item.typeUrl}`)"
          >
            {{ item.name }}
          </li>
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
          你好！欢迎来Tuziki！
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
    localStorage.menu = JSON.stringify(res)
  } catch (error) {
    console.error(error.message);
  }
};
fetchMenu();
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
    font-size: 1.3rem;
    font-weight: 500;
    cursor: pointer;
    // font-family: cursive;
  }
  .menu {
    display: flex;
    align-items: center;

    li {
      cursor: pointer;
      white-space: nowrap;
      padding: 1rem;
      font-size: 0.9rem;
      &.current {
        border-bottom: 1px solid rgba($color: #000000, $alpha: 0.8);
      }
    }
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
