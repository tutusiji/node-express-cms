import { defineStore } from 'pinia';
import { siteInfo } from '../http/api';

interface siteInfoParams {
  title: string;
  slogan: string;
  summary: string;
  icon: string;
  banner: string;
  welcome: string;
  coryright: string;
  beian: string;
}

export const useSiteStore = defineStore('siter', {
  // 状态
  state: () => ({
    info: {} as siteInfoParams
  }),
  // 状态数据计算属性 相当于computed
  getters: {
    // doubleAge(): number {
    //   return this.age * 2;
    // },
  },
  // 修改状态 同步异步都可修改
  actions: {
    setMenu(newSite: siteInfoParams) {
      this.info = newSite;
    },
    async fetchSiteInfo() {
      try {
        const res = await siteInfo();
        this.info = res as unknown as siteInfoParams;
      } catch (error) {
        console.error((error as Error).message);
      } finally {
      }
    }
  }
});
