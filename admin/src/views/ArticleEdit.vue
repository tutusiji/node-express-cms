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
      <el-form-item label="标题">
        <el-input v-model="model.title"></el-input>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="model.date"
          type="datetime"
          placeholder="选择日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="详情">
        <vue-editor
          v-model="model.body"
          useCustomImageHandler
          @image-added="handleImageAdded"
        ></vue-editor>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { VueEditor } from "vue2-editor";
import moment from "moment";

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
        date: new Date(),
      },
      categories: [],
    };
  },
  created() {
    this.fetchCategories();
    this.id && this.fetch();
  },
  methods: {
    async save() {
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
  },
};
</script>
