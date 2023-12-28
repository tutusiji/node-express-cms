<template>
  <div class="login">
    <div class="bg stripes checkered"></div>
    <el-card header="登录" class="login-class">
      <el-form @submit.native.prevent="login">
        <el-form-item label="用户名">
          <el-input v-model="username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  components: {},
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    async login() {
      const res = await this.$http.post("login", {
        username: this.username,
        password: this.password,
      });
      if (res.status === 200) {
        localStorage.token = res.data.token;
        localStorage.username = this.username;
        this.$router.push("/");
        this.$message({
          type: "success",
          message: "登录成功",
        });
      }
      console.log(res);
    },
  },
};
</script>

<style scoped>
.login {
  /* margin: 20rem auto 0; */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-class {
  width: 400px;
  z-index: 10;
  position: relative;
}

.el-card {
  margin: 0 auto;
}
.el-form-item {
  margin-bottom: 20px;
}
.el-button {
  width: 100%;
}
.el-input {
  width: 100%;
}
.login .bg {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0.05;
  pointer-events: none;
}
.stripes {
  -webkit-background-size: 50px 50px;
  -moz-background-size: 50px 50px;
  background-size: 50px 50px;
  -moz-box-shadow: 1px 1px 8px gray;
  -webkit-box-shadow: 1px 1px 8px gray;
  box-shadow: 1px 1px 8px gray;
}

.checkered {
  background-image: -webkit-gradient(
      linear,
      0 0,
      100% 100%,
      color-stop(0.25, #555),
      color-stop(0.25, transparent),
      to(transparent)
    ),
    -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.25, #555), color-stop(0.25, transparent), to(transparent)),
    -webkit-gradient(linear, 0 0, 100% 100%, color-stop(0.75, transparent), color-stop(0.75, #555)),
    -webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.75, transparent), color-stop(0.75, #555));
  background-image: -moz-linear-gradient(
      45deg,
      #555 25%,
      transparent 25%,
      transparent
    ),
    -moz-linear-gradient(-45deg, #555 25%, transparent 25%, transparent),
    -moz-linear-gradient(45deg, transparent 75%, #555 75%),
    -moz-linear-gradient(-45deg, transparent 75%, #555 75%);
  background-image: -o-linear-gradient(
      45deg,
      #555 25%,
      transparent 25%,
      transparent
    ),
    -o-linear-gradient(-45deg, #555 25%, transparent 25%, transparent),
    -o-linear-gradient(45deg, transparent 75%, #555 75%),
    -o-linear-gradient(-45deg, transparent 75%, #555 75%);
  background-image: linear-gradient(
      45deg,
      #555 25%,
      transparent 25%,
      transparent
    ),
    linear-gradient(-45deg, #555 25%, transparent 25%, transparent),
    linear-gradient(45deg, transparent 75%, #555 75%),
    linear-gradient(-45deg, transparent 75%, #555 75%);
}
</style>
