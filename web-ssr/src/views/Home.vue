<template>
  <div class="homepage">
    <div v-loading="articleStore.loading" class="articleList">
      <div v-if="route.query.search" class="searchTitle">
        搜索关于 “{{ route.query.search }}” 内容的文章：
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
              <!-- {{ `/${item.categories[0].pageName}/article/${item._id}` }} -->
              <div v-show="item.summary" class="summary">
                <a
                  v-if="item.coverImage"
                  :href="`/${item.categories[0].pageName}/article/${item._id}`"
                  class="coverImage w-[160px] h-[120px]"
                  :style="`background-image: url(${item.coverImage});`"
                  @click.prevent="
                    router.push(`/${item.categories[0].pageName}/article/${item._id}`)
                  "
                >
                </a>
                <p class="texts">
                  {{ item.summary
                  }}<a
                    class="desc"
                    :href="`/${item.categories[0].pageName}/article/${item._id}`"
                    @click.prevent="
                      router.push(`/${item.categories[0].pageName}/article/${item._id}`)
                    "
                    >... 阅读全文 〉</a
                  >
                </p>
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
        <div
          class="cospa w-[40px] ml-[-18px] relative"
          :style="`transform:translateX(${searchVal.length * 5}px)`"
        >
          <img
            class="tuziki pointer-events-none block mb-[-26px]"
            src="https://hkroom.oss-cn-shenzhen.aliyuncs.com/Snipaste_2024-01-24_05-28-56.png"
            width="40px"
          />
          <div :class="['tips', tipsVal && 'show']">
            <span class="txt">{{ tipsTxt }}</span>
          </div>
        </div>
        <el-input
          v-model="searchVal"
          type="text"
          maxlength="30"
          placeholder="搜索"
          class="h-[40px]"
          clearable
        >
          <!-- show-word-limit -->
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
  <div v-if="tagStore.list.length" class="tags tagMain">
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
import { useSiteStore } from '../store/siteStore';
const siteStore = useSiteStore();
const menuStore = useMenuStore();
const adStore = useAdStore();
const articleStore = useArticleStore();
const tagStore = useTagStore();
const router = useRouter();
const route = useRoute();
const searchVal = ref('');
const tipsVal = ref(false);
const tipsTxt = ref('');

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

watch(
  () => searchVal.value,
  (val, old) => {
    // console.log('watch1', val.length);
    // console.log('watch2', old?.trim().length);
    if (val.length === 30) {
      tipsVal.value = true;
      tipsTxt.value = 'enough!';
      setTimeout(() => {
        tipsVal.value = false;
      }, 2000);
    }
    if (val.length === 0 && old?.length === 30) {
      // console.log(1111);
      tipsTxt.value = '';
    }
  },
  { immediate: true }
);

// 搜索查询
const handleSearch = () => {
  // router.push(`/${String(route.name)}/1?search=${searchVal.value.replace(/\s+/g, '')}`);
  console.log('handleSearch', !searchVal.value.trim().length, !route.query.search);
  if (!searchVal.value.trim().length && !route.query.search) {
    searchVal.value = '';
    tipsVal.value = true;
    tipsTxt.value = 'nothing!';
    setTimeout(() => {
      tipsVal.value = false;
    }, 2000);
    return;
  }
  router.push(`/${String(route.name)}/1?search=${searchVal.value.trim()}`);
};

onMounted(async () => {
  // 如果没有pinia数据，则正常获取ssr数据
  if (!articleStore.list.length) {
    console.log('Article list ssr reload');
    const currentMenu = menuStore.menu.find((item) => item.pageName === route.name);
    if (currentMenu) {
      menuStore.menuCurrentName = currentMenu.name;
      document.title = `${currentMenu.name} - ${siteStore.info.title}`;
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
    }
  }
});
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
    .cospa {
      .tips {
        position: absolute;
        top: 2px;
        left: 35px;
        font-size: 10px;
        color: #666;
        width: 0px;
        height: 20px;
        overflow: hidden;
        transform: rotate(-12deg);
        transition: width 0.2s ease-in-out;
        &.show {
          width: 45px;
        }
        .txt {
          display: block;
          width: 45px;
          height: 20px;
          white-space: nowrap;
        }
      }
    }
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
          .tit {
            background-image: linear-gradient(#0d6fa1, #0d6fa1);
            background-position: 0 100%;
            background-repeat: no-repeat;
            background-size: 0 2px;
            transition: background-size 0.5s;
          }
          &:hover {
            text-decoration: none;
          }
          &:hover .num {
            text-decoration: none;
          }
          &:hover .tit {
            // text-decoration: underline;
            background-size: 100% 2px;
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
        .coverImage {
          float: right;
          margin-left: 10px;
          margin-bottom: 15px;
          display: block;
          position: relative;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
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
          font-weight: normal;
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
