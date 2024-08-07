import request from './request';
import { AxiosResponse } from 'axios';

// 定义API请求参数的类型
interface BlogListParams {
  parentName: string;
  categoryName: string;
  searchText: string;
  tagName: string;
  page: number;
  limit: number;
}

type TagListType = {
  _id: string;
  name: string;
};
interface ArrMenuListType {
  _id: string;
  name: string;
  pageName: string;
  pageId: string;
  path: string;
}
interface ArticleApiResponse {
  body: string;
  title: string;
  date: string;
  slotName: string;
  summary: string;
  slotStatus: boolean;
  categories: ArrMenuListType[];
  tags: TagListType[];
  dateDisplay: boolean;
  prevArticle: { _id: string; title: string };
  nextArticle: { _id: string; title: string };
}
// interface AdsResponse {
//   title: string;
//   image: string;
//   url: string;
// }
interface fontsType {
  words: string;
  fontOriginName: string;
}

// 文章列表
export async function blogList(data: BlogListParams) {
  return request({
    url: '/blog/list',
    method: 'post',
    data
  });
}

// 获取导航信息
export function blogMenu(data: BlogListParams) {
  return request({
    url: '/blog/menu',
    method: 'post',
    data
  });
}

// 获取站点信息
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

// 生成字体
export function createFonts(data: fontsType) {
  return request({
    url: '/createFonts',
    method: 'post',
    data
  });
}

// 获取banner
export function getAds() {
  return request({
    url: '/adsList',
    method: 'get'
  });
}

// 获取tags
export function getTags() {
  return request({
    url: '/tagsList',
    method: 'get'
  });
}

