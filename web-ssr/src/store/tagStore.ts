import { defineStore } from 'pinia';
import { getTags } from '../http/api';

type TagListType = {
  _id: string;
  name: string;
};

export const useTagStore = defineStore('tager', {
  // 状态
  state: () => ({
    list: [] as TagListType[]
  }),
  // 修改状态 同步异步都可修改
  actions: {
    async fetchTags() {
      try {
        const res = (await getTags()) as unknown as TagListType[];
        this.list = res;
      } catch (error) {
        console.error((error as Error).message);
      } finally {
      }
    }
  }
});
