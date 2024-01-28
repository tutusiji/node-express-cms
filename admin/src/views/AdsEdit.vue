<template>
  <div class="categoiesEdit">
    <h1 class="mainTitle">{{ id ? "编辑" : "新建" }}广告位</h1>
    <el-form label-width="120px" @submit.native.prevent="save">
      <el-form-item label="名称">
        <el-input v-model="model.name"></el-input>
      </el-form-item>

      <el-row type="flex" style="flex-wrap: wrap;" :gutter="20">
        <el-col :span="24" v-for="(item, index) in model.items" :key="index">
          <el-card shadow="hover" style="margin-bottom:20px">
            <el-form-item class="clearfix">
              <b>广告{{ index + 1 }}</b>

              <el-button
                style="float: right;"
                type="danger"
                size="small"
                @click="model.items.splice(index, 1)"
                >删除</el-button
              >
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="item.title"></el-input>
            </el-form-item>
            <el-form-item label="跳转链接URL">
              <el-input v-model="item.url"></el-input>
            </el-form-item>
            <el-form-item label="打开新窗口">
              <el-switch v-model="item.target"></el-switch>
            </el-form-item>
            <el-form-item label="图片">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :headers="getAuthHeaders()"
                :show-file-list="false"
                :on-success="(res) => $set(item, 'image', res.url)"
              >
                <!-- :before-upload="beforeAvatarUpload" -->
                <img v-if="item.image" :src="item.image" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-card>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button type="ghost" @click="model.items.push({})"
          ><i class="el-icon-plus"></i> 添加广告</el-button
        >
        <el-button type="primary" native-type="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    id: {},
  },
  data() {
    return {
      model: {
        items: [],
      },
    };
  },
  created() {
    this.id && this.fetch();
  },
  methods: {
    async save() {
      let res;
      if (this.id) {
        res = await this.$http.put(`rest/ads/${this.id}`, this.model);
      } else {
        res = await this.$http.post("rest/ads", this.model);
      }
      this.$router.push("/ads/list");
      this.$message({
        type: "success",
        message: "保存成功",
      });
    },
    async fetch() {
      const res = await this.$http.get(`rest/ads/${this.id}`);
      this.model = Object.assign({}, this.model, res.data);
    },
  },
};
</script>
<style>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
</style>
