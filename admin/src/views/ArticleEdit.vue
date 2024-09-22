<template>
  <div class="about">
    <h1 class="mainTitle">{{ id ? "编辑" : "新建" }}文章</h1>
    <el-form label-width="120px" @submit.native.prevent="save">
      <el-form-item label="所属分类">
        <el-select v-model="model.categories" multiple>
          <el-option
            v-for="item in categories"
            :key="item._id"
            :value="item._id"
            :label="item.name"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标题" style="width: 73%">
        <el-input v-model="model.title"></el-input>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="model.date"
          type="datetime"
          placeholder="选择日期"
        >
        </el-date-picker>
        <el-switch style="margin-left: 20px" v-model="model.dateDisplay">
        </el-switch>
        是否显示时间
      </el-form-item>
      <el-form-item label="作者" style="width: 340px">
        <el-input v-model="model.author"></el-input>
      </el-form-item>
      <el-form-item label="立即发布">
        <el-switch v-model="model.status"></el-switch>
      </el-form-item>
      <el-form-item label="是否单页">
        <el-switch v-model="model.single"></el-switch>
      </el-form-item>
      <el-form-item label="功能性插件">
        <el-input
          v-model="model.slotName"
          style="width: 220px; margin-right: 20px"
        ></el-input>
        <el-switch style="margin-left: 20px" v-model="model.slotStatus">
        </el-switch>
        是否开启
      </el-form-item>
      <el-form-item label="摘要">
        <el-input
          type="textarea"
          style="width: 72%; margin-right: 20px"
          :rows="6"
          placeholder="请输入内容"
          :maxlength="model.words"
          show-word-limit
          v-model="model.summary"
        >
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input
          type="textarea"
          style="width: 40%; margin-right: 20px"
          :rows="2"
          placeholder="提示语"
          v-model="model.prompt"
        >
        </el-input>
        字数：
        <el-input
          type="text"
          style="width: 68px; margin-right: 20px"
          v-model="model.words"
        >
        </el-input>
        <el-button @click="getGPT" :loading="gptStatus" type="primary" plain
          >ChatGPT</el-button
        >
        <div style="color: #999">
          标准提示语——将以下内容精简成文本，字数不超过
        </div>
      </el-form-item>
      <el-form-item label="文章标签">
        <el-select
          v-model="model.tags"
          multiple
          filterable
          style="width: 72%"
          allow-create
          default-first-option
          placeholder="请选择文章标签"
          @change="handleTagsChange"
        >
          <el-option
            v-for="item in tagsList"
            :key="item._id"
            :value="item._id"
            :label="item.name"
          >
            <span style="float: left">{{ item.name }}</span>
            <i
              class="el-icon-delete"
              style="float: right; margin: 10px 40px 0 0"
              @click.stop="() => delTag(item._id)"
            ></i>
          </el-option>
        </el-select>
        <!-- <el-button type="primary" plain style="margin-left: 20px;"
          >创建</el-button
        > -->
      </el-form-item>
      <el-form-item label="封面图片">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :headers="getAuthHeaders()"
          :show-file-list="false"
          :on-success="(res) => $set(model, 'coverImage', res.url)"
        >
          <!-- :before-upload="beforeAvatarUpload" -->
          <img v-if="model.coverImage" :src="model.coverImage" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">保存文章</el-button>
      </el-form-item>
      <el-form-item label="文章内容">
        <vue-editor
          v-model="model.body"
          useCustomImageHandler
          @image-added="handleImageAdded"
        ></vue-editor>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">保存文章</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";
import moment from "moment";
// import DOMPurify from 'dompurify';
// import { parseDocument } from 'htmlparser2';

export default {
  props: {
    id: {},
  },
  components: {
    VueEditor,
  },
  data() {
    return {
      model: {
        status: true,
        date: new Date(),
        dateDisplay: true,
        author: "",
        slotName: "",
        slotStatus: false,
        summary: "",
        coverImage: "",
        words: 400,
        prompt: "将以下内容精简成文本，字数不超过",
        tags: [],
      },
      tagsList: [],
      categories: [],
      gptStatus: false,
    };
  },
  created() {
    this.fetchCategories();
    this.id && this.fetch();
    this.getTags();
  },
  // watch: {
  //   model: {
  //     handler(newValue, oldValue) {
  //       console.log(newValue, oldValue);
  //       // this.model.prompt = `将以下内容精简成小于${newValue.words}字的文本——`;
  //     },
  //     deep: true,
  //   },
  // },
  methods: {
    async delTag(e) {
      console.log(e);
      const tagItem = this.tagsList.find((item) => item._id === e);
      const res = await this.$http.delete(`rest/tags/${e}`);
      this.$message({
        type: "success",
        message: `${tagItem.name}删除成功`,
      });
      this.getTags();
    },
    async handleTagsChange(e) {
      console.log("handleTagsChange", e);
      const tagsArr = new Set(this.tagsList.map((item) => item._id));
      const newTagsName = e.filter((tag) => !tagsArr.has(tag));
      console.log("TagsChange", newTagsName[0]);
      if (newTagsName[0]) {
        const { data } = await this.$http.post("rest/tags", {
          name: newTagsName[0],
        });
        console.log("createTags", data);
        this.tagsList.push(data);
        this.model.tags.map((item) => {
          if (item === data.name) {
            // aaa.splice(aaa.indexOf(item), 1, data._id);
            this.$set(this.model.tags, this.model.tags.indexOf(item), data._id);
            this.$forceUpdate();
          }
        });
        console.log("last=====================", this.model.tags);
      }
    },
    async getTags() {
      const { data } = await this.$http.get("rest/tags");
      console.log("getTags", data);
      this.tagsList = data;
    },
    async save() {
      this.model.body = this.processRichText(this.model.body);
      let res;
      this.model.date = moment(this.model.date).format("YYYY-MM-DD HH:mm:ss");
      if (this.id) {
        res = await this.$http.put(`rest/articles/${this.id}`, this.model);
      } else {
        res = await this.$http.post("rest/articles", this.model);
      }
      this.$router.push("/articles/list");
      this.$message({
        type: "success",
        message: "保存成功",
      });
    },
    async fetch() {
      const res = await this.$http.get(`rest/articles/${this.id}`);
      // this.model = res.data;
      this.model = Object.assign({}, this.model, res.data);
    },
    async fetchCategories() {
      const res = await this.$http.get(`rest/categories`);
      this.categories = res.data;
    },
    async handleImageAdded(file, Editor, cursorLocation, resetUploader) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await this.$http.post("upload", formData);
      Editor.insertEmbed(cursorLocation, "image", res.data.url);
      resetUploader();
    },
    convertRichTextToPlainText(html) {
      // 创建一个新的 div 元素，用于临时存储富文本内容
      var tempDiv = document.createElement("div");
      // 设置富文本内容
      tempDiv.innerHTML = html;
      // 获取并返回纯文本内容
      return tempDiv.textContent || tempDiv.innerText || "";
    },
    async getGPT() {
      this.gptStatus = true;
      // const summaryText = this.model.body.replace(/<[^>]*>/g, "");
      const summaryText = this.convertRichTextToPlainText(this.model.body);
      const res = await this.$http.post(`rest/articles/${this.id}/summary`, {
        prompt: `${this.model.prompt}${this.model.words}—— \n`,
        summaryText: `${this.model.title}——${summaryText}`,
      });
      this.model.summary = JSON.parse(res.data).result;
      this.gptStatus = false;
    },
    processRichText(htmlString) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const preTags = doc.querySelectorAll("pre");

      preTags.forEach((pre) => {
        // 检查pre标签下是否已经有code标签
        if (!pre.querySelector("code")) {
          const code = document.createElement("code");
          code.className = "language-js line-numbers";
          code.innerHTML = pre.innerHTML;
          pre.innerHTML = "";
          pre.appendChild(code);
        }
      });

      return doc.body.innerHTML;
    },
  },
};
</script>

<style>
pre.ql-syntax code {
  background-color: transparent !important;
}
</style>
