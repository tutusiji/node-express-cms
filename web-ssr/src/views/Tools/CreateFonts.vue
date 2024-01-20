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
    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
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
      <div class="previewfonts">
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
import { createFonts } from '../../http/api';

const textarea = ref('字体包子集在线抽取');
const fontOriginName = ref('');
const loading = ref(false);

const baseURL = import.meta.env.VITE_BASE_URL;

function loadFont(fontName, fontUrl) {
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
  font-family: 'AnyFonts';
  font-size: 20px;
}
</style>
