<template>
  <div class="categoiesEdit">
    <h1 class="mainTitle">全站配置</h1>
    <el-form label-width="120px" @submit.native.prevent="save">
      <el-form-item label="网站名称">
        <el-input v-model="model.title" style="width: 300px"></el-input>
      </el-form-item>
      <el-form-item label="slogan">
        <el-input v-model="model.slogan" style="width: 380px"></el-input>
      </el-form-item>
      <el-row>
        <el-col :span="7"
          ><el-form-item label="站点名称ico图标">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="getAuthHeaders()"
              :show-file-list="false"
              :on-success="afterIconUpload"
            >
              <!-- :before-upload="beforeAvatarUpload" -->
              <img v-if="model.icon" :src="model.icon" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload> </el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item label="背景图">
            <el-upload
              class="avatar-uploader banner"
              :action="uploadUrl"
              :headers="getAuthHeaders()"
              :show-file-list="false"
              :on-success="afterBannerUpload"
            >
              <!-- :before-upload="beforeAvatarUpload" -->
              <img v-if="model.banner" :src="model.banner" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload> </el-form-item
        ></el-col>
      </el-row>

      <el-form-item label="Welcome">
        <el-input v-model="model.welcome" style="width: 450px"></el-input>
      </el-form-item>
      <el-form-item label="CoryRight" style="width: 450px;">
        <el-input v-model="model.coryright"></el-input>
      </el-form-item>
      <el-form-item label="备案号" style="width: 450px;">
        <el-input v-model="model.beian"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">保存站点信息</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      model: {
        title: "",
        slogen: "",
        summary: "",
        icon: "",
        banner: "",
        welcome: "",
        coryright: "",
        beian: "",
      },
    };
  },
  created() {
    this.fetch();
  },
  methods: {
    afterIconUpload(res) {
      console.log(res);
      this.$set(this.model, "icon", res.url);
    },
    afterBannerUpload(res) {
      console.log(res);
      this.$set(this.model, "banner", res.url);
    },
    async save() {
      console.log(this.model);
      const res = await this.$http.post("rest/sites/webInfo", this.model);
      this.$message({
        type: "success",
        message: "保存成功",
      });
    },
    async fetch() {
      const res = await this.$http.get(`rest/sites/webInfo`);
      this.model = res.data;
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.banner .avatar-uploader-icon {
  width: 300px;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 100%;
  height: 178px;
  display: block;
}
</style>
