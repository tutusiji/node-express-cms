import { defineStore } from 'pinia';
import { blogList } from '../http/api';
import { useTagStore } from './tagStore';
import { useMenuStore } from '../store/menuStore';
const tagStore = useTagStore();
const menuStore = useMenuStore();

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

type ArrListType = {
  _id: string;
  title: string;
  date: string;
  summary: string;
  categories: ArrMenuListType[];
  serialNumber: number;
  tags: TagListType[];
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
  getters: {},
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
    async fetchArticles(
      categoryName: string,
      page: number,
      limit: number,
      searchText: string,
      tagName: string
    ) {
      try {
        this.loading = true;
        const res = (await blogList({
          parentName: '博客文章', // TODO 站点根请求可配置
          categoryName,
          page,
          limit,
          searchText,
          tagName
        })) as unknown as {
          list: ArrListType[];
          currentPage: number;
          totalItems: number;
        };
        this.list = res.list.map((item) => ({
          ...item,
          categories: item.categories?.map((categoryItem) => {
            const category = menuStore.menu.find(
              (cate) => cate._id === (categoryItem as unknown as string)
            );
            return category as ArrMenuListType;
          }),
          tags: item.tags?.map((tagItem) => {
            const foundTag = tagStore.list.find(
              (tag) => tag._id === (tagItem as unknown as string)
            );
            return foundTag || tagItem;
          })
        }));
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
