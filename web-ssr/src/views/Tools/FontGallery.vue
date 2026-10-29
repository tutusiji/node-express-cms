<template>
  <div class="py-4">
    <h3 class="text-[18px] font-bold pb-4">字体库预览</h3>
    <div
      v-loading="loading"
      element-loading-text="正在加载字体库..."
      class="flex flex-col gap-6"
    >
      <el-empty v-if="!loading && fonts.length === 0" description="字体库还是空的" />
      <div
        v-for="font in fonts"
        :key="font.filename"
        class="border border-gray-200 rounded-lg p-4 bg-white"
      >
        <div class="flex items-baseline justify-between pb-2">
          <span class="font-bold text-[16px]">{{ font.name }}</span>
          <span class="text-[12px] text-gray-400">{{ formatSize(font.size) }}</span>
        </div>
        <div
          :ref="(el) => setCardRef(el, font.filename)"
          :data-font="font.filename"
          class="preview min-h-[60px] text-[22px] leading-relaxed break-all border-b border-dashed border-gray-200 pb-2"
          :style="loaded[font.filename] ? `font-family:'${font.name}';` : ''"
        >
          <template v-if="loaded[font.filename]">{{ font.words }}</template>
          <span v-else class="text-gray-300 text-[14px]">字体加载中...</span>
        </div>
        <div class="flex items-center gap-3 pt-3">
          <el-input
            v-model="font.words"
            placeholder="输入需要子集化的文字"
            clearable
            maxlength="500"
          />
          <el-button
            type="primary"
            :icon="Download"
            :loading="generating[font.filename]"
            @click="generateSubset(font)"
          >
            生成
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FontFaceObserver from 'fontfaceobserver';
import { Download } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import 'element-plus/theme-chalk/el-notification.css';
import { createFonts, getFontsList } from '../../http/api';
import type { FontItem } from '../../http/api';

const fonts = ref<(FontItem & { words: string })[]>([]);
const loading = ref(true);
const loaded = ref<Record<string, boolean>>({});
const generating = ref<Record<string, boolean>>({});

const baseHost = import.meta.env.VITE_BASE_HOST;

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const cardRefs = new Map<string, Element>();
const observer = ref<IntersectionObserver | null>(null);

function setCardRef(el: unknown, filename: string) {
  if (el) {
    cardRefs.set(filename, el as Element);
  }
}

function injectFontFace(font: FontItem) {
  const style = document.createElement('style');
  const fontUrl = `${baseHost}uploads/fonts/${encodeURIComponent(font.filename)}`;
  style.appendChild(
    document.createTextNode(`
      @font-face {
        font-family: '${font.name}';
        src: url('${fontUrl}') format('truetype');
        font-style: normal;
        font-weight: normal;
        font-display: swap;
      }
    `)
  );
  document.head.appendChild(style);
  new FontFaceObserver(font.name)
    .load(null, 30000)
    .then(() => {
      loaded.value[font.filename] = true;
    })
    .catch(() => {
      // 字体加载失败也展示内容，避免空白卡片
      loaded.value[font.filename] = true;
    });
}

async function generateSubset(font: FontItem & { words: string }) {
  if (!font.words.trim()) {
    ElNotification({ title: '提示', message: '请输入需要子集化的文字', type: 'warning' });
    return;
  }
  generating.value[font.filename] = true;
  try {
    const res = await createFonts({ words: font.words, fontOriginName: font.filename });
    const a = document.createElement('a');
    a.href = res.url;
    a.download = res.name || 'font-subset.ttf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    generating.value[font.filename] = false;
  }
}

onMounted(async () => {
  try {
    const res = await getFontsList();
    fonts.value = (res as unknown as (FontItem & { words: string })[]).map((f) => ({
      ...f,
      words: '永国风流，山高水长。The quick brown fox jumps over the lazy dog. 0123456789'
    }));
    loading.value = false;
    await nextTick(); // 等卡片渲染完成后再收集 ref
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const filename = (entry.target as HTMLElement).dataset.font;
          if (entry.isIntersecting && filename && !loaded.value[filename]) {
            const font = fonts.value.find((f) => f.filename === filename);
            if (font) injectFontFace(font);
          }
        });
      },
      { rootMargin: '200px' }
    );
    cardRefs.forEach((el) => observer.value?.observe(el));
  } finally {
    if (!observer.value) {
      loading.value = false;
    }
  }
});

onUnmounted(() => {
  observer.value?.disconnect();
});
</script>
