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
      <div v-loading="loadfont" element-loading-text="正在导入字体..." class="previewfonts">
        {{ textarea }}
      </div>
    </el-col>
  </el-row>
  <div class="flex items-center justify-center my-4">
    <el-button size="large" type="primary" :icon="EditPen" :loading="loading" @click="fetchfonts">
      生成字体子集
    </el-button>
  </div>
  <h3 class="text-[18px] font-bold py-4">使用：</h3>
  <pre>
<code class="language-css line-numbers">@font-face {
  font-family: 'CustomFont';
  src: url('../assets/fonts/CustomFont.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}</code>
</pre>
</template>

<script lang="ts" setup>
import Prism from 'prismjs'; // 代码高亮插件的core
import 'prismjs/themes/prism-tomorrow.min.css'; // 高亮主题
import { UploadFilled } from '@element-plus/icons-vue';
import { EditPen } from '@element-plus/icons-vue';
import FontFaceObserver from 'fontfaceobserver';
import { createFonts } from '../../http/api';

const textarea = ref('字体包子集在线抽取');
const fontOriginName = ref('');
const loading = ref(false);
const loadfont = ref(false);

const baseURL = import.meta.env.VITE_BASE_URL;

function loadFont(fontName, fontUrl) {
  loadfont.value = true;
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
      loadfont.value = false;
    })
    .catch((error) => {
      console.error('Font loading failed', error);
      loadfont.value = false;
    });
}

const fetchfonts = async () => {
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

const afterUpload = (res) => {
  console.log('res', res);
  loadFont('AnyFonts', `${res.url}?v=${new Date().getTime()}`);
  fontOriginName.value = res.filename;
};

onMounted(() => {
  Prism.highlightAll();
});
</script>

<style lang="scss">
// @font-face {
//   font-family: 'AnyFonts';
//   src: url('http://localhost:3000/uploads/fonts/文鼎中隶-lite.ttf') format('truetype');
//   font-style: normal;
//   font-weight: normal;
// }

.previewfonts {
  height: 220px;
  font-family: 'AnyFonts';
  font-size: 20px;
  box-sizing: border-box;
  padding: 2px 4px;
   background-image: linear-gradient(to right, #eee 1px, transparent 1px),
                    linear-gradient(to bottom, #eee 1px, transparent 1px);
  background-size: 10px 10px;
  border-bottom:1px solid #eee;
  // background-position:-1px -1px;
}
</style>
