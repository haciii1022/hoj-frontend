<template>
  <MdViewer :value="val" />
</template>
<script setup lang="ts">
import MdViewer from "@/components/MdViewer.vue";
import { defineProps, onMounted, ref, watch, withDefaults } from "vue";

/**
 * 定义组件属性类型
 */
interface Props {
  code: string;
  language: string;
}

const val = ref("");
const props = withDefaults(defineProps<Props>(), {
  code: "",
  language: "",
});
// 计算 val 的值
val.value = "```" + props.language + "\n" + props.code + "\n```";

// 监听 props 的变化
watch(
  () => props,
  (newProps) => {
    val.value = "```" + newProps.language + "\n" + newProps.code + "\n```";
    console.log(val.value);
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
:deep(.markdown-body) {
  border-radius: 8px;
  overflow: hidden;
}
</style>
