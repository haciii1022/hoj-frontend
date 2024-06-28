<template>
  <Editor
    :value="value"
    :mode="mode"
    :plugins="plugins"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import { Editor, Viewer } from "@bytemd/vue-next";

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
  gfm(),
  highlight(),
  // 可以在此添加更多插件
];

/**
 * 给组件指定初始值
 */
// eslint-disable-next-line no-undef,@typescript-eslint/no-unused-vars
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
