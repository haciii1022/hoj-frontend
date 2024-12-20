<template>
  <Viewer :value="value" :plugins="plugins" />
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from "vue";
// import "bytemd/dist/index.css";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import math from "@bytemd/plugin-math";
import { Viewer } from "@bytemd/vue-next";
import "katex/dist/katex.css";
import "juejin-markdown-themes/dist/juejin.min.css";
import "bytemd/dist/index.css";
import "highlight.js/styles/default.css";
// import "highlight.js/styles/vs.css";
// import "@bytemd/plugin-math/locales/zh_Hans.json";
import "bytemd/locales/zh_Hans.json";
import { codeCopyPlugin } from "@/plugin/AddCopyButtonPlugin";

/**
 * 定义组件属性类型
 */
interface Props {
  value: string;
}

// 初始化插件数组
const plugins = [math(), gfm(), highlight(), codeCopyPlugin()];
// copyCode({
//   copySuccess: (text) => {
//     console.log("复制成功: " + text);
//   },
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   copyError: (err) => {},
//   copyRight: "",
// }),
/**
 * 给组件指定初始值
 */
// eslint-disable-next-line no-undef,@typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  value: "",
});
</script>

<style>
.bytemd-toolbar-icon.bytemd-tippy.bytemd-tippy-right:last-child {
  display: none;
}
</style>
