import { defineStore } from 'pinia';
import { blogList } from '../http/api';

type ArrListType = {
  _id: string;
  title: string;
  date: string;
  summary: string;
  serialNumber: number;
};

export const useArticleStore = defineStore('articler', {
  // 状态
  state: () => ({
    list: [] as ArrListType[],
    currentPage: 1,
    totalItems: 0,
    loading: false
  }),
  // 状态数据计算属性 相当于computed
  getters: {
    // doubleAge(): number {
    //   return this.age * 2;
    // },
  },
  // 修改状态 同步异步都可修改
  actions: {
    setlist(newList: ArrListType[]) {
      this.list = newList;
    },
    setPageCurrent(newPage: number) {
      this.currentPage = newPage;
    },
    setTotalItems(newTotal: number) {
      this.totalItems = newTotal;
    },
    async fetchArticles(categoryName: string, page: number, limit: number, searchText: string) {
      try {
        this.loading = true;
        const res = (await blogList({
          parentName: '博客文章', // TODO 站点根请求可配置
          categoryName,
          page,
          limit,
          searchText
        })) as unknown as {
          list: ArrListType[];
          currentPage: number;
          totalItems: number;
        };
        this.list = res.list;
        this.currentPage = res.currentPage;
        this.totalItems = res.totalItems;
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        this.loading = false;
      }
    }
  }
});
