<template>
  <Editor
    :value="value"
    :mode="mode"
    :plugins="plugins"
    :locale="zhHans"
    class="custom-editor"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from "vue";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import math from "@bytemd/plugin-math";
import { Editor, Viewer } from "@bytemd/vue-next";
import zhHans from "bytemd/locales/zh_Hans.json";
import "katex/dist/katex.css";
import "highlight.js/styles/atom-one-dark.min.css";
import "bytemd/dist/index.css";
import { codeCopyPlugin } from "@/plugin/AddCopyButtonPlugin";
// import "highlight.js/styles/vs.css";
// import "@bytemd/plugin-math/locales/zh_Hans.json";
// import "bytemd/locales/zh_Hans.json";
/**
 * 定义组件属性类型
 */
interface Props {
  value: string;
  mode: string;
  handleChange: (v: string) => void;
}

// 初始化插件数组
const plugins = [gfm(), highlight(), math(), codeCopyPlugin()];

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
.bytemd-toolbar-icon.bytemd-tippy.bytemd-tippy-right:last-child {
  display: none;
}
</style>
