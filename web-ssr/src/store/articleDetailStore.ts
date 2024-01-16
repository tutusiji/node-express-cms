import { defineStore } from 'pinia';
import { getArticleDetail } from '../http/api';

interface ArticleApiResponse {
  body: string;
  title: string;
  date: string;
  categories: string[];
  dateDisplay: boolean;
  prevArticle: { _id: string; title: string };
  nextArticle: { _id: string; title: string };
}

export const useArticleDetailStore = defineStore('articleDetail', {
  // 状态
  state: () => ({
    detail: {
      body: '',
      title: '',
      date: '',
      categories: [] as string[],
      dateDisplay: false,
      prevArticle: { _id: '', title: '' },
      nextArticle: { _id: '', title: '' }
    },
    loading: false
  }),
  // 修改状态 同步异步都可修改
  actions: {
    async fetchArticleDetail(id: string) {
      this.loading = true;
      try {
        const articleData = (await getArticleDetail(id)) as unknown as ArticleApiResponse;
        this.detail = articleData;
      } catch (error) {
        console.error('Fetch article detail failed:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
