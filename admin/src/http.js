import axios from "axios";
import Vue from "vue";
import router from "./router";

const http = axios.create({
  // baseURL: process.env.VUE_APP_API_URL || '/admin/api',
  baseURL: "http://localhost:3000/admin/api",
});

http.interceptors.request.use(
  (config) => {
    if (localStorage.token) {
      config.headers.Authorization = "Bearer " + (localStorage.token || "");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    if (error.response.data.message) {
      Vue.prototype.$message({
        type: "error",
        message: error.response.data.message,
      });
      console.log(error.response);
      if (error.response.status === 401) {
        Vue.prototype.$message({
          type: "error",
          message: "未登录或token失效，请重新登录",
        });
        localStorage.removeItem("token");
        router.push('/login')
      }
    }
    return Promise.reject(error);
  }
);

export default http;
