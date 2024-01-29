import { defineStore } from 'pinia';
import { blogMenu } from '../http/api';

interface ArrMenuListType {
  _id: string;
  name: string;
  pageName: string;
  pageId: string;
}

export const useMenuStore = defineStore('menuer', {
  // 状态
  state: () => ({
    menu: [] as ArrMenuListType[],
    menuCurrentName: ''
  }),
  // 状态数据计算属性 相当于computed
  getters: {
    // doubleAge(): number {
    //   return this.age * 2;
    // },
  },
  // 修改状态 同步异步都可修改
  actions: {
    setMenu(newMenu: ArrMenuListType[]) {
      this.menu = newMenu;
    },
    async fetchMenu() {
      try {
        const res = await blogMenu({
          parentName: '博客文章',
          categoryName: '',
          page: 0,
          limit: 0,
          searchText: '',
          tagName: ''
        });
        this.menu = res as unknown as ArrMenuListType[];
      } catch (error) {
        console.error((error as Error).message);
      } finally {
      }
    }
  }
});
