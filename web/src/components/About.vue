<template>
  <div class="articleTitle" v-html="data.title"></div>
  <div class="articleDate pb-4 text-[#999] text-center text-[14px] italic">
    {{ dayjs(data.date).format("YYYY-MM-DD ") }}
  </div>
  <div class="articleDetails" v-html="data.body"></div>
</template>

<script lang="ts" setup>
import { articleDetail } from "../http/api";
import dayjs from "dayjs";

type data = {
  body: String;
  title: String;
  date: String;
};
const data = ref<data>({
  body: "",
  title: "",
  date: "",
});
const fetchData = async () => {
  const res = await articleDetail('658a87b41a9e685c9acdbff9');
  data.value = res;
};
fetchData();
</script>

<style  lang="scss">
.articleTitle {
  padding: 20px 0;
  font-weight: 700;
  text-align: center;
}
.back {
  width: 100px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px dashed #888787;
  margin: 30px auto 30px;
  cursor: pointer;
  color: #666;
  &:hover {
    background-color: #f1f1f1;
  }
}
pre{
  background-color: #000;
  color: #d7d5d5;
  overflow: auto;
}
</style>
