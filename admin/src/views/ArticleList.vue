<template>
  <div>
    <H1 class="mainTitle">文章列表</H1>
    <el-table :data="items">
      <el-table-column prop="_id" label="ID" width="220"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="date" label="创建时间"></el-table-column>
      <el-table-column label="操作" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="$router.push(`/articles/edit/${scope.row._id}`)"
            >编辑</el-button
          >
          <el-button size="mini" type="text" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="block" style="padding: 20px;">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
// import moment from "moment";

export default {
  data() {
    return {
      items: [],
      total: 1,
      currentPage: 1,
      limitPage: 10,
    };
  },
  computed: {
    // transDate(val) {
    //   return moment(val).format("YYYY-MM-DD HH:mm:ss");
    // },
  },
  created() {
    this.fetch();
  },
  methods: {
    async fetch() {
      const res = await this.$http.post("rest/articles/list", {
        page: this.currentPage,
        limit: this.limitPage,
      });
      this.items = res.data.list;
      this.total = res.data.totalItems;
    },

    async handleDelete(row) {
      this.$confirm(`是否确定删除文章“${row.title}”?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await this.$http.delete(`rest/articles/${row._id}`);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
        this.fetch();
      });
    },

    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
      this.fetch();
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.limitPage = val;
      this.fetch();
    },
  },
};
</script>
