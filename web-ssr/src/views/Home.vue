<template>
  <div class="homepage">
    <div v-loading="articleStore.loading" class="articleList">
      <div v-if="route.query.search" class="searchTitle">
        关于搜索有 “{{ route.query.search }}” 内容的文章：
      </div>
      <div v-if="route.query.tag" class="searchTitle">标签为 “{{ route.query.tag }}” 的文章：</div>
      <ul>
        <li v-for="item of articleStore.list" :key="item._id">
          <!-- @click="$router.push(`./article/${item._id}`)" -->
          <!-- <span class="num">No.{{ item.serialNumber }}</span> -->
          <div class="info">
            <div class="content">
              <div>
                <a
                  class="title"
                  :href="`/${item.categories[0].pageName}/article/${item._id}`"
                  @click.prevent="
                    router.push(`/${item.categories[0].pageName}/article/${item._id}`)
                  "
                  ><span class="num">No.{{ item.serialNumber }}</span>
                  <span class="tit">{{ item.title }}</span></a
                >
              </div>
              {{ `/${item.categories[0].pageName}/article/${item._id}` }}
              <div v-show="item.summary" class="summary">
                {{ item.summary
                }}<a
                  class="desc"
                  :href="`/${item.categories[0].pageName}/article/${item._id}`"
                  @click.prevent="
                    router.push(`/${item.categories[0].pageName}/article/${item._id}`)
                  "
                  >... 阅读全文 〉</a
                >
              </div>
              <div v-show="item.tags?.length" class="tags">
                <span>标签：</span>
                <a
                  v-for="tag in item.tags"
                  :key="tag._id"
                  :href="`/${String(route.name)}/1?tag=${tag.name}`"
                  @click.prevent="router.push(`/${String(route.name)}/1?tag=${tag.name}`)"
                >
                  {{ tag.name }}
                </a>
              </div>
              <div
                v-show="item.categories?.length && (route.query.search || route.query.tag)"
                class="tags"
              >
                <span>发布于：</span>
                <a
                  v-for="cate in item.categories"
                  :key="cate._id"
                  :href="`/${String(cate.pageName)}/1`"
                  @click.prevent="router.push(`/${String(cate.pageName)}/1`)"
                >
                  {{ cate.name }}
                </a>
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
    </div>
    <div class="sidebar">
      <div class="mb-4">
        <el-input v-model="searchVal" placeholder="搜索" class="h-[40px]" clearable>
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      <div v-show="adStore.list[0]?.items.length" class="block text-center mb-4">
        <!-- <span class="demonstration">Switch when indicator is hovered (default)</span> -->
        <el-carousel
          ref="carousel"
          height="168px"
          :interval="5000"
          indicator-position="outside"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <el-carousel-item v-for="item in adStore.list[0]?.items" :key="item._id">
            <!-- <img :src="item.image" alt="" class="w-full" /> -->
            <a
              :href="`${item.url}`"
              :target="`${item.target ? '_blank' : '_self'}`"
              class="coverItem"
              :style="`background-image: url(${item.image});`"
            >
              <h3>{{ item.title }}</h3>
            </a>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div v-if="tagStore.list.length" class="tags tagSider">
        <h3>标签集合：</h3>
        <a
          v-for="tag in tagStore.list"
          :key="tag._id"
          class="tagItem"
          :href="`/${String(route.name)}/1?tag=${tag.name}`"
          @click.prevent="router.push(`/${String(route.name)}/1?tag=${tag.name}`)"
        >
          {{ tag.name }}
        </a>
      </div>
    </div>
  </div>

  <div
    v-show="articleStore.list.length > 0"
    class="relative flex justify-between items-center py-10"
  >
    <div class="gotop" @click="goTop">返回顶部↑</div>
    <div class="pageNum flex flex-1 justify-center">
      <el-pagination
        v-model:current-page="articleStore.currentPage"
        background
        layout="prev, pager, next"
        :total="articleStore.totalItems"
        @current-change="(val) => changePage(val)"
      />
    </div>
  </div>
  <div v-if="tagStore.list.length && String(route.name) === 'coder'" class="tags tagMain">
    <h3>文章标签：</h3>
    <a
      v-for="tag in tagStore.list"
      :key="tag._id"
      class="tagItem"
      :href="`/${String(route.name)}/1?tag=${tag.name}`"
      @click.prevent="router.push(`/${String(route.name)}/1?tag=${tag.name}`)"
    >
      {{ tag.name }}
    </a>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { Search } from '@element-plus/icons-vue';
import { useMenuStore } from '../store/menuStore';
import { useArticleStore } from '../store/artcleStore';
import { useTagStore } from '../store/tagStore';
import { useAdStore } from '../store/adStore';
const menuStore = useMenuStore();
const adStore = useAdStore();
const articleStore = useArticleStore();
const tagStore = useTagStore();
const router = useRouter();
const route = useRoute();
const searchVal = ref('');

// SSR 数据预取
onServerPrefetch(async () => {
  const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
  if (currentMenu) {
    menuStore.menuCurrentName = currentMenu.name;
    articleStore.currentPage = Number(route.params.page) || 1;
    let searchValue = '';
    let tagValue = '';
    if (route.query.search) {
      searchValue = String(route.query.search);
      searchVal.value = searchValue;
    } else if (route.query.tag) {
      tagValue = String(route.query.tag);
    }
    await articleStore.fetchArticles(
      currentMenu.name,
      articleStore.currentPage,
      10,
      searchValue,
      tagValue
    );
    await adStore.fetchAds();
  }
});

// banner滑动
const carousel: Ref<any> = ref(null);
let startX: number, endX: number;
const handleTouchStart = (event: TouchEvent) => {
  startX = event.touches[0].clientX;
};
const handleTouchMove = (event: TouchEvent) => {
  endX = event.touches[0].clientX;
};
const handleTouchEnd = () => {
  const threshold = 50; // 最小触发距离
  if (carousel.value && startX - endX > threshold) {
    carousel.value.next();
  } else if (carousel.value && endX - startX > threshold) {
    carousel.value.prev();
  }
};

const changePage = (val: any) => {
  const searchValue = String(route.query.search || '');
  const tagValue = String(route.query.tag || '');
  if (searchValue) {
    router.push(`/${String(route.name)}/${val}?search=${searchValue}`);
  } else if (tagValue) {
    router.push(`/${String(route.name)}/${val}?tag=${tagValue}`);
  } else {
    router.push(`/${String(route.name)}/${val}`);
  }
};

// 搜索查询
const handleSearch = async () => {
  router.push(`/${String(route.name)}/1?search=${searchVal.value}`);
};

onMounted(async () => {
  // 如果没有pinia数据，则正常获取ssr数据
  if (!articleStore.list.length) {
    console.log('Article list ssr reload');
    const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
    if (currentMenu) {
      menuStore.menuCurrentName = currentMenu.name;
      document.title = `${currentMenu.name} - Tuziki的个人记录`;
      articleStore.currentPage = Number(route.params.page) || 1;
      let searchValue = '';
      let tagValue = '';
      if (route.query.search) {
        searchValue = String(route.query.search);
        searchVal.value = searchValue;
      } else if (route.query.tag) {
        tagValue = String(route.query.tag);
      }
      await articleStore.fetchArticles(
        currentMenu.name,
        articleStore.currentPage,
        10,
        searchValue,
        tagValue
      );
      // await adStore.fetchAds();
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

<style scoped>
.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
<style lang="scss">
.searchTitle {
  font-size: 20px;
  font-weight: 600;
  font-style: italic !important;
  color: #333;
  margin-bottom: 10px;
}
.homepage {
  display: flex;
  .sidebar {
    margin-left: 2rem;
    width: 220px;
    // background-color: #eee;
    .el-carousel__indicators {
      width: 100%;
    }
    .coverItem {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      h3 {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
        padding: 0 8px;
        height: 30px;
        background-color: rgba($color: #000, $alpha: 0.5);
        font-size: 1.1rem;
        font-family: 'CustomFont';
        color: #e1e1e1;
        text-align: center;
        line-height: 30px;
        font-weight: normal;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}

.articleList {
  flex: 1;
  min-height: 200px;
  // background-color: #fafafa;

  li {
    display: flex;
    align-items: baseline;
    padding: 1.1rem 1rem;
    border-bottom: 1px dashed #eee;

    &:hover {
      background-color: rgb(245, 247, 250);
    }

    &:active {
      background-color: rgb(245, 247, 250);
    }

    &:nth-last-child(1) {
      border-bottom: none;
    }

    // .num {
    //   font-family: 'CustomFont';
    //   margin-right: 1.3rem;
    // }

    .info {
      flex: 1;
      display: flex;
      align-items: center;

      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;

        .title {
          cursor: pointer;
          line-height: 28px;
          font-size: 1.3rem;
          font-weight: bold;
          word-break: break-all;
          color: #0d6fa1; // 34538b
          font-family: 'CustomFont';
          &:hover {
            text-decoration: none;
          }
          &:hover .num {
            text-decoration: none;
          }
          &:hover .tit {
            text-decoration: underline;
          }
          .num {
            color: #333;
            font-size: 1rem;
            margin-right: 0.5rem;
          }
        }

        .summary {
          font-size: 0.9rem;
          word-break: break-all;
          padding-top: 6px;
        }
        .tags {
          margin-top: 8px;
          word-break: break-all;
          font-size: 13px;
          span {
            font-family: 'CustomFont';
          }
          a {
            color: #666;
            margin-right: 0.5rem;
            white-space: nowrap;
          }
        }

        .desc {
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
        text-align: right;

        b {
          display: block;
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
.el-pagination.is-background .btn-next.is-active,
.el-pagination.is-background .btn-prev.is-active,
.el-pagination.is-background .el-pager li.is-active {
  background-color: #5bbded; /* 更改为你想要的背景颜色 */
}
</style>
