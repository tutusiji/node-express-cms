<template>
  <nav>
    <div class="content">
      <div class="logo">Tuziki的个人记录</div>
      <ul class="menu">
        <li>首页</li>
        <li>码字</li>
        <!-- <li>小项目</li> -->
        <li>关于</li>
      </ul>
    </div>
  </nav>
  <header class="header">
    <div class="content">
      <div class="solgen">乘风破浪 激流勇进</div>
    </div>
  </header>
  <div class="main w-full relative">

  </div>
  <footer class="flex p-[20px]">
    <div class="copyright">
      <span
        ><a href="http://beian.miit.gov.cn/" target="_blank"
          >粤ICP备14062482号</a
        >
      </span>
    </div>
  </footer>
</template>

<script lang="ts" setup>
// const canvasRef = ref(null);

</script>

<style scoped lang="scss">
nav {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  color: #fff;
  text-shadow: 0 1px 1px rgba($color: #000000, $alpha:0.8);
  .content {
    margin: 0 auto;
    max-width: 1024px;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo {
    font-size: 24px;
    font-weight: 300;
  }
  .menu {
    display: flex;
    align-items: center;
    li {
      padding: 20px;
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
  background-image: url("https://www.tuziki.com/media/images/home-bg.jpg");
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
    max-width: 1024px;
    padding: 120px 0;
  }
  .solgen {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 300;
    color: #fff;
  }
}
.main {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  .header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: #fff;
    font-size: 124px;
    background-color: #333;
  }
}
footer{
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
