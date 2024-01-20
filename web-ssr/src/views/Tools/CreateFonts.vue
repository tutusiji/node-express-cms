<template>
  <h3 class="text-[18px] font-bold py-4">上传字体包：</h3>
  <el-upload
    class="upload-demo"
    drag
    :action="`${baseURL}/uploadFonts`"
    :on-success="afterUpload"
    :multiple="false"
    :limit="1"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">拖拽文件到这里 or <em>点击上传</em></div>
    <template #tip>
      <div class="el-upload__tip">当前只支持ttf格式的字体文件上传，每次只能传一个字体包</div>
    </template>
  </el-upload>
  <h3 class="text-[18px] font-bold py-4">文字预览：</h3>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-input v-model="textarea" placeholder="Please input" rows="10" clearable type="textarea" />
    </el-col>
    <el-col :span="12">
      <div v-loading="loadfontStatus" element-loading-text="正在导入字体..." class="previewfonts">
        <div v-show="fontprogress !== 100" class="loadbar">
          <el-progress :text-inside="true" :stroke-width="20" :percentage="fontprogress">
            <div class="progress mt-[-8px]">本地字体包加载进度{{ fontprogress }}%</div>
          </el-progress>
        </div>
        {{ textarea }}
      </div>
    </el-col>
  </el-row>
  <div class="flex items-center justify-center my-4">
    <el-button
      size="large"
      type="primary"
      :icon="EditPen"
      :loading="loading"
      @click="onUploadfonts"
    >
      生成字体子集
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import Prism from 'prismjs'; // 代码高亮插件的core
import 'prismjs/themes/prism-tomorrow.min.css'; // 高亮主题
// import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { EditPen } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import 'element-plus/theme-chalk/el-notification.css';
import FontFaceObserver from 'fontfaceobserver';
import { createFonts } from '../../http/api';

const textarea = ref('字体包子集在线抽取');
const fontOriginName = ref('');
const loading = ref(false);
const loadfontStatus = ref(false);
const fontprogress = ref(0);

const baseURL = import.meta.env.VITE_BASE_URL;
const baseHost = import.meta.env.VITE_BASE_HOST;

function loadFont(fontName, fontUrl) {
  loadfontStatus.value = true;
  const newStyle = document.createElement('style');
  newStyle.appendChild(
    document.createTextNode(`
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}') format('truetype');
      font-style: normal;
      font-weight: normal;
    }
  `)
  );
  document.head.appendChild(newStyle);
  // 检测字体是否加载完成
  const font = new FontFaceObserver(fontName);
  font
    .load(null, 20000)
    .then(() => {
      loadfontStatus.value = false;
    })
    .catch((error) => {
      console.error('Font loading failed', error);
      loadfontStatus.value = false;
    });
}

const onUploadfonts = async () => {
  let txt = '';
  if (!fontOriginName.value || !textarea.value) {
    if (!fontOriginName.value) {
      txt = '请上传一个ttf字体包之后再进行操作！';
    }
    if (!textarea.value) {
      txt = '请输入所要提取的文本！';
    }
    ElNotification({
      title: '提示',
      message: txt,
      type: 'warning'
    });
    return;
  }

  loading.value = true;

  const res = await createFonts({
    words: textarea.value,
    fontOriginName: fontOriginName.value
  });
  console.log('res----', res);
  downloadFile(res.url, res.name);
  loading.value = false;
};

function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function fetchFontProgress(url, onProgress, totalBytes) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }

      const reader = response.body.getReader();
      let receivedBytes = 0;

      function processResult(result) {
        if (result.done) {
          console.log('Fetch complete');
          return;
        }

        receivedBytes += result.value.length;
        const progress = (receivedBytes / totalBytes) * 100;
        onProgress(progress);

        return reader.read().then(processResult);
      }

      return reader.read().then(processResult);
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });
}
console.log(`${baseHost}uploads/fonts/文鼎大颜楷.ttf`);
// 使用示例
const totalBytes = 6.99 * 1024 * 1024; // 6.5MB in bytes
// fetchFontProgress(
//   `${baseHost}uploads/fonts/文鼎大颜楷.ttf`,
//   (received, total) => {
//     const progress = (received / total) * 100;
//     console.log(`Progress: ${progress.toFixed(2)}%`);
//     loadLocalFonts.value = `${progress.toFixed(2)}%`;
//   },
//   totalBytes
// );

const afterUpload = (res) => {
  console.log('res', res);
  loadFont('AnyFonts', `${res.url}?v=${new Date().getTime()}`);
  fontOriginName.value = res.filename;
};

onMounted(() => {
  Prism.highlightAll();
  fetchFontProgress(
    `${baseHost}uploads/fonts/文鼎大颜楷.ttf`,
    (progress) => {
      const num = Number(progress.toFixed(0));
      fontprogress.value = num;
      // loadFont('AnyFonts', `${baseHost}uploads/fonts/文鼎大颜楷.ttf?v=${new Date().getTime()}`);
      if (num === 100) {
        console.log(`Progress: ${num}%`);
        const newStyle = document.createElement('style');
        newStyle.appendChild(
          document.createTextNode(`
    @font-face {
      font-family: 'AnyFonts';
      src: url('${baseHost}uploads/fonts/文鼎大颜楷.ttf?v=${new Date().getTime()}') format('truetype');
      font-style: normal;
      font-weight: normal;
    }
  `)
        );
        document.head.appendChild(newStyle);
      }
    },
    totalBytes
  );
});
</script>

<style lang="scss" scoped>
// @font-face {
//   font-family: 'AnyFonts';
//   src: url('https://www.tuziki.com/uploads/fonts/文鼎大颜楷.ttf') format('truetype');
//   font-style: normal;
//   font-weight: normal;
// }

.previewfonts {
  height: 220px;
  font-family: 'AnyFonts';
  font-size: 24px;
  box-sizing: border-box;
  padding: 2px 4px;
  background-image: linear-gradient(to right, #eee 1px, transparent 1px),
    linear-gradient(to bottom, #eee 1px, transparent 1px);
  background-size: 10px 10px;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  // background-position:-1px -1px;
  .loadbar {
  }
}
</style>
