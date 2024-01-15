<template>
  <div class="about">
    <h1 class="mainTitle">Web全站字体包管理</h1>
    <el-form label-width="120px">
      <el-form-item label="字体包文件" style="width:500px">
        <el-upload
          class="upload-demo"
          drag
          :action="this.$http.defaults.baseURL + '/uploadFonts'"
          :headers="getAuthHeaders()"
          :on-success="afterUpload"
          :multiple="false"
          :limit="1"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">
            只能上传.ttf格式字体包,且只能传一个字体包
          </div>
        </el-upload>
      </el-form-item>
      <el-form-item label="打包文字">
        <el-input
          type="textarea"
          :rows="10"
          placeholder="请输入所需要提取的文字"
          style="width: 60%;"
          show-word
          v-model="words"
        >
        </el-input>
        <div style="color: #999;">
          全站提取目前只提取导航菜单、文章标题、logo文字、slogan、welcome
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getWords" :loading="fontStatus" plain
          >全站文本提取</el-button
        >
        <el-button type="primary" @click="createFonts"
          >生成并部署字体包</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import moment from "moment";

export default {
  data() {
    return {
      words: "",
      fontStatus: false,
      fileList: [],
      current: 1,
    };
  },
  created() {},
  methods: {
    async getWords() {
      this.fontStatus = true;
      let res;
      res = await this.$http.get(`rest/sites/webInfo`); // 站点信息
      const { slogan, title, welcome } = res.data;
      this.words = slogan + title + welcome + "";
      res = await this.$http.get("rest/categories");
      const cates = res.data.map((item) => item.name).join("");
      this.words += cates;
      this.fetchArticle();
    },
    removeDuplicateCharacters(str) {
      const uniqueChars = new Set(str.split(""));
      // 将唯一字符数组连接回字符串
      return Array.from(uniqueChars).join("");
    },
    afterUpload(res) {
      console.log(res);
    },
    async createFonts() {
      const res = await this.$http.post("rest/sites/webFonts", {
        words: this.words,
      });
    },
    async fetchArticle(page = 1) {
      const res = await this.$http.post("rest/articles/list", {
        page,
        limit: 10,
      });
      console.log(res.data);
      this.words += res.data.list.map((item) => item.title).join("");

      if (page < res.data.totalPages) {
        this.fetchArticle(page + 1);
      } else {
        // this.words = await this.removeDuplicateCharacters(this.words);
        this.fontStatus = false;
      }
    },
  },
};
</script>
