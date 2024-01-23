<template>
  <ul v-loading="articleStore.loading" class="articleList">
    <li v-for="item of articleStore.list" :key="item._id">
      <!-- @click="$router.push(`./article/${item._id}`)" -->
      <span class="num">No.{{ item.serialNumber }}</span>
      <div class="info">
        <div class="content">
          <div>
            <a
              class="title"
              :href="`./article/${item._id}`"
              @click.prevent="router.push(`./article/${item._id}`)"
              >{{ item.title }}</a
            >
          </div>
          <div v-show="item.summary" class="summary">
            {{ item.summary
            }}<a
              class="desc"
              :href="`./article/${item._id}`"
              @click.prevent="router.push(`./article/${item._id}`)"
              >... 阅读全文 〉</a
            >
          </div>
        </div>
        <div class="date">
          <!-- YYYY-MM-DD HH:mm:ss -->
          <em>{{ item.date && dayjs(item.date).format('MM-DD') }}</em>
          <b>{{ item.date && dayjs(item.date).format('YYYY') }}</b>
          <!-- <div class="auther">Tutu</div> -->
        </div>
      </div>
    </li>
  </ul>
  <div v-show="articleStore.list.length > 0" class="flex justify-between items-center py-10">
    <div class="gotop" @click="goTop">返回顶部↑</div>
    <el-pagination
      v-model:current-page="articleStore.currentPage"
      background
      layout="prev, pager, next"
      :total="articleStore.totalItems"
      @current-change="(val) => router.push(`/${String(route.name)}/${val}`)"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { useMenuStore } from '../store/menuStore';
import { useArticleStore } from '../store/artcleStore';
const menuStore = useMenuStore();
const articleStore = useArticleStore();
const router = useRouter();
const route = useRoute();

// SSR 数据预取
onServerPrefetch(async () => {
  const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
  if (currentMenu) {
    articleStore.currentPage = Number(route.params.page);
    menuStore.menuCurrentName = currentMenu.name;
    await articleStore.fetchArticles(currentMenu.name, Number(route.params.page), 10);
  }
});

onMounted(() => {
  // console.log(route);
  // console.log('currentPage---', articleStore.currentPage);
  const currentPage = articleStore.currentPage || 1;
  // 如果没有pinia数据，则正常获取ssr数据
  if (!articleStore.list.length) {
    console.log('Article list ssr reload');
    const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
    if (currentMenu) {
      menuStore.menuCurrentName = currentMenu.name;
      document.title = `Tuziki的个人记录 - ${currentMenu.name}`;
      articleStore.currentPage = Number(route.params.page);
      articleStore.fetchArticles(currentMenu.name, currentPage, 10);
    }
  }
});

const goTop = () => {
  window.scrollTo({
    top: 0, // 滚动到页面的顶部
    behavior: 'smooth' // 平滑滚动
  });
};
</script>

<style lang="scss">
ul.articleList {
  min-height: 200px;
  // background-color: #fafafa;

  li {
    display: flex;
    align-items: baseline;
    padding: 1.1rem 1rem;
    border-bottom: 1px solid #eee;

    &:hover {
      background-color: #fafafa;
    }

    &:active {
      background-color: #fafafa;
    }

    &:nth-last-child(1) {
      border-bottom: none;
    }

    .num {
      font-family: 'CustomFont';
      margin-right: 1.3rem;
    }

    .info {
      flex: 1;
      display: flex;
      align-items: center;

      .content {
        flex: 1;
        display: flex;
        flex-direction: column;

        .title {
          cursor: pointer;
          line-height: 28px;
          font-size: 1.2rem;
          font-weight: bold;
          word-break: break-all;
          color: #0d6fa1; // 34538b
          font-family: 'CustomFont';
        }

        .summary {
          font-size: 0.9rem;
          word-break: break-all;
          padding-top: 6px;
        }

        .desc {
          color: #81ccf1;
          color: #5bbded;
          // text-decoration: underline;
          font-family: 'CustomFont';
          white-space: nowrap;
        }
      }

      .date {
        width: 3rem;
        margin-left: 2rem;
        font-size: 0.8rem;
        color: #c5c5c5;
        font-family: 'CustomFont';

        b {
          display: block;
          text-align: right;
        }

        em {
          display: block;
          color: #666;
          font-size: 0.9rem;
          text-align: right;
        }
      }
    }
  }
}
</style>
