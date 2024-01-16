import request from './request';
import { AxiosResponse } from 'axios';

// 定义API请求参数的类型
interface BlogListParams {
  parentName: string;
  categoryName: string;
  page: number;
  limit: number;
}
interface ArticleApiResponse {
  body: string;
  title: string;
  date: string;
  categories: string[];
  dateDisplay: boolean;
  prevArticle: { _id: string; title: string };
  nextArticle: { _id: string; title: string };
}

// 用户登录
export async function blogList(data: BlogListParams) {
  return request({
    url: '/blog/list',
    method: 'post',
    data
  });
}

// 获取用户信息
export function blogMenu(data: BlogListParams) {
  return request({
    url: '/blog/menu',
    method: 'post',
    data
  });
}

// 获取用户信息
export function siteInfo() {
  return request({
    url: '/site/webInfo',
    method: 'get'
  });
}

// 文章详情
export function getArticleDetail(data: string): Promise<AxiosResponse<ArticleApiResponse>> {
  return request({
    url: `/articles/${data}`,
    method: 'get'
  });
}
