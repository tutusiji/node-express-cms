import { defineStore } from 'pinia';
import { getAds } from '../http/api';

interface Items {
  image: string;
  title: string;
  url: string;
  target: boolean;
  _id: string;
}

interface Ad {
  items: Items[];
  name: string;
  _id: string;
}

export const useAdStore = defineStore('banner', {
  // 状态
  state: () => ({
    list: [] as Ad[]
  }),
  // 修改状态 同步异步都可修改
  actions: {
    async fetchAds() {
      try {
        const res = (await getAds()) as unknown as Ad[];
        this.list = res;
      } catch (error) {
        console.error((error as Error).message);
      } finally {
      }
    }
  }
});
