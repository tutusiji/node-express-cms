import { defineStore } from 'pinia';
import { getArticleDetail } from '../http/api';
import { useTagStore } from './tagStore';
const tagStore = useTagStore();

type TagListType = {
  _id: string;
  name: string;
};

interface ArticleApiResponse {
  body: string;
  title: string;
  date: string;
  slotName: string;
  summary: string;
  description: string;
  author: string;
  slotStatus: boolean;
  single: boolean;
  categories: string[];
  tags: TagListType[];
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
      slotName: '',
      summary: '',
      author: '',
      slotStatus: false,
      single: false,
      categories: [] as string[],
      tags: [] as TagListType[],
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
        this.detail = {
          ...articleData,
          tags: articleData.tags?.map((tagItem) => {
            const foundTag = tagStore.list.find(
              (tag) => tag._id === (tagItem as unknown as string)
            );
            return foundTag || tagItem;
          })
        };
      } catch (error) {
        console.error('Fetch article detail failed:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
