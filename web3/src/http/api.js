import request from "./request";

// 用户登录
export function blogList(data) {
  return request({
    url: "/blog/list",
    method: "post",
    data,
  });
}
// 获取用户信息
export function blogMenu(data) {
  return request({
    url: "/blog/menu",
    method: "post",
    data,
  });
}

// 文章详情
export function articleDetail(data) {
  return request({
    url: `/articles/${data}`,
    method: "get",
  });
}
