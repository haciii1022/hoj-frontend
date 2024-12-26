<template>
  <Editor
    :value="value"
    :mode="mode"
    :plugins="plugins"
    :locale="zhHans"
    :editorConfig="{
      lineNumbers: false,
      autofocus: false,
    }"
    class="custom-editor"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from "vue";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import math from "@bytemd/plugin-math";
import { codeCopyPlugin } from "@/plugin/AddCopyButtonPlugin";
import { Editor, Viewer } from "@bytemd/vue-next";
import zhHans from "bytemd/locales/zh_Hans.json";
import mathZhHans from "@bytemd/plugin-math/locales/zh_Hans.json";
import gfmZhHans from "@bytemd/plugin-gfm/locales/zh_Hans.json";
// import "katex/dist/katex.css";
// import "highlight.js/styles/atom-one-dark.min.css";
// import "juejin-markdown-themes/dist/juejin.min.css";
import "bytemd/dist/index.css";
// import "highlight.js/styles/vs.css";

/**
 * 定义组件属性类型
 */
interface Props {
  value: string;
  mode: string;
  handleChange: (v: string) => void;
}

// 初始化插件数组
const plugins = [
  gfm({
    locale: gfmZhHans,
  }),
  highlight(),
  math({
    locale: mathZhHans,
  }),
  codeCopyPlugin(),
];

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {
  value: "",
  mode: "split",
  handleChange: (v: string) => {
    console.log(v);
  },
});
</script>

<style>
.katex-display {
  margin: 0; /* 去掉默认的上下外边距 */
}

.katex {
  line-height: normal; /* 调整行高 */
}
</style>
