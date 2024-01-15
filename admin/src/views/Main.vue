<template>
  <el-container style="border: 1px solid #eee;height: 100vh">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <!-- :default-openeds="['1']" -->
      <el-menu
        router
        unique-opened
        :default-active="$route.path"
      >
        <el-submenu index="1">
          <template slot="title"
            ><i class="el-icon-message"></i>内容管理</template
          >
          <el-menu-item-group>
            <template slot="title"><h3 class="subtitle">人物</h3></template>
            <el-menu-item index="/items/create">新建人物</el-menu-item>
            <el-menu-item index="/items/list">人物列表</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <template slot="title"><h3 class="subtitle">专题</h3></template>
            <el-menu-item index="/heroes/create">新建专题</el-menu-item>
            <el-menu-item index="/heroes/list">专题列表</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <template slot="title"><h3 class="subtitle">文章</h3></template>
            <el-menu-item index="/articles/create">新建文章</el-menu-item>
            <el-menu-item index="/articles/list">文章列表</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title"><i class="el-icon-date"></i>运营管理</template>
          <el-menu-item-group>
            <template slot="title"><h3 class="subtitle">广告位</h3></template>
            <el-menu-item index="/ads/create">新建广告位</el-menu-item>
            <el-menu-item index="/ads/list">广告位列表</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title"
          ><i class="el-icon-setting"></i>系统设置</template
          >
          <el-menu-item-group>
            <template slot="title"><h3 class="subtitle">分类</h3></template>
            <el-menu-item index="/Categories/create">新建分类</el-menu-item>
            <el-menu-item index="/Categories/list">分类列表</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <template slot="title"><h3 class="subtitle">管理员</h3></template>
            <el-menu-item index="/admin_users/create">新建管理员</el-menu-item>
            <el-menu-item index="/admin_users/list">管理员列表</el-menu-item>
            <el-menu-item index="/fontsManage">字体管理</el-menu-item>
            <el-menu-item index="/siteManage">站点管理</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-dropdown>
          <i class="el-icon-setting" style="margin-right: 15px"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item><span @click="logout">退出</span></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span>{{ username }}</span>
      </el-header>

      <el-main>
        <router-view :key="$route.path"></router-view>
        <template v-if="$route.path === '/'">
          你好！欢迎来到管理端！
        </template>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    username() {
      return localStorage.username;
    },
  },
  methods: {
    logout() {
      console.log(1);
      localStorage.clear();
      this.$router.push({ path: "/login" });
    },
  },
};
</script>

<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
.el-aside [class^="el-icon-"] {
  margin-top: -3px;
}
h3.subtitle {
  margin-left: -15px;
}
</style>
<style scoped>
.el-submenu__title {
  display: flex;
}
</style>
