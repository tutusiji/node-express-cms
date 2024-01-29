import { defineStore } from 'pinia';
import { blogList } from '../http/api';
import { useTagStore } from './tagStore';
const tagStore = useTagStore();

type TagListType = {
  _id: string;
  name: string;
};

type ArrListType = {
  _id: string;
  title: string;
  date: string;
  summary: string;
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
        const data = res.list;
        data.forEach((item) => {
          if (item.tags && tagStore.list.length > 0) {
            // 创建一个新数组来存储更新后的标签对象
            const updatedTags = item.tags.map((tagItem) => {
              // 查找并返回匹配的标签对象，否则保留原始的 tagItem
              const foundTag = tagStore.list.find(
                (tag) => tag._id === (tagItem as unknown as string)
              );
              return foundTag ? foundTag : tagItem;
            });

            // 更新 item.tags 为新的数组
            item.tags = updatedTags;
          }
        });
        // this.list = res.list.map((item) => ({
        //   ...item,
        //   tags: item.tags?.map((tagItem) => {
        //     const foundTag = tagStore.list.find(
        //       (tag) => tag._id === (tagItem as unknown as string)
        //     );
        //     return foundTag || tagItem;
        //   })
        // }));
        this.list = data;
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
