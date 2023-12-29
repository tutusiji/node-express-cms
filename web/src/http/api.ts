import request from "./request";

// 定义API请求参数的类型
interface BlogListParams {
  parentName: string;
  categoryName: string;
  page: number;
  limit: number;
}

// 用户登录
export async function blogList(data: BlogListParams) {
  return request({
    url: "/blog/list",
    method: "post",
    data,
  });
}
// 获取用户信息
export function blogMenu(data: BlogListParams) {
  return request({
    url: "/blog/menu",
    method: "post",
    data,
  });
}

// 文章详情
export function getArticleDetail(data: string) {
  return request({
    url: `/articles/${data}`,
    method: "get",
  });
}
