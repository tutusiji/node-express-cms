<template>
  <h3 class="text-[18px] font-bold py-4">上传字体包：</h3>
  <el-upload
    ref="upload"
    v-model:file-list="fileList"
    class="upload-demo"
    drag
    :action="`${baseURL}/uploadFonts`"
    :on-success="afterUpload"
    :multiple="false"
    :limit="1"
    :on-exceed="handleExceed"
    :auto-upload="false"
    :before-upload="beforeUpload"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">拖拽文件到这里 or <em>点击上传</em></div>
    <template #tip>
      <div class="el-upload__tip">当前只支持ttf格式的字体文件上传，每次只能传一个字体包</div>
    </template>
  </el-upload>
  <div class="flex items-center justify-center my-10">
    <el-button
      size="large"
      type="primary"
      :icon="UploadFilled"
      :loading="loadfontStatus"
      @click="submitUpload"
    >
      上传字体包
    </el-button>
  </div>
  <el-row :gutter="20">
    <el-col :span="12" class="relative">
      <h3 class="text-[18px] font-bold py-4">输入文字：</h3>
      <el-input
        v-model="textarea"
        placeholder="输入预览文字、符号"
        rows="10"
        clearable
        type="textarea"
      />
      <span class="absolute bottom-0 right-7 text-[12px] pointer-events-none"
        >{{ textarea.length }} 字</span
      >
    </el-col>
    <el-col :span="12">
      <h3 class="text-[18px] font-bold py-4">字体预览：</h3>
      <div v-loading="loadfontStatus" element-loading-text="正在导入字体..." class="previewfonts">
        <div v-show="fontprogress !== 100" class="loadbar">
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="fontprogress"
            striped
            striped-flow
          >
            <div class="progress mt-[-8px]">本地字体包正在加载{{ fontprogress }}%</div>
          </el-progress>
        </div>
        <div class="px-[4px] py-[2px]">{{ textarea }}</div>
      </div>
    </el-col>
  </el-row>
  <div class="flex items-center justify-center my-10">
    <el-button
      size="large"
      type="primary"
      :icon="EditPen"
      :loading="loading"
      @click="onUploadfonts"
    >
      生成字体子集包
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import Prism from 'prismjs'; // 代码高亮插件的core
import 'prismjs/themes/prism-tomorrow.min.css'; // 高亮主题
import FontFaceObserver from 'fontfaceobserver';
import { createFonts } from '../../http/api';
// import { ElMessage } from 'element-plus';
import { EditPen, UploadFilled } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import 'element-plus/theme-chalk/el-notification.css';
import { genFileId } from 'element-plus';
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus';

const upload = ref<UploadInstance>();

const fileList = ref<UploadUserFile[]>([]);

const textarea = ref('这是一个Web在线字体包子集抽取工具，欢迎使用！！！');
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
    .load(null, 60000) // 等待60秒
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
      type: 'warning',
      offset: 100
    });
    return;
  }

  loading.value = true;

  const res = await createFonts({
    words: textarea.value,
    fontOriginName: fontOriginName.value
  });
  // console.log('res----', res);
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

const totalBytes = 6.99 * 1024 * 1024; // 6.99 MB
const blobUrl = ref<string>('');

function fetchFontProgress(url, onProgress, totalBytes) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }

        const contentLength = response.headers.get('Content-Length') || totalBytes;
        let receivedBytes = 0;
        let chunks = []; // 用于存储接收到的数据块

        const reader = response.body.getReader();

        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              // 所有数据块已接收，合并它们并创建一个 Blob
              let blob = new Blob(chunks, { type: 'font/ttf' }); // 确保指定正确的MIME类型
              // console.log(blob, URL.createObjectURL(blob));
              blobUrl.value = URL.createObjectURL(blob);
              resolve();
              return;
            }

            // 更新进度并存储数据块
            receivedBytes += value.length;
            chunks.push(value);
            const progress = (receivedBytes / contentLength) * 100;
            onProgress(progress);

            // 继续读取下一部分
            read();
          });
        }

        read(); // 开始读取流
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        reject(error);
      });
  });
}

// 使用 fetchFontProgress 函数...

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const submitUpload = () => {
  console.log(fileList.value);
  if (!fileList.value.length) {
    ElNotification({
      title: '提示',
      message: '请上传一个.ttf格式的字体文件',
      type: 'warning',
      offset: 80
    });
    return false;
  }
  upload.value!.submit();
};

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // console.log('rawFile====================', rawFile);
  // 检查文件类型
  // const isTTF = file.type === 'font/ttf' || file.type === 'application/x-font-ttf';
  // 或者通过文件扩展名检查
  const isTTFExtension = rawFile.name.endsWith('.ttf' || '.TTF');
  if (!isTTFExtension) {
    ElNotification({
      title: '提示',
      message: '只能上传 .ttf 格式的字体文件',
      type: 'warning',
      offset: 80
    });
    return false;
  }
  // 定义允许的最大文件大小（例如，5MB）
  const maxSizeInMB = 25;
  const isValidSize = rawFile.size / 1024 / 1024 < maxSizeInMB;

  if (!isValidSize) {
    ElNotification({
      title: '提示',
      message: `文件大小不能超过 ${maxSizeInMB}MB`,
      type: 'warning',
      offset: 80
    });
    return false;
  }
  return true;
};

const afterUpload = (res) => {
  // console.log('res', res);
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
      // console.log(`Progress: ${num}%`);
    },
    totalBytes
  )
    .then(() => {
      // const fontBlobUrl = URL.createObjectURL(blob);
      const newStyle = document.createElement('style');
      newStyle.appendChild(
        document.createTextNode(`
      @font-face {
        font-family: 'AnyFonts';
        src: url('${blobUrl.value}') format('truetype');
        font-style: normal;
        font-weight: normal;
      }
    `)
      );
      document.head.appendChild(newStyle);
    })
    .catch((error) => {
      console.error('Error loading font:', error);
    });
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
  font-size: 22px;
  line-height: 1.4;
  box-sizing: border-box;
  background-image: linear-gradient(to right, #eee 1px, transparent 1px),
    linear-gradient(to bottom, #eee 1px, transparent 1px);
  background-size: 10px 10px;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  overflow-y: auto;
}
</style>

<style lang="scss">
.previewfonts {
  .el-progress-bar__inner,
  .el-progress-bar__outer {
    border-radius: 0 !important;
  }
}
</style>
